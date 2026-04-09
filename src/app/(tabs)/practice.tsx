import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Mic, MessageSquare, BookOpen, Camera, PenTool, ChevronRight } from 'lucide-react-native';

import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import { TRAFFIC_CATEGORIES } from '@/data/traffic_categories';

export default function PracticeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [selectedDomain, setSelectedDomain] = useState<'vocabulary' | 'traffic'>('vocabulary');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [questionCount, setQuestionCount] = useState(10);

  const currentCategories = selectedDomain === 'vocabulary' ? VOCABULARY_DATA : TRAFFIC_CATEGORIES;
  const allCategories = [{ title: 'All Categories' }, ...currentCategories];
  const counts = [5, 10, 15, 20];

  const startQuiz = () => {
    router.push({
      pathname: '/quiz',
      params: {
        domain: selectedDomain,
        category: selectedCategory,
        count: questionCount.toString(),
      },
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Quiz Section */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>QUIZ</Text>
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        {/* Domain Toggle */}
        <View style={[styles.segmentedControl, { backgroundColor: theme.surfaceSecondary }]}>
          {(['vocabulary', 'traffic'] as const).map((domain) => (
            <Pressable
              key={domain}
              style={[
                styles.segment,
                selectedDomain === domain && [styles.segmentActive, { backgroundColor: theme.cardBackground }],
              ]}
              onPress={() => {
                setSelectedDomain(domain);
                setSelectedCategory('All Categories');
              }}
            >
              <Text style={[
                styles.segmentText,
                { color: theme.textSecondary },
                selectedDomain === domain && { color: theme.text, fontWeight: FontWeight.semibold },
              ]}>
                {domain === 'vocabulary' ? 'Vocabulary' : 'Traffic Signs'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Category chips */}
        <Text style={[styles.fieldLabel, { color: theme.text }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {allCategories.map((cat, index) => {
            const isSelected = selectedCategory === cat.title;
            return (
              <Pressable
                key={index}
                style={[
                  styles.chip,
                  { borderColor: theme.border },
                  isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
                onPress={() => setSelectedCategory(cat.title)}
              >
                <Text style={[
                  styles.chipText,
                  { color: theme.text },
                  isSelected && { color: '#FFFFFF' },
                ]}>
                  {cat.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Question count */}
        <Text style={[styles.fieldLabel, { color: theme.text, marginTop: Spacing.xl }]}>Questions</Text>
        <View style={styles.countRow}>
          {counts.map((count) => {
            const isSelected = questionCount === count;
            return (
              <Pressable
                key={count}
                style={[
                  styles.countChip,
                  { borderColor: theme.border },
                  isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
                onPress={() => setQuestionCount(count)}
              >
                <Text style={[
                  styles.countText,
                  { color: theme.text },
                  isSelected && { color: '#FFFFFF' },
                ]}>
                  {count}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Start button */}
        <Pressable
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
          onPress={startQuiz}
        >
          <Text style={styles.primaryButtonText}>Start Quiz</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      </View>

      {/* Pronunciation Section */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>PRONUNCIATION</Text>
      <View style={styles.actionRow}>
        <Pressable
          style={[styles.actionCard, { backgroundColor: theme.cardBackground }]}
          onPress={() => router.push('/pronunciation')}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.accent + '15' }]}>
            <Mic size={22} color={theme.accent} />
          </View>
          <Text style={[styles.actionTitle, { color: theme.text }]}>Words</Text>
          <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>Practice speaking</Text>
        </Pressable>

        <Pressable
          style={[styles.actionCard, { backgroundColor: theme.cardBackground }]}
          onPress={() => router.push('/sentence-practice')}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.primary + '15' }]}>
            <MessageSquare size={22} color={theme.primary} />
          </View>
          <Text style={[styles.actionTitle, { color: theme.text }]}>Sentences</Text>
          <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>Full phrases</Text>
        </Pressable>
      </View>

      {/* More Tools */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>MORE TOOLS</Text>
      <View style={[styles.listCard, { backgroundColor: theme.cardBackground }]}>
        <Pressable
          style={[styles.listRow, { borderBottomColor: theme.divider }]}
          onPress={() => router.push('/grammar' as any)}
        >
          <View style={[styles.listIcon, { backgroundColor: theme.success + '15' }]}>
            <BookOpen size={18} color={theme.success} />
          </View>
          <View style={styles.listText}>
            <Text style={[styles.listTitle, { color: theme.text }]}>Grammar Topics</Text>
            <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>Rules & explanations</Text>
          </View>
          <ChevronRight size={18} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          style={[styles.listRow, { borderBottomColor: theme.divider }]}
          onPress={() => router.push('/grammar-check' as any)}
        >
          <View style={[styles.listIcon, { backgroundColor: '#8B5CF6' + '15' }]}>
            <PenTool size={18} color="#8B5CF6" />
          </View>
          <View style={styles.listText}>
            <Text style={[styles.listTitle, { color: theme.text }]}>Grammar Check</Text>
            <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>AI-powered feedback</Text>
          </View>
          <ChevronRight size={18} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          style={[styles.listRow, { borderBottomColor: theme.divider }]}
          onPress={() => router.push('/visual-vocab' as any)}
        >
          <View style={[styles.listIcon, { backgroundColor: theme.accent + '15' }]}>
            <Camera size={18} color={theme.accent} />
          </View>
          <View style={styles.listText}>
            <Text style={[styles.listTitle, { color: theme.text }]}>Visual Vocab</Text>
            <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>Learn from photos</Text>
          </View>
          <ChevronRight size={18} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          style={styles.listRow}
          onPress={() => router.push('/small-talk' as any)}
        >
          <View style={[styles.listIcon, { backgroundColor: theme.primary + '15' }]}>
            <MessageSquare size={18} color={theme.primary} />
          </View>
          <View style={styles.listText}>
            <Text style={[styles.listTitle, { color: theme.text }]}>Small Talk</Text>
            <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>AI conversations on any topic</Text>
          </View>
          <ChevronRight size={18} color={theme.textSecondary} />
        </Pressable>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  card: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
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
  // Segmented control
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: BorderRadius.sm,
    padding: 3,
    marginBottom: Spacing.xl,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  segmentActive: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  segmentText: {
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.medium,
  },
  // Fields
  fieldLabel: {
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  chipScroll: {
    flexGrow: 0,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  chipText: {
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.medium,
  },
  countRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  countChip: {
    width: 52,
    height: 40,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
  // Action cards (pronunciation)
  actionRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
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
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  actionTitle: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: FontSize.caption,
  },
  // List card (more tools)
  listCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
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
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  listText: {
    flex: 1,
  },
  listTitle: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.medium,
  },
  listSubtitle: {
    fontSize: FontSize.caption,
    marginTop: 1,
  },
});
