import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Mic, ChevronRight, BookOpen, Clock, ListChecks, Video, Image as ImageIcon, Images, Layers,
  Camera,
} from 'lucide-react-native';
import {
  SPEAKING_PARTS, SPEAKING_TASKS, SPEAKING_EXAM_FACTS, SpeakingPartId,
} from '@/data/speaking_exam';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const PART_ICON: Record<SpeakingPartId, React.ComponentType<any>> = {
  video: Video,
  plaatje1: ImageIcon,
  plaatje2: Images,
  plaatje3: Layers,
};

export default function SpeakingExamScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();
  const [showEnglish, setShowEnglish] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Spreken A2' }} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introRow}>
          <Mic size={22} color={theme.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.introTitle, { color: theme.text }]}>Examen Spreken A2</Text>
            <Text style={[styles.introSub, { color: theme.textSecondary }]}>
              Oefen hardop. U spreekt uw antwoord in en krijgt meteen feedback.
            </Text>
          </View>
        </View>

        {/* Exam facts */}
        <View style={[styles.factsCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.factItem}>
            <ListChecks size={18} color={theme.primary} />
            <Text style={[styles.factValue, { color: theme.text }]}>{SPEAKING_EXAM_FACTS.questions}</Text>
            <Text style={[styles.factLabel, { color: theme.textSecondary }]}>vragen</Text>
          </View>
          <View style={[styles.factDivider, { backgroundColor: theme.border }]} />
          <View style={styles.factItem}>
            <Clock size={18} color={theme.primary} />
            <Text style={[styles.factValue, { color: theme.text }]}>{SPEAKING_EXAM_FACTS.minutes}</Text>
            <Text style={[styles.factLabel, { color: theme.textSecondary }]}>minuten</Text>
          </View>
          <View style={[styles.factDivider, { backgroundColor: theme.border }]} />
          <View style={styles.factItem}>
            <Layers size={18} color={theme.primary} />
            <Text style={[styles.factValue, { color: theme.text }]}>{SPEAKING_EXAM_FACTS.parts}</Text>
            <Text style={[styles.factLabel, { color: theme.textSecondary }]}>onderdelen</Text>
          </View>
        </View>

        {/* Cheat sheet */}
        <Pressable
          style={[styles.cheatCard, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/speaking-cheatsheet' as any)}
        >
          <BookOpen size={22} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.cheatTitle}>Spiekbriefje</Text>
            <Text style={styles.cheatSub}>Zinnen die u in elk onderdeel kunt gebruiken</Text>
          </View>
          <ChevronRight size={20} color="#fff" />
        </Pressable>

        <Pressable
          style={[styles.photoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          onPress={() => router.push('/speaking-photo' as any)}
        >
          <View style={[styles.partIcon, { backgroundColor: '#10b98118' }]}>
            <Camera size={20} color="#10b981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.partTitle, { color: theme.text }]}>Oefenen met uw eigen foto</Text>
            <Text style={[styles.partInstruction, { color: theme.textSecondary }]}>
              Maak een foto en krijg er een examenvraag bij. Uw antwoord wordt tegen de foto
              zelf nagekeken.
            </Text>
          </View>
          <ChevronRight size={20} color={theme.textSecondary} />
        </Pressable>

        <Pressable onPress={() => setShowEnglish(v => !v)} hitSlop={8} style={styles.langToggle}>
          <Text style={[styles.langToggleText, { color: theme.primary }]}>
            {showEnglish ? 'Verberg Engels' : 'Toon Engels'}
          </Text>
        </Pressable>

        {/* Parts */}
        {SPEAKING_PARTS.map(part => {
          const tasks = SPEAKING_TASKS.filter(t => t.part === part.id);
          const Icon = PART_ICON[part.id];
          return (
            <View key={part.id} style={styles.partBlock}>
              <View style={styles.partHeader}>
                <View style={[styles.partIcon, { backgroundColor: part.color + '18' }]}>
                  <Icon size={20} color={part.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.partTitle, { color: theme.text }]}>
                    Onderdeel {part.number} — {part.title}
                  </Text>
                  <Text style={[styles.partInstruction, { color: theme.textSecondary }]}>
                    {showEnglish ? part.instructionEnglish : part.instruction}
                  </Text>
                </View>
              </View>

              <View style={styles.group}>
                {tasks.map((task, i) => (
                  <React.Fragment key={task.id}>
                    <Pressable
                      style={[styles.taskRow, { backgroundColor: theme.cardBackground }]}
                      onPress={() =>
                        router.push({
                          pathname: '/speaking-exam-exercise',
                          params: { taskId: task.id },
                        } as any)
                      }
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.taskContext, { color: theme.text }]}>
                          {showEnglish ? task.contextEnglish : task.context}
                        </Text>
                        <Text
                          style={[styles.taskQuestion, { color: theme.textSecondary }]}
                          numberOfLines={2}
                        >
                          {showEnglish ? task.questionEnglish : task.question}
                        </Text>
                      </View>
                      <ChevronRight size={18} color={theme.textSecondary} />
                    </Pressable>
                    {i < tasks.length - 1 && (
                      <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          );
        })}

        <Text style={[styles.footnote, { color: theme.textSecondary }]}>
          De opdrachten hier zijn zelf geschreven en volgen de opzet van het officiële DUO
          oefenexamen. Het echte examen gebruikt video's en foto's; hier staat bij elk plaatje
          een korte beschrijving.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.md },

  introRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  introTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  introSub: { fontSize: FontSize.footnote, lineHeight: 18, marginTop: 2 },

  factsCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
  },
  factItem: { flex: 1, alignItems: 'center', gap: 2 },
  factValue: { fontSize: FontSize.title3, fontWeight: FontWeight.bold },
  factLabel: { fontSize: FontSize.caption },
  factDivider: { width: StyleSheet.hairlineWidth },

  cheatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  cheatTitle: { color: '#fff', fontSize: FontSize.subhead, fontWeight: FontWeight.bold },
  cheatSub: { color: '#ffffffcc', fontSize: FontSize.footnote, marginTop: 1 },

  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  langToggle: { alignSelf: 'flex-end' },
  langToggleText: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },

  partBlock: { gap: Spacing.sm },
  partHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  partIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  partInstruction: { fontSize: FontSize.footnote, lineHeight: 18, marginTop: 1 },

  group: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  taskContext: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },
  taskQuestion: { fontSize: FontSize.footnote, lineHeight: 17, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.md },

  footnote: { fontSize: FontSize.caption, lineHeight: 16, fontStyle: 'italic', marginTop: Spacing.sm },
});
