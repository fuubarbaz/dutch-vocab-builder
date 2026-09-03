import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';

import Colors, { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import { Word } from '@/types';
import { useSRS } from '@/context/SRSContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useMistakeJournal } from '@/context/MistakeJournalContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

type Question = {
  targetWord: Word;
  options: Word[];
  correctIndex: number;
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function VocabSessionScreen() {
  const { category, mode, count } = useLocalSearchParams<{
    category: string;
    mode: 'due' | 'all';
    count: string;
  }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { getDueWords, recordReview } = useSRS();
  const { favorites } = useFavorites();
  const { logMistake } = useMistakeJournal();

  const targetCount = parseInt(count ?? '10', 10);

  // Recursively collect all words from a category tree, excluding traffic signs
  const getVocabWords = (cat: typeof VOCABULARY_DATA[0]): Word[] => {
    if (cat.id === 'traffic_signs_parent') return [];
    const words: Word[] = [...cat.words];
    if (cat.subCategories) {
      cat.subCategories.forEach(sub => words.push(...getVocabWords(sub)));
    }
    return words;
  };

  // Full pool (all vocab, no traffic signs) — used as distractor source
  const fullPool = useMemo(
    () => VOCABULARY_DATA.flatMap(getVocabWords),
    [],
  );

  // ─── Build Question Deck (stable on mount) ──────────────────────────────────

  const questions = useMemo<Question[]>(() => {
    // All vocab words excluding traffic signs (they have their own quiz)
    const allWords = VOCABULARY_DATA.flatMap(getVocabWords);

    // Target pool
    let pool: Word[] =
      category === 'All Categories'
        ? allWords
        : category === 'Saved Words'
        ? allWords.filter(w => favorites.includes(w.id))
        : VOCABULARY_DATA.find(c => c.title === category)?.words ?? [];

    if (mode === 'due') pool = getDueWords(pool);

    // Shuffle & cap
    const targets = [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, targetCount);

    if (fullPool.length < 4) return []; // not enough words for a quiz

    return targets.map(target => {
      // 3 unique distractors from full pool
      const distractors = fullPool
        .filter(
          w =>
            w.id !== target.id &&
            w.dutch.toLowerCase().trim() !== target.dutch.toLowerCase().trim() &&
            w.english.toLowerCase().trim() !== target.english.toLowerCase().trim()
        )
        .sort(() => Math.random() - 0.5)
        .reduce((acc, w) => {
          const dup = acc.some(
            a => a.english.toLowerCase().trim() === w.english.toLowerCase().trim()
          );
          if (!dup && acc.length < 3) acc.push(w);
          return acc;
        }, [] as Word[]);

      const options = [target, ...distractors].sort(() => Math.random() - 0.5);
      return {
        targetWord: target,
        options,
        correctIndex: options.findIndex(o => o.id === target.id),
      };
    });
  }, []); // stable — build once on mount

  // ─── Session State ────────────────────────────────────────────────────────────

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  const handleSelect = async (idx: number) => {
    if (selectedIndex !== null) return; // already answered
    setSelectedIndex(idx);

    const q = questions[currentIndex];
    const correct = idx === q.correctIndex;
    if (correct) setScore(s => s + 1);
    else logMistake(q.targetWord, 'vocab-session');

    // SRS: correct → Easy (5), wrong → Hard (2)
    await recordReview(q.targetWord.id, correct ? 5 : 2);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setSelectedIndex(null);
      setCurrentIndex(i => i + 1);
    } else {
      setIsFinished(true);
    }
  };

  // ─── Empty Deck ───────────────────────────────────────────────────────────────

  if (questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={theme.text} />
          </Pressable>
        </View>
        <View style={styles.center}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>🎉 All caught up!</Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
            No cards are due in this category. Come back tomorrow!
          </Text>
          <Pressable
            style={[styles.doneBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>Back to Practice</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Results Screen ───────────────────────────────────────────────────────────

  if (isFinished) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <View style={{ width: 28 }} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Session Complete</Text>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.resultsContainer}>
          <View style={[styles.scoreBubble, { backgroundColor: theme.primary + '15' }]}>
            <Text style={[styles.scoreNum, { color: theme.primary }]}>
              {score}/{questions.length}
            </Text>
            <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>
              {pct}% correct
            </Text>
          </View>

          <View style={[styles.breakdownCard, { backgroundColor: theme.cardBackground }]}>
            {[
              { label: 'Correct', n: score, color: '#22c55e' },
              { label: 'Wrong', n: questions.length - score, color: '#ef4444' },
            ].map(({ label, n, color }) => (
              <View key={label} style={styles.breakdownRow}>
                <View style={[styles.breakdownDot, { backgroundColor: color }]} />
                <Text style={[styles.breakdownLabel, { color: theme.text }]}>{label}</Text>
                <Text style={[styles.breakdownCount, { color: theme.textSecondary }]}>
                  {n} question{n !== 1 ? 's' : ''}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.srsHint, { color: theme.textSecondary }]}>
            Words have been rescheduled by SRS based on your answers.
          </Text>

          <Pressable
            style={[styles.doneBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>

        {passed && (
          <ConfettiCannon
            count={120}
            origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
            fallSpeed={3000}
            fadeOut
          />
        )}
      </SafeAreaView>
    );
  }

  // ─── Active Quiz ──────────────────────────────────────────────────────────────

  const q = questions[currentIndex];
  const hasAnswered = selectedIndex !== null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {currentIndex + 1} / {questions.length}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: theme.surfaceSecondary }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.primary,
              width: `${(currentIndex / questions.length) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Quiz body */}
      <View style={styles.body}>
        <Text style={[styles.prompt, { color: theme.textSecondary }]}>
          What is the meaning of:
        </Text>
        <Text style={[styles.targetWord, { color: theme.text }]}>
          {q.targetWord.dutch}
        </Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {q.options.map((opt, idx) => {
            const isCorrect = hasAnswered && idx === q.correctIndex;
            const isWrong = hasAnswered && idx === selectedIndex && idx !== q.correctIndex;

            const bg = isCorrect
              ? '#d4edda'
              : isWrong
              ? '#f8d7da'
              : theme.cardBackground;
            const borderColor = isCorrect ? '#22c55e' : isWrong ? '#ef4444' : 'transparent';
            const textColor = isCorrect ? '#155724' : isWrong ? '#721c24' : theme.text;

            return (
              <Pressable
                key={idx}
                style={[styles.optionCard, { backgroundColor: bg, borderColor, borderWidth: 2 }]}
                onPress={() => handleSelect(idx)}
                disabled={hasAnswered}
              >
                <Text style={[styles.optionText, { color: textColor }]}>{opt.english}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Next button */}
        {hasAnswered && (
          <Pressable
            style={[styles.nextBtn, { backgroundColor: theme.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.nextBtnText}>
              {currentIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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

  progressTrack: { height: 6, width: '100%' },
  progressFill: { height: '100%', borderRadius: 3, minWidth: 4 },

  body: {
    flex: 1,
    padding: Spacing.xxl,
    alignItems: 'center',
  },

  prompt: {
    fontSize: FontSize.body,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  targetWord: {
    fontSize: FontSize.title1,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xxxl,
    textAlign: 'center',
  },

  optionsContainer: { width: '100%', gap: Spacing.md },
  optionCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  optionText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },

  nextBtn: {
    position: 'absolute',
    bottom: Spacing.xxxl,
    left: Spacing.xxl,
    right: Spacing.xxl,
    padding: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#fff',
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },

  // Empty / Results shared
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSize.title2,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  emptySub: {
    fontSize: FontSize.subhead,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
  },

  resultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  scoreBubble: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  scoreNum: {
    fontSize: FontSize.largeTitle,
    fontWeight: FontWeight.heavy,
  },
  scoreLabel: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.medium,
  },
  breakdownCard: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.md,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.medium,
  },
  breakdownCount: { fontSize: FontSize.footnote },

  srsHint: {
    fontSize: FontSize.footnote,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  doneBtn: {
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
});
