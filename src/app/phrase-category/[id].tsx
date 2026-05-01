import React, { useMemo, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Volume2, Play, Pause, Square, Timer } from 'lucide-react-native';
import { PHRASE_CATEGORIES, Phrase } from '@/data/phrases';
import { speak, stopTTS } from '@/utils/tts';
import { useSettings } from '@/context/SettingsContext';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAudioQueue, QueuePhrase } from '@/hooks/useAudioQueue';

const PAUSE_OPTIONS = [
  { value: 0.5, label: '0.5s' },
  { value: 1, label: '1s' },
  { value: 2, label: '2s' },
  { value: 3, label: '3s' },
  { value: 5, label: '5s' },
];

export default function PhraseCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { speechRate, phrasePause, setPhrasePause } = useSettings();
  const listRef = useRef<FlatList>(null);

  const category = PHRASE_CATEGORIES.find(c => c.id === id);

  const categoryPhrases: QueuePhrase[] = useMemo(() => {
    if (!category) return [];
    return category.phrases.map(p => ({
      id: `${category.id}_${p.id}`,
      dutch: p.dutch,
      english: p.english,
      category: category.title,
    }));
  }, [category]);

  const { state, load, play, pause, stop } = useAudioQueue(phrasePause);
  const { isPlaying, currentPhrase, usingNative } = state;

  const activeIdx = useMemo(() => {
    if (!currentPhrase) return null;
    return categoryPhrases.findIndex(p => p.id === currentPhrase.id);
  }, [currentPhrase, categoryPhrases]);

  // Scroll to active phrase
  useEffect(() => {
    if (activeIdx != null && activeIdx >= 0) {
      listRef.current?.scrollToIndex({ index: activeIdx, animated: true, viewPosition: 0.5 });
    }
  }, [activeIdx]);

  if (!category) return null;

  const playAll = async () => {
    if (isPlaying) {
      stop();
      return;
    }
    const isNative = await load(categoryPhrases, 0, speechRate, phrasePause);
    if (isNative) play();
  };

  const renderItem = ({ item, index }: { item: Phrase; index: number }) => {
    const isActive = activeIdx === index;
    return (
      <View style={[
        styles.phraseCard,
        { backgroundColor: theme.cardBackground },
        isActive && { borderWidth: 2, borderColor: theme.primary },
      ]}>
        <View style={styles.phraseRow}>
          <View style={styles.phraseTexts}>
            <Text style={[styles.dutchText, { color: theme.text }]}>{item.dutch}</Text>
            <Text style={[styles.englishText, { color: theme.textSecondary }]}>{item.english}</Text>
          </View>
          <TouchableOpacity onPress={() => speak(item.dutch, speechRate)} hitSlop={8}>
            <Volume2 size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: category.title }} />
      <FlatList
        ref={listRef}
        data={category.phrases}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={() => {}}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {category.titleDutch} · {category.phrases.length} phrases
              </Text>
              <TouchableOpacity
                style={[styles.playBtn, { backgroundColor: theme.primary }]}
                onPress={playAll}
                activeOpacity={0.7}
              >
                {isPlaying
                  ? usingNative
                    ? <><Pause size={12} color="#fff" /><Text style={styles.playBtnText}>Pause</Text></>
                    : <><Square size={12} color="#fff" /><Text style={styles.playBtnText}>Stop</Text></>
                  : <><Play size={12} color="#fff" /><Text style={styles.playBtnText}>Play All</Text></>
                }
              </TouchableOpacity>
            </View>
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
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  subtitle: { fontSize: FontSize.footnote, flex: 1 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  playBtnText: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold, color: '#fff' },
  pauseRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    marginBottom: Spacing.md, gap: Spacing.xs,
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
  phraseCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  phraseRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  phraseTexts: { flex: 1 },
  dutchText: { fontSize: FontSize.subhead, fontWeight: FontWeight.medium, lineHeight: 22 },
  englishText: { fontSize: FontSize.footnote, fontStyle: 'italic', marginTop: 2, lineHeight: 18, color: '#888' },
});
