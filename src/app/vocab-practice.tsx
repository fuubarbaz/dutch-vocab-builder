import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BookOpen, ChevronRight, Flame, Clock, CheckCircle } from 'lucide-react-native';

import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import { useSRS } from '@/context/SRSContext';

const COUNTS = [5, 10, 15, 20] as const;
type Mode = 'due' | 'all';

export default function VocabPracticeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { getDueWords, stats } = useSRS();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [mode, setMode] = useState<Mode>('due');
  const [count, setCount] = useState<number>(10);

  // All vocabulary categories (no traffic)
  const categories = useMemo(() => {
    return [{ id: 'all', title: 'All Categories' }, ...VOCABULARY_DATA.map(c => ({ id: c.id, title: c.title }))];
  }, []);

  // Words in selected category
  const categoryWords = useMemo(() => {
    if (selectedCategory === 'All Categories') {
      return VOCABULARY_DATA.flatMap(c => c.words);
    }
    return VOCABULARY_DATA.find(c => c.title === selectedCategory)?.words ?? [];
  }, [selectedCategory]);

  // Due count for selected category
  const dueInCategory = useMemo(() => getDueWords(categoryWords).length, [getDueWords, categoryWords]);

  const canStart = mode === 'all' ? categoryWords.length > 0 : dueInCategory > 0;

  const handleStart = () => {
    router.push({
      pathname: '/vocab-session' as any,
      params: {
        category: selectedCategory,
        mode,
        count: count.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Vocab Practice</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* SRS Summary Card */}
        <View style={[styles.statsRow]}>
          <View style={[styles.statPill, { backgroundColor: theme.primary + '15' }]}>
            <Clock size={14} color={theme.primary} />
            <Text style={[styles.statPillText, { color: theme.primary }]}>
              {stats.dueToday} due
            </Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: theme.success + '15' }]}>
            <Flame size={14} color={theme.success} />
            <Text style={[styles.statPillText, { color: theme.success }]}>
              {stats.streak}d streak
            </Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: theme.cardBackground }]}>
            <CheckCircle size={14} color={theme.textSecondary} />
            <Text style={[styles.statPillText, { color: theme.textSecondary }]}>
              {stats.totalReviewed} reviewed
            </Text>
          </View>
        </View>

        {/* Category Selection */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>CATEGORY</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipContainer}
        >
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.title;
            return (
              <Pressable
                key={cat.id}
                style={[
                  styles.chip,
                  { borderColor: theme.border, backgroundColor: theme.surfaceSecondary },
                  isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
                onPress={() => setSelectedCategory(cat.title)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: theme.text },
                    isSelected && { color: '#fff' },
                  ]}
                >
                  {cat.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Mode Selection */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>MODE</Text>
        <View style={[styles.modeCard, { backgroundColor: theme.cardBackground }]}>
          <Pressable
            style={[
              styles.modeRow,
              { borderBottomColor: theme.divider },
              mode === 'due' && { backgroundColor: theme.primary + '08' },
            ]}
            onPress={() => setMode('due')}
          >
            <View style={[styles.modeIcon, { backgroundColor: theme.primary + '15' }]}>
              <Clock size={18} color={theme.primary} />
            </View>
            <View style={styles.modeText}>
              <Text style={[styles.modeTitle, { color: theme.text }]}>Due for Review</Text>
              <Text style={[styles.modeSub, { color: theme.textSecondary }]}>
                {dueInCategory} word{dueInCategory !== 1 ? 's' : ''} scheduled by SRS
              </Text>
            </View>
            {mode === 'due' && (
              <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
            )}
          </Pressable>

          <Pressable
            style={[
              styles.modeRow,
              { borderBottomWidth: 0 },
              mode === 'all' && { backgroundColor: theme.primary + '08' },
            ]}
            onPress={() => setMode('all')}
          >
            <View style={[styles.modeIcon, { backgroundColor: theme.success + '15' }]}>
              <BookOpen size={18} color={theme.success} />
            </View>
            <View style={styles.modeText}>
              <Text style={[styles.modeTitle, { color: theme.text }]}>All Words</Text>
              <Text style={[styles.modeSub, { color: theme.textSecondary }]}>
                {categoryWords.length} word{categoryWords.length !== 1 ? 's' : ''} in category
              </Text>
            </View>
            {mode === 'all' && (
              <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
            )}
          </Pressable>
        </View>

        {/* Card Count */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>CARDS PER SESSION</Text>
        <View style={styles.countRow}>
          {COUNTS.map(n => (
            <Pressable
              key={n}
              style={[
                styles.countChip,
                { borderColor: theme.border, backgroundColor: theme.surfaceSecondary },
                count === n && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              onPress={() => setCount(n)}
            >
              <Text
                style={[
                  styles.countText,
                  { color: theme.text },
                  count === n && { color: '#fff' },
                ]}
              >
                {n}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* CTA */}
        <Pressable
          style={[
            styles.startButton,
            { backgroundColor: canStart ? theme.primary : theme.surfaceSecondary },
          ]}
          onPress={handleStart}
          disabled={!canStart}
        >
          <Text style={[styles.startText, { color: canStart ? '#fff' : theme.textSecondary }]}>
            {mode === 'due' && dueInCategory === 0
              ? 'No cards due — try "All Words"'
              : `Start Session`}
          </Text>
          {canStart && <ChevronRight size={20} color="#fff" />}
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  // Stats pills row
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
    flexWrap: 'wrap',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statPillText: {
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.semibold,
  },
  // Section labels
  sectionLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  // Category chips
  chipScroll: { flexGrow: 0, marginHorizontal: -Spacing.lg },
  chipContainer: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.medium,
  },
  // Mode card
  modeCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  modeText: { flex: 1 },
  modeTitle: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  modeSub: { fontSize: FontSize.caption },
  // Count
  countRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  countChip: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
  },
  // Start button
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xxxl,
    gap: Spacing.sm,
  },
  startText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
});
