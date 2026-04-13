import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Mail, FileText, ClipboardList, StickyNote, ChevronRight, BookOpen, PenLine } from 'lucide-react-native';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { writingExercises, WritingExercise, ExerciseType } from '@/data/writing_exam_exercises';

const TYPE_META: Record<ExerciseType, { label: string; labelEn: string; icon: React.ComponentType<any>; color: string }> = {
  email: { label: 'E-mail', labelEn: 'Email', icon: Mail, color: '#3b82f6' },
  article: { label: 'Artikel', labelEn: 'Article', icon: FileText, color: '#10b981' },
  form: { label: 'Formulier', labelEn: 'Form', icon: ClipboardList, color: '#f59e0b' },
  note: { label: 'Briefje', labelEn: 'Note', icon: StickyNote, color: '#8b5cf6' },
};

function ExerciseCard({
  exercise,
  theme,
  showEnglish,
  onPress,
}: {
  exercise: WritingExercise;
  theme: typeof Colors.light;
  showEnglish: boolean;
  onPress: () => void;
}) {
  const meta = TYPE_META[exercise.type];
  const Icon = meta.icon;

  return (
    <Pressable
      style={[styles.exerciseCard, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
    >
      <View style={[styles.exerciseIconWrap, { backgroundColor: meta.color + '18' }]}>
        <Icon size={22} color={meta.color} />
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseTitle, { color: theme.text }]}>
          {exercise.title}
        </Text>
        {showEnglish && (
          <Text style={[styles.exerciseTitleEn, { color: theme.textSecondary }]}>
            {exercise.titleEnglish}
          </Text>
        )}
        <View style={styles.typeBadgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: meta.color + '18' }]}>
            <Text style={[styles.typeBadgeText, { color: meta.color }]}>
              {showEnglish ? meta.labelEn : meta.label}
            </Text>
          </View>
          <Text style={[styles.examLabel, { color: theme.textSecondary }]}>
            Exam {exercise.examNumber}
          </Text>
        </View>
      </View>
      <ChevronRight size={18} color={theme.textSecondary} />
    </Pressable>
  );
}

export default function WritingExamScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [showEnglish, setShowEnglish] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ExerciseType | 'all'>('all');

  const filters: Array<{ key: ExerciseType | 'all'; label: string; labelEn: string }> = [
    { key: 'all', label: 'Alles', labelEn: 'All' },
    { key: 'email', label: 'E-mail', labelEn: 'Email' },
    { key: 'article', label: 'Artikel', labelEn: 'Article' },
    { key: 'form', label: 'Formulier', labelEn: 'Form' },
    { key: 'note', label: 'Briefje', labelEn: 'Note' },
  ];

  const filtered =
    selectedFilter === 'all'
      ? writingExercises
      : writingExercises.filter(e => e.type === selectedFilter);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: 'Schrijfvaardigheid A2',
          headerRight: () => (
            <Pressable
              onPress={() => setShowEnglish(v => !v)}
              style={[styles.translateBtn, { backgroundColor: showEnglish ? theme.primary + '20' : theme.surfaceSecondary }]}
            >
              <Text style={[styles.translateBtnText, { color: showEnglish ? theme.primary : theme.textSecondary }]}>
                {showEnglish ? 'NL+EN' : 'NL'}
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: theme.primary }]}>
          <View style={styles.heroIconRow}>
            <PenLine size={28} color="white" />
          </View>
          <Text style={styles.heroTitle}>Writing Exam Practice</Text>
          <Text style={styles.heroSubtitle}>
            {showEnglish
              ? 'Practice all 4 task types from the DUO A2 writing exam'
              : 'Oefen alle 4 opgavetypen van het DUO A2 schrijfexamen'}
          </Text>
          <View style={styles.heroStatsRow}>
            {[
              { n: '9', label: showEnglish ? 'Exercises' : 'Opgaven' },
              { n: '3', label: showEnglish ? 'Exams' : 'Examens' },
              { n: '4', label: showEnglish ? 'Types' : 'Types' },
            ].map(s => (
              <View key={s.label} style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{s.n}</Text>
                <Text style={styles.heroStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How it works */}
        <View style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>
            {showEnglish ? 'How it works' : 'Hoe werkt het?'}
          </Text>
          <View style={styles.infoRow}>
            <View style={[styles.infoStep, { backgroundColor: '#3b82f6' + '18' }]}>
              <BookOpen size={16} color="#3b82f6" />
            </View>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {showEnglish
                ? 'Example — Read the task and a model answer to learn the format'
                : 'Voorbeeld — Lees de opgave en een modelantwoord'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.infoStep, { backgroundColor: '#10b981' + '18' }]}>
              <PenLine size={16} color="#10b981" />
            </View>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {showEnglish
                ? 'Practice — Write your own answer and get AI feedback'
                : 'Oefenen — Schrijf zelf een antwoord en krijg AI-feedback'}
            </Text>
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map(f => (
            <Pressable
              key={f.key}
              onPress={() => setSelectedFilter(f.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedFilter === f.key ? theme.primary : theme.cardBackground,
                  borderColor:
                    selectedFilter === f.key ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: selectedFilter === f.key ? 'white' : theme.textSecondary },
                ]}
              >
                {showEnglish ? f.labelEn : f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Exercise list */}
        <View style={styles.listSection}>
          {filtered.map((exercise, idx) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              theme={theme}
              showEnglish={showEnglish}
              onPress={() =>
                router.push({
                  pathname: '/writing-exam-exercise',
                  params: { id: exercise.id, showEnglish: showEnglish ? '1' : '0' },
                } as any)
              }
            />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  translateBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    marginRight: 4,
  },
  translateBtnText: {
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.semibold,
  },

  heroCard: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  heroIconRow: { marginBottom: Spacing.md },
  heroTitle: {
    fontSize: FontSize.title2,
    fontWeight: FontWeight.bold,
    color: 'white',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: FontSize.subhead,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  heroStat: { alignItems: 'center' },
  heroStatNum: {
    fontSize: FontSize.title2,
    fontWeight: FontWeight.heavy,
    color: 'white',
  },
  heroStatLabel: {
    fontSize: FontSize.caption,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  infoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  infoTitle: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  infoStep: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.footnote,
    lineHeight: 20,
    paddingTop: 6,
  },

  filterRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.medium,
  },

  listSection: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  exerciseIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  exerciseInfo: { flex: 1 },
  exerciseTitle: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  exerciseTitleEn: {
    fontSize: FontSize.footnote,
    marginBottom: 6,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typeBadgeText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
  },
  examLabel: {
    fontSize: FontSize.caption,
  },
});
