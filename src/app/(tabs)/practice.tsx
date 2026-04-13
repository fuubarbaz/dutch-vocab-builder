import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Mic, MessageSquare, PenTool, ChevronRight, BrainCircuit, TrafficCone, FileEdit } from 'lucide-react-native';

import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function PracticeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Unified Practice Section */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>PRACTICE</Text>
      <View style={[styles.listCard, { backgroundColor: theme.cardBackground }]}>
        <Pressable
          style={[styles.listRow, { borderBottomColor: theme.divider }]}
          onPress={() => router.push('/vocab-practice' as any)}
        >
          <View style={[styles.listIcon, { backgroundColor: theme.primary + '15' }]}>
            <BrainCircuit size={18} color={theme.primary} />
          </View>
          <View style={styles.listText}>
            <Text style={[styles.listTitle, { color: theme.text }]}>Vocab</Text>
            <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>Spaced repetition flashcards</Text>
          </View>
          <ChevronRight size={18} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          style={[styles.listRow, { borderBottomColor: theme.divider }]}
          onPress={() => router.push({ pathname: '/quiz', params: { domain: 'traffic', category: 'All Categories', count: '10' } } as any)}
        >
          <View style={[styles.listIcon, { backgroundColor: '#f59e0b15' }]}>
            <TrafficCone size={18} color="#f59e0b" />
          </View>
          <View style={styles.listText}>
            <Text style={[styles.listTitle, { color: theme.text }]}>Traffic Signs</Text>
            <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>Dutch road sign quiz</Text>
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
          style={styles.listRow}
          onPress={() => router.push('/writing-exam' as any)}
        >
          <View style={[styles.listIcon, { backgroundColor: '#e86912' + '15' }]}>
            <FileEdit size={18} color="#e86912" />
          </View>
          <View style={styles.listText}>
            <Text style={[styles.listTitle, { color: theme.text }]}>Writing Exam A2</Text>
            <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>Practice DUO schrijfvaardigheid</Text>
          </View>
          <ChevronRight size={18} color={theme.textSecondary} />
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
          onPress={() => router.push('/sentence-practice' as any)}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.primary + '15' }]}>
            <MessageSquare size={22} color={theme.primary} />
          </View>
          <Text style={[styles.actionTitle, { color: theme.text }]}>Sentences</Text>
          <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>Full phrases</Text>
        </Pressable>
      </View>

      {/* More Section */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>MORE</Text>
      <View style={[styles.listCard, { backgroundColor: theme.cardBackground }]}>
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
