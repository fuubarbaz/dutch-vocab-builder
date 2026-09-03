import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word } from '@/types';

export type MistakeSource = 'quiz' | 'vocab-session' | 'roleplay';

export interface MistakeEntry {
  /** Vocabulary word id, or a hash of the sentence for roleplay entries. */
  wordId: string;
  /** The word — or, for roleplay, the sentence the learner actually wrote. */
  dutch: string;
  /** The translation — or, for roleplay, the corrected sentence. */
  english: string;
  source: MistakeSource;
  wrongCount: number;
  lastWrongAt: string; // ISO timestamp
  resolved: boolean;
  /** Roleplay only: short explanation of what was wrong. */
  note?: string;
  /** Roleplay only: the scene it came from. */
  scenario?: string;
}

export interface SentenceMistake {
  original: string;
  corrected: string;
  note?: string;
  scenario?: string;
}

/**
 * Stable id for a sentence mistake, so making the same error twice increments the
 * count instead of stacking duplicate cards.
 */
function sentenceId(original: string): string {
  const s = original.trim().toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `rp${(h >>> 0).toString(36)}`;
}

interface MistakeJournalContextType {
  mistakes: MistakeEntry[];
  unresolvedCount: number;
  logMistake: (word: Word, source: MistakeSource) => Promise<void>;
  logSentenceMistake: (mistake: SentenceMistake) => Promise<void>;
  markResolved: (wordId: string) => Promise<void>;
  remove: (wordId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const STORAGE_KEY = 'mistake_journal_v1';

const MistakeJournalContext = createContext<MistakeJournalContextType | undefined>(undefined);

export const MistakeJournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setMistakes(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to load mistake journal', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes)).catch(e =>
      console.error('Failed to persist mistake journal', e),
    );
  }, [mistakes, isLoaded]);

  const logMistake = useCallback(async (word: Word, source: MistakeSource) => {
    const now = new Date().toISOString();
    setMistakes(prev => {
      const existing = prev.find(m => m.wordId === word.id);
      if (existing) {
        return prev.map(m =>
          m.wordId === word.id
            ? { ...m, wrongCount: m.wrongCount + 1, lastWrongAt: now, resolved: false, source }
            : m,
        );
      }
      return [
        ...prev,
        {
          wordId: word.id,
          dutch: word.dutch,
          english: word.english,
          source,
          wrongCount: 1,
          lastWrongAt: now,
          resolved: false,
        },
      ];
    });
  }, []);

  const logSentenceMistake = useCallback(async (mistake: SentenceMistake) => {
    const now = new Date().toISOString();
    const id = sentenceId(mistake.original);
    setMistakes(prev => {
      const existing = prev.find(m => m.wordId === id);
      if (existing) {
        return prev.map(m =>
          m.wordId === id
            ? {
                ...m,
                english: mistake.corrected,
                note: mistake.note,
                scenario: mistake.scenario,
                wrongCount: m.wrongCount + 1,
                lastWrongAt: now,
                resolved: false,
              }
            : m,
        );
      }
      return [
        ...prev,
        {
          wordId: id,
          dutch: mistake.original,
          english: mistake.corrected,
          note: mistake.note,
          scenario: mistake.scenario,
          source: 'roleplay' as const,
          wrongCount: 1,
          lastWrongAt: now,
          resolved: false,
        },
      ];
    });
  }, []);

  const markResolved = useCallback(async (wordId: string) => {
    setMistakes(prev => prev.map(m => (m.wordId === wordId ? { ...m, resolved: true } : m)));
  }, []);

  const remove = useCallback(async (wordId: string) => {
    setMistakes(prev => prev.filter(m => m.wordId !== wordId));
  }, []);

  const clearAll = useCallback(async () => {
    setMistakes([]);
  }, []);

  const unresolvedCount = mistakes.filter(m => !m.resolved).length;

  return (
    <MistakeJournalContext.Provider
      value={{ mistakes, unresolvedCount, logMistake, logSentenceMistake, markResolved, remove, clearAll }}
    >
      {children}
    </MistakeJournalContext.Provider>
  );
};

export const useMistakeJournal = () => {
  const ctx = useContext(MistakeJournalContext);
  if (!ctx) throw new Error('useMistakeJournal must be used within MistakeJournalProvider');
  return ctx;
};
