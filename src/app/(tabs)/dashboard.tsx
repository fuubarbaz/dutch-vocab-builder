import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Dimensions } from 'react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useFavorites } from '@/context/FavoritesContext';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import { BookOpen, CheckCircle, Heart, Target, RotateCcw } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

function LargeProgressRing({ progress, size = 180, strokeWidth = 12, color, bgColor }: {
  progress: number; size?: number; strokeWidth?: number; color: string; bgColor: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 40, fontWeight: FontWeight.bold, color }}>
          {progress}%
        </Text>
        <Text style={{ fontSize: FontSize.footnote, color: color + '99', marginTop: 2 }}>
          complete
        </Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { learnedIds, favorites, customWords, resetProgress, resetCategoryProgress } = useFavorites();

  const getAllWords = React.useCallback((category: typeof VOCABULARY_DATA[0]): any[] => {
    let words = [...category.words];
    if (category.subCategories) {
      category.subCategories.forEach(sub => {
        words = [...words, ...getAllWords(sub)];
      });
    }
    return words;
  }, []);

  const learnedSet = React.useMemo(() => new Set(learnedIds), [learnedIds]);

  const categoryStats = React.useMemo(() =>
    VOCABULARY_DATA.map(cat => {
      const words = getAllWords(cat);
      const total = words.length;
      const learned = words.filter(w => learnedSet.has(w.id)).length;
      const wordIds = words.map(w => w.id);
      return { id: cat.id, title: cat.title, total, learned, wordIds };
    }).filter(c => c.total > 0),
    [getAllWords, learnedSet]
  );

  const totalWords = VOCABULARY_DATA.reduce((acc, category) => acc + getAllWords(category).length, 0) + customWords.length;
  const learnedCount = learnedIds.length;
  const todoCount = Math.max(0, totalWords - learnedCount);
  const progress = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;

  const handleResetCategory = (cat: typeof categoryStats[0]) => {
    if (cat.learned === 0) return;
    Alert.alert(
      'Reset Category',
      `Reset progress for "${cat.title}"? This will unmark all ${cat.learned} learned word${cat.learned !== 1 ? 's' : ''}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetCategoryProgress(cat.wordIds) },
      ]
    );
  };

  const handleReset = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Reset all learning progress? This can't be undone.")) {
        resetProgress();
      }
    } else {
      Alert.alert(
        "Reset Progress",
        "Reset all learning progress? This can't be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Reset", style: "destructive", onPress: resetProgress }
        ]
      );
    }
  };

  const stats = [
    {
      label: 'Total Words',
      value: totalWords,
      icon: BookOpen,
      color: theme.primary,
      bg: theme.primary + '10',
    },
    {
      label: 'Learned',
      value: learnedCount,
      icon: CheckCircle,
      color: theme.success,
      bg: theme.successLight,
    },
    {
      label: 'Saved',
      value: favorites.length,
      icon: Heart,
      color: theme.accent,
      bg: theme.accentLight,
    },
    {
      label: 'Remaining',
      value: todoCount,
      icon: Target,
      color: theme.textSecondary,
      bg: theme.surfaceSecondary,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Progress Ring Hero */}
      <View style={[styles.heroCard, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.heroTitle, { color: theme.text }]}>Your Progress</Text>
        <View style={styles.ringContainer}>
          <LargeProgressRing
            progress={progress}
            color={theme.success}
            bgColor={theme.surfaceSecondary}
          />
        </View>
        <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
          {learnedCount} of {totalWords} words mastered
        </Text>
      </View>

      {/* Stats Grid */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>DETAILS</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <View
              key={index}
              style={[styles.statCard, { backgroundColor: theme.cardBackground }]}
            >
              <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                <Icon size={18} color={stat.color} />
              </View>
              <Text style={[styles.statNumber, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Category Breakdown */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>BY CATEGORY</Text>
      <View style={[styles.categoryCard, { backgroundColor: theme.cardBackground }]}>
        {categoryStats.map((cat, index) => {
          const pct = cat.total > 0 ? cat.learned / cat.total : 0;
          const isLast = index === categoryStats.length - 1;
          return (
            <View
              key={cat.id}
              style={[styles.categoryRow, !isLast && { borderBottomColor: theme.divider, borderBottomWidth: StyleSheet.hairlineWidth }]}
            >
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryTitle, { color: theme.text }]} numberOfLines={1}>
                  {cat.title}
                </Text>
                <View style={styles.categoryMeta}>
                  <Text style={[styles.categoryCount, { color: theme.textSecondary }]}>
                    {cat.learned}/{cat.total}
                  </Text>
                  {cat.learned > 0 && (
                    <TouchableOpacity
                      onPress={() => handleResetCategory(cat)}
                      hitSlop={8}
                      style={styles.categoryResetBtn}
                    >
                      <RotateCcw size={13} color={theme.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.surfaceSecondary }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: pct === 1 ? theme.success : theme.primary,
                      width: `${Math.round(pct * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Reset */}
      <TouchableOpacity
        style={[styles.resetButton, { borderColor: theme.border }]}
        onPress={handleReset}
      >
        <Text style={[styles.resetText, { color: theme.danger }]}>Reset Progress</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  heroTitle: {
    fontSize: FontSize.title2,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xxl,
  },
  ringContainer: {
    marginBottom: Spacing.lg,
  },
  heroSubtitle: {
    fontSize: FontSize.subhead,
  },
  sectionLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    width: (screenWidth - Spacing.lg * 2 - Spacing.md) / 2,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statNumber: {
    fontSize: FontSize.title1,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FontSize.footnote,
  },
  resetButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginTop: Spacing.xxxl,
  },
  resetText: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.medium,
  },
  categoryCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  categoryRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryTitle: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.medium,
    flex: 1,
    marginRight: Spacing.md,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryCount: {
    fontSize: FontSize.footnote,
  },
  categoryResetBtn: {
    padding: 2,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
    minWidth: 4,
  },
});
