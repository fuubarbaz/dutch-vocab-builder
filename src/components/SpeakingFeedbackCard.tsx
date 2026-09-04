import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle2, XCircle, Volume2, Sparkles } from 'lucide-react-native';
import { speak as ttsSpeak, stopTTS } from '@/utils/tts';
import { SpeakingFeedback } from '@/utils/speakingFeedback';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

/**
 * Renders one marked speaking answer.
 *
 * Shared by the written practice questions and the photo questions — both mark
 * against the same `SpeakingFeedback` shape, and were rendering it twice with
 * copies of this JSX that had already started to drift.
 */
export function SpeakingFeedbackCard({ feedback }: { feedback: SpeakingFeedback }) {
  const theme = Colors[useColorScheme() ?? 'light'];

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.header}>
        <Sparkles size={18} color={theme.primary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>Feedback</Text>
      </View>

      {feedback.summary ? (
        <Text style={[styles.summary, { color: theme.text }]}>{feedback.summary}</Text>
      ) : null}

      {feedback.checkpoints.map((c, i) => (
        <View key={i} style={[styles.row, { borderTopColor: theme.border }]}>
          {c.met
            ? <CheckCircle2 size={18} color={theme.success} />
            : <XCircle size={18} color={theme.danger} />}
          <View style={{ flex: 1 }}>
            <Text style={[styles.criterion, { color: theme.text }]}>{c.criterion}</Text>
            {c.explanation ? (
              <Text style={[styles.explanation, { color: theme.textSecondary }]}>{c.explanation}</Text>
            ) : null}
          </View>
        </View>
      ))}

      {feedback.languageNotes ? (
        <View style={[styles.row, { borderTopColor: theme.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.criterion, { color: theme.text }]}>Taal</Text>
            <Text style={[styles.explanation, { color: theme.textSecondary }]}>
              {feedback.languageNotes}
            </Text>
          </View>
        </View>
      ) : null}

      {feedback.improvedAnswer ? (
        <View style={[styles.improvedBox, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Zo kan het ook</Text>
          <View style={styles.improvedRow}>
            <Text style={[styles.improvedText, { color: theme.text }]}>{feedback.improvedAnswer}</Text>
            <TouchableOpacity
              onPress={() => { stopTTS(); ttsSpeak(feedback.improvedAnswer, 0.85); }}
              hitSlop={8}
            >
              <Volume2 size={18} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summary: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, lineHeight: 21 },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
  },
  criterion: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium, lineHeight: 18 },
  explanation: { fontSize: FontSize.caption, lineHeight: 17, marginTop: 2 },
  improvedBox: { borderRadius: BorderRadius.md, padding: Spacing.sm, gap: 4, marginTop: Spacing.xs },
  improvedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  improvedText: { flex: 1, fontSize: FontSize.subhead, lineHeight: 22 },
});
