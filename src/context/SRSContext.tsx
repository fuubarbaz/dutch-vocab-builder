import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WordSRSData, DEFAULT_SRS_DATA, calculateNextReview, isDue, todayISO } from '@/utils/srs';
import { Word } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionEntry {
  date: string;    // YYYY-MM-DD
  wordId: string;
  quality: number; // 2=Hard, 3=Good, 5=Easy
}

export interface SRSStats {
  dueToday: number;
  streak: number;          // consecutive days with ≥1 review
  totalReviewed: number;   // unique words reviewed all-time
  weeklyAccuracy: number;  // 0–100, % of quality≥3 in last 7 days
}

interface SRSContextType {
  srsData: Record<string, WordSRSData>;
  sessionLog: SessionEntry[];
  stats: SRSStats;
  getSRSData: (wordId: string) => WordSRSData;
  recordReview: (wordId: string, quality: number) => Promise<void>;
  getDueWords: (words: Word[]) => Word[];
  resetSRS: () => Promise<void>;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const SRS_KEY = 'srs_data_v1';
const SESSION_LOG_KEY = 'srs_session_log_v1';

// ─── Stats Computation ────────────────────────────────────────────────────────

function computeStats(
  data: Record<string, WordSRSData>,
  log: SessionEntry[]
): SRSStats {
  const today = todayISO();

  const dueToday = Object.values(data).filter(d => d.nextReview <= today).length;

  const totalReviewed = Object.values(data).filter(d => d.repetitions > 0).length;

  // Weekly accuracy
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString().split('T')[0];
  const recentLog = log.filter(e => e.date >= cutoff);
  const weeklyAccuracy =
    recentLog.length > 0
      ? Math.round((recentLog.filter(e => e.quality >= 3).length / recentLog.length) * 100)
      : 0;

  // Streak: count consecutive days back from today with ≥1 review
  const reviewDays = new Set(log.map(e => e.date));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const dateStr = cursor.toISOString().split('T')[0];
    if (reviewDays.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return { dueToday, streak, totalReviewed, weeklyAccuracy };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SRSContext = createContext<SRSContextType | undefined>(undefined);

export const SRSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [srsData, setSrsData] = useState<Record<string, WordSRSData>>({});
  const [sessionLog, setSessionLog] = useState<SessionEntry[]>([]);
  const [stats, setStats] = useState<SRSStats>({
    dueToday: 0,
    streak: 0,
    totalReviewed: 0,
    weeklyAccuracy: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const [rawSRS, rawLog] = await Promise.all([
          AsyncStorage.getItem(SRS_KEY),
          AsyncStorage.getItem(SESSION_LOG_KEY),
        ]);
        const parsedSRS: Record<string, WordSRSData> = rawSRS ? JSON.parse(rawSRS) : {};
        const parsedLog: SessionEntry[] = rawLog ? JSON.parse(rawLog) : [];
        setSrsData(parsedSRS);
        setSessionLog(parsedLog);
        setStats(computeStats(parsedSRS, parsedLog));
      } catch (e) {
        console.error('Failed to load SRS data', e);
      }
    })();
  }, []);

  const getSRSData = useCallback(
    (wordId: string): WordSRSData => srsData[wordId] ?? DEFAULT_SRS_DATA(wordId),
    [srsData]
  );

  const recordReview = useCallback(
    async (wordId: string, quality: number) => {
      const current = srsData[wordId] ?? DEFAULT_SRS_DATA(wordId);
      const updated = calculateNextReview(current, quality);
      const newSRS = { ...srsData, [wordId]: updated };
      const newEntry: SessionEntry = { date: todayISO(), wordId, quality };
      const newLog = [...sessionLog, newEntry];

      setSrsData(newSRS);
      setSessionLog(newLog);
      setStats(computeStats(newSRS, newLog));

      try {
        await Promise.all([
          AsyncStorage.setItem(SRS_KEY, JSON.stringify(newSRS)),
          AsyncStorage.setItem(SESSION_LOG_KEY, JSON.stringify(newLog)),
        ]);
      } catch (e) {
        console.error('Failed to persist SRS review', e);
      }
    },
    [srsData, sessionLog]
  );

  const getDueWords = useCallback(
    (words: Word[]): Word[] => {
      const today = todayISO();
      return words.filter(w => {
        const d = srsData[w.id];
        return !d || d.nextReview <= today; // never reviewed = due
      });
    },
    [srsData]
  );

  const resetSRS = useCallback(async () => {
    setSrsData({});
    setSessionLog([]);
    setStats({ dueToday: 0, streak: 0, totalReviewed: 0, weeklyAccuracy: 0 });
    await Promise.all([
      AsyncStorage.removeItem(SRS_KEY),
      AsyncStorage.removeItem(SESSION_LOG_KEY),
    ]);
  }, []);

  return (
    <SRSContext.Provider
      value={{ srsData, sessionLog, stats, getSRSData, recordReview, getDueWords, resetSRS }}
    >
      {children}
    </SRSContext.Provider>
  );
};

export const useSRS = () => {
  const ctx = useContext(SRSContext);
  if (!ctx) throw new Error('useSRS must be used within SRSProvider');
  return ctx;
};
