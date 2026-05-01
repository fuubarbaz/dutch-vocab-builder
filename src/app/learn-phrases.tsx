import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  MessageCircle, HelpCircle, Palmtree, Briefcase, Bus, Hand, Heart,
  Utensils, Info, ChevronRight, ChevronLeft, Play, Pause, Square,
  SkipBack, SkipForward, Timer,
} from 'lucide-react-native';
import { PHRASE_CATEGORIES, PhraseCategory } from '@/data/phrases';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAudioQueue, QueuePhrase } from '@/hooks/useAudioQueue';
import { useSettings } from '@/context/SettingsContext';

const iconMap: Record<string, React.ComponentType<any>> = {
  MessageCircle, HelpCircle, Palmtree, Briefcase, Bus, Hand, Heart, Utensils, Info,
};

const PAUSE_OPTIONS = [
  { value: 0.5, label: '0.5s' },
  { value: 1, label: '1s' },
  { value: 2, label: '2s' },
  { value: 3, label: '3s' },
  { value: 5, label: '5s' },
];

const categoryColors: Record<string, string> = {
  generic: '#6366f1',
  questions: '#0ea5e9',
  weekend: '#f59e0b',
  work_life: '#64748b',
  traffic_transport: '#ef4444',
  greetings: '#10b981',
  courtesy: '#ec4899',
  dining_shopping: '#f97316',
  info: '#8b5cf6',
};

// Build the flat phrase list once
const ALL_QUEUE_PHRASES: QueuePhrase[] = PHRASE_CATEGORIES.flatMap(cat =>
  cat.phrases.map(p => ({
    id: `${cat.id}_${p.id}`,
    dutch: p.dutch,
    english: p.english,
    category: cat.title,
  }))
);
const TOTAL = ALL_QUEUE_PHRASES.length;

const CAT_START_INDICES = PHRASE_CATEGORIES.map((_, i) =>
  PHRASE_CATEGORIES.slice(0, i).reduce((sum, c) => sum + c.phrases.length, 0)
);

// ── Category card ─────────────────────────────────────────────────────────────

