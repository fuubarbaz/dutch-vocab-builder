import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { School, FileText, Headphones, ChevronRight } from 'lucide-react-native';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const ITEMS = [
  {
    icon: School,
    title: 'KNM Exam',
    subtitle: 'Kennis van de Nederlandse Maatschappij',
    description: 'Study Dutch society, culture and history with lessons and AI-powered quizzes.',
    color: '#6366f1',
    route: '/(tabs)/knm',
  },
  {
    icon: FileText,
    title: 'Writing Exam',
    subtitle: 'A2 writing practice',
    description: 'Practice structured writing exercises to prepare for the A2 exam.',
    color: '#ef4444',
    route: '/writing-exam',
  },
  {
    icon: Headphones,
    title: 'Listening Exam',
    subtitle: 'A2 listening practice',
    description: 'Listen to Dutch conversations and answer comprehension questions.',
    color: '#0ea5e9',
    route: '/listening-exam',
  },
];

export default function A2Screen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={[styles.headerCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>A2 Exam Prep</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            Everything you need to prepare for the Dutch A2 civic integration exam.
          </Text>
        </View>

        <View style={styles.group}>
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.route}>
                <TouchableOpacity
                  style={[styles.row, { backgroundColor: theme.cardBackground }]}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.color + '18' }]}>
                    <Icon size={24} color={item.color} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.rowSubtitle, { color: item.color }]}>{item.subtitle}</Text>
                    <Text style={[styles.rowDesc, { color: theme.textSecondary }]}>{item.description}</Text>
                  </View>
                  <ChevronRight size={18} color={theme.textSecondary} />
                </TouchableOpacity>
                {i < ITEMS.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: theme.border }]} />
                )}
              </React.Fragment>
            );
          })}
        </View>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg },
  headerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  headerTitle: { fontSize: FontSize.title3, fontWeight: FontWeight.bold, marginBottom: 4 },
  headerSub: { fontSize: FontSize.footnote, lineHeight: 18 },
  group: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.bold, marginBottom: 2 },
  rowSubtitle: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium, marginBottom: 3 },
  rowDesc: { fontSize: FontSize.footnote, lineHeight: 18 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 48 + Spacing.md + Spacing.lg },
});
