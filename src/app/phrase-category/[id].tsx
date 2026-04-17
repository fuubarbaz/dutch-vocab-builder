import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Volume2, Play, Square } from 'lucide-react-native';
import { PHRASE_CATEGORIES, Phrase } from '@/data/phrases';
import { speak, speakInLanguage, stopTTS, startNewPlayback, getPlaybackGeneration } from '@/utils/tts';
import { useSettings } from '@/context/SettingsContext';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function PhraseCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { speechRate } = useSettings();

  const category = PHRASE_CATEGORIES.find(c => c.id === id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const stopRef = useRef(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    return () => {
      stopRef.current = true;
      stopTTS();
    };
  }, []);

  if (!category) return null;

  const speakLang = (text: string, lang: 'nl' | 'en'): Promise<void> =>
    new Promise(resolve => {
      speakInLanguage(text, lang, speechRate, {
        onDone: resolve,
        onError: resolve,
        onStopped: resolve,
      });
    });

  const playAll = async () => {
    if (isPlaying) {
      stopRef.current = true;
      stopTTS();
      setIsPlaying(false);
      setActiveIdx(null);
      return;
    }

    const gen = startNewPlayback();
    stopRef.current = false;
    setIsPlaying(true);

    const superseded = () => stopRef.current || getPlaybackGeneration() !== gen;

    for (let i = 0; i < category.phrases.length; i++) {
      if (superseded()) break;
      setActiveIdx(i);
      listRef.current?.scrollToIndex({ index: i, animated: true, viewPosition: 0.5 });
      await speakLang(category.phrases[i].dutch, 'nl');
      if (superseded()) break;
      await new Promise(r => setTimeout(r, 300));
      if (superseded()) break;
      await speakLang(category.phrases[i].english, 'en');
      if (superseded()) break;
      await new Promise(r => setTimeout(r, 600));
    }

    if (getPlaybackGeneration() === gen) {
      setIsPlaying(false);
      setActiveIdx(null);
    }
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
                ? <><Square size={12} color="#fff" /><Text style={styles.playBtnText}>Stop</Text></>
                : <><Play size={12} color="#fff" /><Text style={styles.playBtnText}>Play All</Text></>
              }
            </TouchableOpacity>
          </View>
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