function CategoryCard({
  category, isActive, color, onPress, onPlay,
}: {
  category: PhraseCategory;
  isActive: boolean;
  color: string;
  onPress: () => void;
  onPlay: () => void;
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const Icon = iconMap[category.icon] ?? MessageCircle;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBackground }, isActive && { borderWidth: 2, borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '18' }]}>
        <Icon size={22} color={color} />
      </View>
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{category.title}</Text>
        <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
          {category.titleDutch} · {category.phrases.length} phrases
        </Text>
      </View>
      <TouchableOpacity style={[styles.cardPlayBtn, { backgroundColor: color + '18' }]} onPress={onPlay} hitSlop={8}>
        {isActive
          ? <View style={[styles.activeDot, { backgroundColor: color }]} />
          : <Play size={13} color={color} />
        }
      </TouchableOpacity>
      <TouchableOpacity onPress={onPress} hitSlop={8}>
        <ChevronRight size={18} color={theme.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function LearnPhrasesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { speechRate, phrasePause, setPhrasePause } = useSettings();

  const { state, load, play, pause, stop, next, prev, jumpTo } = useAudioQueue(phrasePause);
  const { isPlaying, isSynthesizing, isReady, currentIndex, currentPhrase, usingNative } = state;

  const color = currentPhrase
    ? (categoryColors[PHRASE_CATEGORIES.find(c => c.title === currentPhrase.category)?.id ?? ''] ?? theme.primary)
    : theme.primary;

  const currentCatIdx = useMemo(() => {
    if (!currentPhrase) return -1;
    return PHRASE_CATEGORIES.findIndex(c => c.title === currentPhrase.category);
  }, [currentPhrase]);

  const handlePlayAll = useCallback(async () => {
    if (isPlaying) { stop(); return; }
    if (isReady && usingNative && !isPlaying) { play(); return; }
    const isNative = await load(ALL_QUEUE_PHRASES, 0, speechRate, phrasePause);
    if (isNative) play();
  }, [isPlaying, isReady, usingNative, load, play, stop, speechRate, phrasePause]);

  const handlePlayCategory = useCallback(async (catIdx: number) => {
    const isNative = await load(ALL_QUEUE_PHRASES, CAT_START_INDICES[catIdx], speechRate, phrasePause);
    if (isNative) play();
  }, [load, play, speechRate, phrasePause]);

  const handlePrevCategory = useCallback(async () => {
    const catStart = CAT_START_INDICES[currentCatIdx];
    if (currentIndex > catStart) {
      await jumpTo(catStart, speechRate, phrasePause);
    } else if (currentCatIdx > 0) {
      await jumpTo(CAT_START_INDICES[currentCatIdx - 1], speechRate, phrasePause);
    }
  }, [currentIndex, currentCatIdx, jumpTo, speechRate, phrasePause]);

  const handleNextCategory = useCallback(async () => {
    if (currentCatIdx >= 0 && currentCatIdx < PHRASE_CATEGORIES.length - 1) {
      await jumpTo(CAT_START_INDICES[currentCatIdx + 1], speechRate, phrasePause);
    }
  }, [currentCatIdx, jumpTo, speechRate, phrasePause]);

  const progress = TOTAL > 0 ? (currentIndex + 1) / TOTAL : 0;
  const showBar = !!currentPhrase || isPlaying || isSynthesizing;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Learn Phrases' }} />

      <ScrollView
        contentContainerStyle={[styles.scroll, showBar && { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.headerCard, { backgroundColor: theme.cardBackground }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Dutch Phrases</Text>
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
              {TOTAL} phrases across {PHRASE_CATEGORIES.length} topics
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.playAllBtn, { backgroundColor: theme.primary }]}
            onPress={handlePlayAll}
            activeOpacity={0.8}
            disabled={isSynthesizing}
          >
            {isSynthesizing
              ? <ActivityIndicator color="#fff" size="small" />
              : isPlaying
                ? usingNative
                  ? <><Pause size={14} color="#fff" /><Text style={styles.playAllText}>Pause</Text></>
                  : <><Square size={14} color="#fff" /><Text style={styles.playAllText}>Stop</Text></>
                : <><Play size={14} color="#fff" /><Text style={styles.playAllText}>Play All</Text></>
            }
          </TouchableOpacity>
        </View>

        {/* Delay pause picker */}
        <View style={[styles.pauseRow, { backgroundColor: theme.cardBackground }]}>
          <Timer size={14} color={theme.textSecondary} />
          <Text style={[styles.pauseLabel, { color: theme.textSecondary }]}>Delay</Text>
          {PAUSE_OPTIONS.map(opt => {
            const active = phrasePause === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.pauseChip,
                  { borderColor: theme.border },
                  active && { borderColor: theme.primary, backgroundColor: theme.primary + '12' },
                ]}
                onPress={() => setPhrasePause(opt.value)}
              >
                <Text style={[
                  styles.pauseChipText,
                  { color: theme.textSecondary },
                  active && { color: theme.primary, fontWeight: FontWeight.bold as any },
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category list */}
        {PHRASE_CATEGORIES.map((cat, catIdx) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            isActive={currentPhrase?.category === cat.title}
            color={categoryColors[cat.id] ?? theme.primary}
            onPress={() => router.push(`/phrase-category/${cat.id}` as any)}
            onPlay={() => handlePlayCategory(catIdx)}
          />
        ))}
      </ScrollView>

      {/* ── Persistent audio bar ──────────────────────────────────────────── */}
      {showBar && (
        <View style={[styles.playerBar, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
          <View style={[styles.progressTrack, { backgroundColor: theme.surfaceSecondary }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: color }]} />
          </View>

          <View style={styles.playerContent}>
            <View style={styles.playerInfo}>
              {isSynthesizing && !currentPhrase ? (
                <Text style={[styles.playerCategory, { color }]}>Preparing audio…</Text>
              ) : (
                <>
                  <Text style={[styles.playerCategory, { color }]} numberOfLines={1}>
                    {currentPhrase?.category}
                  </Text>
                  <Text style={[styles.playerPhrase, { color: theme.text }]} numberOfLines={2}>
                    {currentPhrase?.dutch}
                  </Text>
                  <Text style={[styles.playerEnglish, { color: theme.textSecondary }]} numberOfLines={1}>
                    {currentPhrase?.english}
                  </Text>
                </>
              )}
            </View>

            {/* Controls: ⏮ cat | ◀ phrase | ▶/⏸ | ▶ phrase | ⏭ cat */}
            <View style={styles.playerControls}>
              <TouchableOpacity
                onPress={handlePrevCategory}
                hitSlop={10}
                style={{ opacity: currentCatIdx <= 0 ? 0.3 : 1 }}
              >
                <SkipBack size={20} color={theme.text} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => prev()}
                hitSlop={10}
                style={{ opacity: currentIndex <= 0 ? 0.3 : 1 }}
              >
                <ChevronLeft size={20} color={theme.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.centerBtn, { backgroundColor: color }]}
                onPress={isPlaying ? pause : play}
                disabled={isSynthesizing}
                activeOpacity={0.8}
              >
                {isSynthesizing
                  ? <ActivityIndicator color="#fff" size="small" />
                  : isPlaying
                    ? <Pause size={16} color="#fff" />
                    : <Play size={16} color="#fff" />
                }
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => next()}
                hitSlop={10}
                style={{ opacity: currentIndex >= TOTAL - 1 ? 0.3 : 1 }}
              >
                <ChevronRight size={20} color={theme.text} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNextCategory}
                hitSlop={10}
                style={{ opacity: currentCatIdx >= PHRASE_CATEGORIES.length - 1 ? 0.3 : 1 }}
              >
                <SkipForward size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.positionText, { color: theme.textSecondary }]}>
            {currentIndex + 1} / {TOTAL} · {currentPhrase?.category ?? ''}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg },

  headerCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, gap: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  headerTitle: { fontSize: FontSize.title3, fontWeight: FontWeight.bold, marginBottom: 2 },
  headerSub: { fontSize: FontSize.footnote, lineHeight: 18 },
  playAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.full,
    minWidth: 90, justifyContent: 'center',
  },
  playAllText: { color: '#fff', fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },

  pauseRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg, gap: Spacing.xs,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  pauseLabel: { fontSize: FontSize.caption, fontWeight: FontWeight.semibold, marginRight: Spacing.xs },
  pauseChip: {
    paddingHorizontal: Spacing.sm + 2, paddingVertical: 4,
    borderRadius: BorderRadius.full, borderWidth: 1.5,
  },
  pauseChipText: { fontSize: FontSize.caption, fontWeight: FontWeight.medium },

  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.sm, gap: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  iconBox: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1 },
  cardTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, marginBottom: 2 },
  cardSub: { fontSize: FontSize.footnote },
  cardPlayBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  activeDot: { width: 8, height: 8, borderRadius: 4 },

  playerBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 24 : Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  progressTrack: { height: 3 },
  progressFill: { height: 3 },
  playerContent: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: Spacing.md,
  },
  playerInfo: { flex: 1 },
  playerCategory: { fontSize: FontSize.caption, fontWeight: FontWeight.semibold, marginBottom: 2 },
  playerPhrase: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, lineHeight: 20 },
  playerEnglish: { fontSize: FontSize.caption, fontStyle: 'italic', marginTop: 2 },
  playerControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  centerBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  positionText: { textAlign: 'center', fontSize: FontSize.caption, paddingTop: Spacing.xs, paddingBottom: 2 },
});
