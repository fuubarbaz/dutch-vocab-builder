import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Headphones, ChevronRight } from 'lucide-react-native';
import { LISTENING_EXERCISES } from '@/data/listening_exercises';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function ListeningExamScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Listening Exam' }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={[styles.headerCard, { backgroundColor: theme.cardBackground }]}>
          <View style={[styles.headerIcon, { backgroundColor: '#0ea5e9' + '18' }]}>
            <Headphones size={28} color="#0ea5e9" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>A2 Listening Practice</Text>
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
              Listen to Dutch conversations, then answer comprehension questions.
            </Text>
          </View>
        </View>

        {LISTENING_EXERCISES.map((ex, i) => (
          <TouchableOpacity
            key={ex.id}
            style={[styles.row, { backgroundColor: theme.cardBackground }]}
            onPress={() => router.push(`/listening-exercise/${ex.id}` as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.numBadge, { backgroundColor: '#0ea5e9' + '18' }]}>
              <Text style={[styles.numText, { color: '#0ea5e9' }]}>{i + 1}</Text>
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>{ex.title}</Text>
              <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
                {ex.questions.length} questions
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        ))}

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  headerIcon: { width: 52, height: 52, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.title3, fontWeight: FontWeight.bold, marginBottom: 3 },
  headerSub: { fontSize: FontSize.footnote, lineHeight: 18 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  numBadge: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: FontSize.subhead, fontWeight: FontWeight.bold },
  rowText: { flex: 1 },
  rowTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, marginBottom: 2 },
  rowSub: { fontSize: FontSize.footnote },
});
