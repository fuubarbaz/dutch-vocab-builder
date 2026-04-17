import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  MessageCircle, HelpCircle, Palmtree, Briefcase, Bus, Hand, Heart,
  Utensils, Info, ChevronRight, ChevronLeft, Play, Square, SkipBack, SkipForward,
} from 'lucide-react-native';
import { PHRASE_CATEGORIES, PhraseCategory } from '@/data/phrases';
import { speakInLanguage, stopTTS, startNewPlayback, getPlaybackGeneration } from '@/utils/tts';
import { useSettings } from '@/context/SettingsContext';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const iconMap: Record<string, React.ComponentType<any>> = {
  MessageCircle, HelpCircle, Palmtree, Briefcase, Bus, Hand, Heart, Utensils, Info,
};

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

const ALL_PHRASES = PHRASE_CATEGORIES.flatMap(cat =>
  cat.phrases.map(p => ({ ...p, catId: cat.id, catTitle: cat.title, catTitleDutch: cat.titleDutch }))
);
const TOTAL = ALL_PHRASES.length;

// First phrase index for each category
const CAT_START_INDICES = PHRASE_CATEGORIES.map((_, i) =>
  PHRASE_CATEGORIES.slice(0, i).reduce((sum, c) => sum + c.phrases.length, 0)
);

function CategoryCard({
  category, catIdx, onPress, onPlay, isActive,
}: {
  category: PhraseCategory;
  catIdx: number;
  onPress: () => void;
  onPlay: () => void;
  isActive: boolean;
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const Icon = iconMap[category.icon] ?? MessageCircle;
  const color = categoryColors[category.id] ?? theme.primary;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.cardBackground },
        isActive && { borderWidth: 2, borderColor: color },
      ]}
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
      <TouchableOpacity
        style={[styles.cardPlayBtn, { backgroundColor: color + '18' }]}
        onPress={onPlay}
        hitSlop={8}
      >
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

