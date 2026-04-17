import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet, View, Text, Pressable, ScrollView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, BookOpen, Globe } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { KNM_TOPICS, KNMLanguage, KNMTopic } from '@/data/knm_topics';
import { useSettings } from '@/context/SettingsContext';
import { speakInLanguage, stopTTS } from '@/utils/tts';

// ─── Audiobook helpers ────────────────────────────────────────────────────────

interface AudioSegment {
  text: string;
  label: string;
}

function getTopicSegments(topic: KNMTopic, lang: KNMLanguage): AudioSegment[] {
  const segments: AudioSegment[] = [];

  // Topic announcement
  segments.push({
    text: lang === 'en' ? `Topic: ${topic.title.en}.` : `Onderwerp: ${topic.title.nl}.`,
    label: lang === 'en' ? 'Introduction' : 'Introductie',
  });

  // Explanation — split on blank lines for natural pacing
  topic.explanation[lang]
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .forEach(para => {
      segments.push({ text: para, label: lang === 'en' ? 'Explanation' : 'Uitleg' });
    });

  // Key points
  segments.push({
    text: lang === 'en' ? 'Key points to remember.' : 'Belangrijkste punten om te onthouden.',
    label: lang === 'en' ? 'Key Points' : 'Kernpunten',
  });
  topic.keyPoints.forEach((kp, i) => {
    segments.push({
      text: `${i + 1}. ${kp[lang]}`,
      label: lang === 'en' ? 'Key Points' : 'Kernpunten',
    });
  });

  // Examples
  if (topic.examples.length > 0) {
    segments.push({
      text: lang === 'en' ? 'Examples.' : 'Voorbeelden.',
      label: lang === 'en' ? 'Examples' : 'Voorbeelden',
    });
    topic.examples.forEach(ex => {
      segments.push({ text: ex[lang], label: lang === 'en' ? 'Examples' : 'Voorbeelden' });
    });
  }

  return segments;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function KNMScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { speechRate } = useSettings();

  // Page language (for browsing topics)
  const [language, setLanguage] = useState<KNMLanguage>('en');

  // Audiobook UI state
  const [audiobookActive, setAudiobookActive] = useState(false);
  const [audiobookLang, setAudiobookLang] = useState<KNMLanguage>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTopicIdx, setCurrentTopicIdx] = useState(0);
  const [currentSegmentLabel, setCurrentSegmentLabel] = useState('');

  // Refs — stable references for use inside speech callbacks
  const isPlayingRef = useRef(false);
  const currentTopicIdxRef = useRef(0);
  const currentSegmentIdxRef = useRef(0);
  const audiobookLangRef = useRef<KNMLanguage>('en');
  const speechRateRef = useRef(speechRate);

  useEffect(() => { speechRateRef.current = speechRate; }, [speechRate]);
  useEffect(() => { audiobookLangRef.current = audiobookLang; }, [audiobookLang]);

  // Stop audio when screen unmounts
  useEffect(() => () => { isPlayingRef.current = false; stopTTS(); }, []);

  // ── Core playback ────────────────────────────────────────────────────────

  const playNextSegment = useCallback(() => {
    if (!isPlayingRef.current) return;

    const topicIdx = currentTopicIdxRef.current;

    // Finished all topics
    if (topicIdx >= KNM_TOPICS.length) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      currentTopicIdxRef.current = 0;
      currentSegmentIdxRef.current = 0;
      setCurrentTopicIdx(0);
      setCurrentSegmentLabel('');
      return;
    }

    const segIdx = currentSegmentIdxRef.current;
    const topic = KNM_TOPICS[topicIdx];
    const lang = audiobookLangRef.current;
    const segments = getTopicSegments(topic, lang);

    // Advance to next topic
    if (segIdx >= segments.length) {
      const next = topicIdx + 1;
      currentTopicIdxRef.current = next;
      currentSegmentIdxRef.current = 0;
      setCurrentTopicIdx(next);
      setTimeout(playNextSegment, 700);
      return;
    }

    const segment = segments[segIdx];
    setCurrentSegmentLabel(segment.label);

    speakInLanguage(segment.text, lang, speechRateRef.current, {
      onDone: () => {
        currentSegmentIdxRef.current = segIdx + 1;
        setTimeout(playNextSegment, 150);
      },
      onStopped: () => { /* deliberately paused — don't advance */ },
      onError: () => {
        currentSegmentIdxRef.current = segIdx + 1;
        setTimeout(playNextSegment, 200);
      },
    });
  }, []);

  // ── Controls ─────────────────────────────────────────────────────────────

  const startAudiobook = useCallback(() => {
    currentTopicIdxRef.current = 0;
    currentSegmentIdxRef.current = 0;
    isPlayingRef.current = true;
    setAudiobookActive(true);
    setCurrentTopicIdx(0);
    setCurrentSegmentLabel('');
    setIsPlaying(true);
    playNextSegment();
  }, [playNextSegment]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      stopTTS();
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      playNextSegment();
    }
  }, [isPlaying, playNextSegment]);

  const skipToTopic = useCallback((delta: number) => {
    const next = Math.max(0, Math.min(KNM_TOPICS.length - 1, currentTopicIdxRef.current + delta));
    stopTTS();
    currentTopicIdxRef.current = next;
    currentSegmentIdxRef.current = 0;
    setCurrentTopicIdx(next);
    setCurrentSegmentLabel('');
    if (isPlayingRef.current) {
      setTimeout(playNextSegment, 300);
    }
  }, [playNextSegment]);

  const stopAudiobook = useCallback(() => {
    isPlayingRef.current = false;
    stopTTS();
    setIsPlaying(false);
    setAudiobookActive(false);
    currentTopicIdxRef.current = 0;
    currentSegmentIdxRef.current = 0;
  }, []);

  const changeAudiobookLang = useCallback((lang: KNMLanguage) => {
    const wasPlaying = isPlayingRef.current;
    stopTTS();
    isPlayingRef.current = false;
    setIsPlaying(false);
    currentSegmentIdxRef.current = 0;
    setCurrentSegmentLabel('');
    audiobookLangRef.current = lang;
    setAudiobookLang(lang);
    if (wasPlaying) {
      setTimeout(() => {
        isPlayingRef.current = true;
        setIsPlaying(true);
        playNextSegment();
      }, 400);
    }
  }, [playNextSegment]);

  // ── Translations ─────────────────────────────────────────────────────────

  const t = language === 'en'
    ? {
        title: 'KNM Exam Prep',
        subtitle: 'Kennis van de Nederlandse Maatschappij',
        description: 'Master all 11 topics for the civic integration exam.',
        topics: 'TOPICS',
        audiobookBtn: 'Play as Audiobook',
        audiobookDesc: 'Listen to all topics read aloud in sequence',
      }
    : {
        title: 'KNM Examenvoorbereiding',
        subtitle: 'Kennis van de Nederlandse Maatschappij',
        description: 'Beheers alle 11 onderwerpen voor het inburgeringsexamen.',
        topics: 'ONDERWERPEN',
        audiobookBtn: 'Afspelen als Audioboek',
        audiobookDesc: 'Luister naar alle onderwerpen op volgorde voorgelezen',
      };

  const currentTopic = KNM_TOPICS[Math.min(currentTopicIdx, KNM_TOPICS.length - 1)];

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: audiobookActive ? 160 : 0 }}
      >
        {/* Header Banner */}
        <View style={[styles.banner, { backgroundColor: '#1d4ed8' }]}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerIconWrap}>
              <Ionicons name="school" size={32} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>{t.title}</Text>
              <Text style={styles.bannerSubtitle}>{t.subtitle}</Text>
              <Text style={styles.bannerDescription}>{t.description}</Text>
            </View>
          </View>

          {/* Language toggle */}
          <Pressable
            style={styles.langToggle}
            onPress={() => setLanguage(language === 'en' ? 'nl' : 'en')}
          >
            <Globe size={14} color="white" />
            <Text style={styles.langToggleText}>
              {language === 'en' ? 'Switch to NL' : 'Switch to EN'}
            </Text>
          </Pressable>
        </View>

        {/* Stats bar */}
        <View style={[styles.statsBar, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#1d4ed8' }]}>{KNM_TOPICS.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {language === 'en' ? 'Topics' : 'Onderwerpen'}
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#1d4ed8' }]}>
              {KNM_TOPICS.reduce((acc, topic) => acc + topic.quizQuestions.length, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {language === 'en' ? 'Questions' : 'Vragen'}
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#1d4ed8' }]}>AI</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {language === 'en' ? 'Powered' : 'Aangedreven'}
            </Text>
          </View>
        </View>

        {/* Audiobook launch button */}
        <Pressable
          style={[styles.audiobookCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}
          onPress={startAudiobook}
        >
          <View style={styles.audiobookCardLeft}>
            <View style={[styles.audiobookIconCircle, { backgroundColor: '#1d4ed8' }]}>
              <Ionicons name="headset-outline" size={22} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.audiobookCardTitle, { color: '#1d4ed8' }]}>{t.audiobookBtn}</Text>
              <Text style={[styles.audiobookCardDesc, { color: '#3b82f6' }]}>{t.audiobookDesc}</Text>
            </View>
          </View>
          <Ionicons name="play-circle" size={34} color="#1d4ed8" />
        </Pressable>

        {/* Topics list */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{t.topics}</Text>
        <View style={[styles.listCard, { backgroundColor: theme.cardBackground }]}>
          {KNM_TOPICS.map((topic, index) => {
            const isLast = index === KNM_TOPICS.length - 1;
            return (
              <Pressable
                key={topic.id}
                style={[
                  styles.topicRow,
                  !isLast && { borderBottomColor: theme.divider, borderBottomWidth: StyleSheet.hairlineWidth },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/knm-topic/[id]',
                    params: { id: topic.id, lang: language },
                  } as any)
                }
              >
                <View style={[styles.topicIconWrap, { backgroundColor: topic.color + '18' }]}>
                  <Ionicons name={topic.icon as any} size={20} color={topic.color} />
                </View>
                <View style={styles.topicContent}>
                  <Text style={[styles.topicTitle, { color: theme.text }]}>
                    {topic.title[language]}
                  </Text>
                  <Text style={[styles.topicSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                    {topic.description[language]}
                  </Text>
                </View>
                <View style={styles.topicMeta}>
                  <Text style={[styles.topicCount, { color: topic.color }]}>
                    {topic.quizQuestions.length}Q
                  </Text>
                  <ChevronRight size={16} color={theme.textSecondary} />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Tips card */}
        <View style={[styles.tipsCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
          <View style={styles.tipsHeader}>
            <BookOpen size={16} color="#1d4ed8" />
            <Text style={[styles.tipsTitle, { color: '#1d4ed8' }]}>
              {language === 'en' ? 'Exam Tips' : 'Examentips'}
            </Text>
          </View>
          {(language === 'en'
            ? [
                'Read each lesson carefully before attempting the quiz.',
                'Culture & Norms (Topic 10) is heavily tested — memorise the examples.',
                'Use AI-generated questions for extra practice.',
                'Switch to Dutch mode to practise reading in the language of the exam.',
              ]
            : [
                'Lees elke les zorgvuldig door voordat je de quiz probeert.',
                'Cultuur en normen (Onderwerp 10) wordt zwaar getoetst — onthoud de voorbeelden.',
                'Gebruik AI-gegenereerde vragen voor extra oefening.',
                'Schakel over naar de Nederlandse modus om te oefenen met lezen in de examentaal.',
              ]
          ).map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={[styles.tipBullet, { color: '#1d4ed8' }]}>•</Text>
              <Text style={[styles.tipText, { color: '#1e3a8a' }]}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Audiobook Player ───────────────────────────────────────────────── */}
      {audiobookActive && (
        <View style={[styles.player, {
          backgroundColor: theme.cardBackground,
          borderTopColor: theme.divider,
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 8 },
            android: { elevation: 8 },
          }),
        }]}>
          {/* Now playing row */}
          <View style={styles.playerNowPlaying}>
            <View style={[styles.playerTopicIcon, { backgroundColor: currentTopic.color + '22' }]}>
              <Ionicons name={currentTopic.icon as any} size={18} color={currentTopic.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.playerTopicTitle, { color: theme.text }]} numberOfLines={1}>
                {currentTopic.title[audiobookLang]}
              </Text>
              <Text style={[styles.playerSegmentLabel, { color: theme.textSecondary }]}>
                {currentSegmentLabel || '—'}
              </Text>
            </View>
            <Text style={[styles.playerProgress, { color: theme.textSecondary }]}>
              {currentTopicIdx + 1} / {KNM_TOPICS.length}
            </Text>
            <Pressable onPress={stopAudiobook} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={22} color={theme.textSecondary} />
            </Pressable>
          </View>

          {/* Controls + language selector */}
          <View style={styles.playerBottom}>
            {/* Language pills */}
            <View style={styles.langPills}>
              <Pressable
                style={[styles.langPill, audiobookLang === 'en' && styles.langPillActive]}
                onPress={() => changeAudiobookLang('en')}
              >
                <Text style={[styles.langPillText, audiobookLang === 'en' && styles.langPillTextActive]}>
                  EN
                </Text>
              </Pressable>
              <Pressable
                style={[styles.langPill, audiobookLang === 'nl' && styles.langPillActive]}
                onPress={() => changeAudiobookLang('nl')}
              >
                <Text style={[styles.langPillText, audiobookLang === 'nl' && styles.langPillTextActive]}>
                  NL
                </Text>
              </Pressable>
            </View>

            {/* Playback controls */}
            <View style={styles.playerControls}>
              <Pressable onPress={() => skipToTopic(-1)} hitSlop={10}>
                <Ionicons name="play-skip-back" size={30} color={theme.text} />
              </Pressable>
              <Pressable
                style={[styles.playBtn, { backgroundColor: '#1d4ed8' }]}
                onPress={togglePlayPause}
              >
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={26} color="white" />
              </Pressable>
              <Pressable onPress={() => skipToTopic(1)} hitSlop={10}>
                <Ionicons name="play-skip-forward" size={30} color={theme.text} />
              </Pressable>
            </View>

            {/* Spacer to balance layout */}
            <View style={{ width: 60 }} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },

  // ── Banner ────────────────────────────────────────────────────────────────
  banner: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  bannerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: { fontSize: FontSize.title3, fontWeight: FontWeight.bold, color: 'white', marginBottom: 2 },
  bannerSubtitle: { fontSize: FontSize.caption, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  bannerDescription: { fontSize: FontSize.footnote, color: 'rgba(255,255,255,0.9)', lineHeight: 18 },

  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  langToggleText: { fontSize: FontSize.caption, fontWeight: FontWeight.semibold, color: 'white' },

  // ── Stats bar ─────────────────────────────────────────────────────────────
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: FontSize.title3, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.caption, marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, marginVertical: 4 },

  // ── Audiobook launch card ─────────────────────────────────────────────────
  audiobookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  audiobookCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  audiobookIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audiobookCardTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.bold, marginBottom: 2 },
  audiobookCardDesc: { fontSize: FontSize.caption },

  // ── Topics list ───────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  listCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  topicIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  topicContent: { flex: 1, marginRight: Spacing.sm },
  topicTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, marginBottom: 2 },
  topicSubtitle: { fontSize: FontSize.caption },
  topicMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topicCount: { fontSize: FontSize.caption, fontWeight: FontWeight.bold },

  // ── Tips card ─────────────────────────────────────────────────────────────
  tipsCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  tipsTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.bold },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipBullet: { fontSize: 14, fontWeight: 'bold', marginTop: 1 },
  tipText: { flex: 1, fontSize: FontSize.footnote, lineHeight: 20 },

  // ── Audiobook player ──────────────────────────────────────────────────────
  player: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  playerNowPlaying: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  playerTopicIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerTopicTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  playerSegmentLabel: { fontSize: FontSize.caption, marginTop: 1 },
  playerProgress: { fontSize: FontSize.caption, fontWeight: FontWeight.semibold },
  closeBtn: { paddingLeft: 4 },

  playerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  langPills: { flexDirection: 'row', gap: 6 },
  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: 'transparent',
  },
  langPillActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  langPillText: { fontSize: FontSize.caption, fontWeight: FontWeight.semibold, color: '#3b82f6' },
  langPillTextActive: { color: 'white' },

  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