export default function LearnPhrasesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { speechRate } = useSettings();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const stopRef = useRef(false);
  const jumpRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopRef.current = true;
      stopTTS();
    };
  }, []);

  const currentPhrase = currentIdx !== null ? ALL_PHRASES[currentIdx] : null;
  const color = currentPhrase ? (categoryColors[currentPhrase.catId] ?? theme.primary) : theme.primary;

  const currentCatIdx = currentPhrase
    ? PHRASE_CATEGORIES.findIndex(c => c.id === currentPhrase.catId)
    : -1;

  const speakLang = (text: string, lang: 'nl' | 'en'): Promise<void> =>
    new Promise(resolve => {
      speakInLanguage(text, lang, speechRate, {
        onDone: resolve,
        onError: resolve,
        onStopped: resolve,
      });
    });

  const startFrom = async (startIdx: number) => {
    const gen = startNewPlayback();
    stopRef.current = false;
    jumpRef.current = null;
    setIsPlaying(true);

    const superseded = () => stopRef.current || getPlaybackGeneration() !== gen;

    let i = startIdx;
    while (i < TOTAL) {
      if (superseded()) break;

      if (jumpRef.current !== null) {
        i = jumpRef.current;
        jumpRef.current = null;
        continue;
      }

      setCurrentIdx(i);
      await speakLang(ALL_PHRASES[i].dutch, 'nl');
      if (superseded()) break;

      if (jumpRef.current !== null) { i = jumpRef.current; jumpRef.current = null; continue; }

      await new Promise(r => setTimeout(r, 300));
      await speakLang(ALL_PHRASES[i].english, 'en');
      if (superseded()) break;

      if (jumpRef.current !== null) { i = jumpRef.current; jumpRef.current = null; continue; }

      await new Promise(r => setTimeout(r, 600));
      i++;
    }

    if (getPlaybackGeneration() === gen) {
      setIsPlaying(false);
      setCurrentIdx(null);
    }
  };

  const handleStop = () => {
    stopRef.current = true;
    stopTTS();
    setIsPlaying(false);
    setCurrentIdx(null);
  };

  const jumpTo = (idx: number) => {
    if (isPlaying) {
      jumpRef.current = Math.max(0, Math.min(TOTAL - 1, idx));
      stopTTS();
    } else {
      startFrom(Math.max(0, Math.min(TOTAL - 1, idx)));
    }
  };

  // Phrase-level skips
  const handlePrevPhrase = () => {
    if (currentIdx === null) return;
    jumpTo(currentIdx - 1);
  };
  const handleNextPhrase = () => {
    if (currentIdx === null) return;
    jumpTo(currentIdx + 1);
  };

  // Category-level skips
  const handlePrevCategory = () => {
    if (currentIdx === null) return;
    const catStart = CAT_START_INDICES[currentCatIdx];
    if (currentIdx > catStart) {
      jumpTo(catStart);
    } else if (currentCatIdx > 0) {
      jumpTo(CAT_START_INDICES[currentCatIdx - 1]);
    }
  };
  const handleNextCategory = () => {
    if (currentCatIdx === -1) return;
    if (currentCatIdx < PHRASE_CATEGORIES.length - 1) {
      jumpTo(CAT_START_INDICES[currentCatIdx + 1]);
    }
  };

  // Select a category to play
  const handlePlayCategory = (catIdx: number) => {
    jumpTo(CAT_START_INDICES[catIdx]);
  };

  const progress = currentIdx !== null ? (currentIdx + 1) / TOTAL : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Learn Phrases' }} />

      <ScrollView
        contentContainerStyle={[styles.scroll, isPlaying && { paddingBottom: 140 }]}
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
            onPress={() => isPlaying ? handleStop() : startFrom(0)}
            activeOpacity={0.8}
          >
            {isPlaying
              ? <><Square size={14} color="#fff" /><Text style={styles.playAllText}>Stop</Text></>
              : <><Play size={14} color="#fff" /><Text style={styles.playAllText}>Play All</Text></>
            }
          </TouchableOpacity>
        </View>

        {/* Category list */}
        {PHRASE_CATEGORIES.map((cat, catIdx) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            catIdx={catIdx}
            isActive={currentPhrase?.catId === cat.id}
            onPress={() => router.push(`/phrase-category/${cat.id}` as any)}
            onPlay={() => handlePlayCategory(catIdx)}
          />
        ))}
      </ScrollView>

      {/* Audio controls bar */}
      {currentPhrase && (
        <View style={[styles.playerBar, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
          {/* Progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: theme.surfaceSecondary }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: color }]} />
          </View>

          <View style={styles.playerContent}>
            {/* Info */}
            <View style={styles.playerInfo}>
              <Text style={[styles.playerCategory, { color }]} numberOfLines={1}>
                {currentPhrase.catTitle}
              </Text>
              <Text style={[styles.playerPhrase, { color: theme.text }]} numberOfLines={2}>
                {currentPhrase.dutch}
              </Text>
              <Text style={[styles.playerEnglish, { color: theme.textSecondary }]} numberOfLines={1}>
                {currentPhrase.english}
              </Text>
            </View>

            {/* Controls: ⏮ cat | ◀ phrase | ■ stop | ▶ phrase | ⏭ cat */}
            <View style={styles.playerControls}>
              <TouchableOpacity
                onPress={handlePrevCategory}
                hitSlop={10}
                style={{ opacity: currentCatIdx <= 0 ? 0.3 : 1 }}
              >
                <SkipBack size={20} color={theme.text} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePrevPhrase}
                hitSlop={10}
                style={{ opacity: currentIdx === 0 ? 0.3 : 1 }}
              >
                <ChevronLeft size={20} color={theme.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.stopBtn, { backgroundColor: color }]}
                onPress={handleStop}
                activeOpacity={0.8}
              >
                <Square size={14} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNextPhrase}
                hitSlop={10}
                style={{ opacity: currentIdx === TOTAL - 1 ? 0.3 : 1 }}
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
            {(currentIdx ?? 0) + 1} / {TOTAL} · {currentPhrase.catTitle}
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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  headerTitle: { fontSize: FontSize.title3, fontWeight: FontWeight.bold, marginBottom: 2 },
  headerSub: { fontSize: FontSize.footnote, lineHeight: 18 },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
  },
  playAllText: { color: '#fff', fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  iconBox: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1 },
  cardTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, marginBottom: 2 },
  cardSub: { fontSize: FontSize.footnote },
  cardPlayBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: { width: 8, height: 8, borderRadius: 4 },

  // Player bar
  playerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  progressTrack: { height: 3 },
  progressFill: { height: 3 },
  playerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  playerInfo: { flex: 1 },
  playerCategory: { fontSize: FontSize.caption, fontWeight: FontWeight.semibold, marginBottom: 2 },
  playerPhrase: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, lineHeight: 20 },
  playerEnglish: { fontSize: FontSize.caption, fontStyle: 'italic', marginTop: 2 },
  playerControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stopBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    textAlign: 'center',
    fontSize: FontSize.caption,
    paddingTop: Spacing.xs,
    paddingBottom: 2,
  },
});
