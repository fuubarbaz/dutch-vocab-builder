import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Mic, Square, Volume2, CheckCircle2, XCircle, Eye, EyeOff,
  ChevronRight, RotateCcw, Sparkles,
  ShoppingBasket, Bike, Utensils, Landmark, Umbrella, BookOpen, Laptop,
  MessagesSquare, Building2, House, Clapperboard, AlarmClock, Bus, ChefHat,
  Package, Truck, KeyRound, Phone, Stethoscope, Pill, Mail, Cake, Gift,
  HelpCircle,
} from 'lucide-react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { speak as ttsSpeak, stopTTS } from '@/utils/tts';
import { useAI, AIErrorBanner } from '@/context/AIContext';
import { SPEAKING_TASKS, SPEAKING_PARTS, SpeakingTask } from '@/data/speaking_exam';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

/** Scene icons, resolved from the `icon` name in the task data. */
const SCENE_ICONS: Record<string, React.ComponentType<any>> = {
  ShoppingBasket, Bike, Utensils, Landmark, Umbrella, BookOpen, Laptop,
  MessagesSquare, Building2, House, Clapperboard, AlarmClock, Bus, ChefHat,
  Package, Truck, KeyRound, Phone, Stethoscope, Pill, Mail, Cake, Gift,
};

// ─── AI feedback ────────────────────────────────────────────────────────────

interface SpeakingFeedback {
  summary: string;
  checkpoints: Array<{ criterion: string; met: boolean; explanation: string }>;
  languageNotes: string;
  improvedAnswer: string;
}

function buildPrompt(task: SpeakingTask, spoken: string): string {
  const checks = task.checkpoints.map((c, i) => `${i + 1}. ${c}`).join('\n');
  const scenes = task.scenes.length
    ? task.scenes.map((s, i) => `Plaatje ${i + 1}: ${s.caption}`).join('\n')
    : 'Geen plaatjes — de kandidaat kreeg een gesproken vraag.';

  return `[speaking-exam-evaluate]
You are marking an answer to the Dutch Inburgering A2 speaking exam (Spreken A2).
Be encouraging. This is A2: short, simple, correct sentences are enough for a pass.

Situation: ${task.context}
Question asked: ${task.question}
${scenes}

What the examiner listens for:
${checks}

The candidate said (transcribed from speech, so punctuation may be missing):
"""
${spoken}
"""

Judge only the content and the language, never the punctuation or capitalisation —
this is speech, not writing. Do not lower the mark for a short answer if it does
what was asked.

Respond ONLY with JSON, no other text and no markdown fences:
{
  "summary": "One encouraging sentence in English about the answer.",
  "checkpoints": [
    { "criterion": "the checkpoint text", "met": true or false, "explanation": "Short English note on why." }
  ],
  "languageNotes": "Any grammar or word-choice mistakes worth fixing, in English. If none, say 'No real mistakes.'",
  "improvedAnswer": "The candidate's own answer rewritten in correct, natural A2 Dutch. Keep their ideas and keep it short."
}`;
}

function parseFeedback(raw: string): SpeakingFeedback | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      checkpoints: Array.isArray(parsed.checkpoints) ? parsed.checkpoints : [],
      languageNotes: typeof parsed.languageNotes === 'string' ? parsed.languageNotes : '',
      improvedAnswer: typeof parsed.improvedAnswer === 'string' ? parsed.improvedAnswer : '',
    };
  } catch {
    return null;
  }
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function SpeakingExamExerciseScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { generate, engineState } = useAI();

  const task = useMemo(
    () => SPEAKING_TASKS.find(t => t.id === taskId) ?? SPEAKING_TASKS[0],
    [taskId],
  );
  const part = SPEAKING_PARTS.find(p => p.id === task.part)!;
  const nextTask = useMemo(() => {
    const i = SPEAKING_TASKS.findIndex(t => t.id === task.id);
    return i >= 0 && i < SPEAKING_TASKS.length - 1 ? SPEAKING_TASKS[i + 1] : null;
  }, [task]);

  const [isRecording, setIsRecording] = useState(false);
  const [spoken, setSpoken] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [feedbackFailed, setFeedbackFailed] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  // Speech recognition can fail quietly (permission denied, no nl-NL recogniser,
  // simulator with no mic). Without this the record button just does nothing.
  const [micError, setMicError] = useState<string | null>(null);

  // Stops a run-on recording when the candidate goes quiet, mirroring
  // sentence-practice so the two screens behave the same way.
  const silenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
    try { ExpoSpeechRecognitionModule.stop(); } catch { /* already stopped */ }
  }, []);

  const resetSilenceTimeout = useCallback(() => {
    if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
    // Longer than sentence-practice: exam answers are several sentences and
    // candidates pause to think mid-answer.
    silenceTimeout.current = setTimeout(() => stopRecording(), 5000);
  }, [stopRecording]);

  useSpeechRecognitionEvent('start', () => { setIsRecording(true); resetSilenceTimeout(); });
  useSpeechRecognitionEvent('end', () => {
    setIsRecording(false);
    if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
  });
  useSpeechRecognitionEvent('error', (e) => {
    setIsRecording(false);
    if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
    // "no-speech" just means they stayed quiet — not worth an error message.
    if (e?.error !== 'no-speech') {
      setMicError('Spraakherkenning werkt hier niet. Controleer de microfoon en of Nederlands beschikbaar is.');
    }
  });
  useSpeechRecognitionEvent('result', (e) => {
    resetSilenceTimeout();
    const transcript = e.results?.[0]?.transcript;
    if (transcript) setSpoken(transcript);
  });

  useEffect(() => () => {
    if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
    ExpoSpeechRecognitionModule.abort();
    stopTTS();
  }, []);

  const startRecording = useCallback(async () => {
    stopTTS();
    setSpoken('');
    setFeedback(null);
    setFeedbackFailed(false);
    setMicError(null);

    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setMicError('Geen toegang tot de microfoon. Sta dit toe in Instellingen om hardop te oefenen.');
      return;
    }
    try {
      ExpoSpeechRecognitionModule.start({ lang: 'nl-NL', interimResults: true });
    } catch {
      setMicError('Spraakherkenning kon niet starten. Probeer het opnieuw.');
    }
  }, []);

  const playQuestion = useCallback(() => {
    stopTTS();
    // Part 1 is a video of someone speaking, so the context belongs in the audio too.
    const text = task.part === 'video' ? `${task.context} ${task.question}` : task.question;
    ttsSpeak(text, 0.85);
  }, [task]);

  const checkAnswer = useCallback(async () => {
    if (!spoken.trim() || isChecking) return;
    setIsChecking(true);
    setFeedbackFailed(false);
    try {
      const raw = await generate(buildPrompt(task, spoken.trim()));
      const parsed = parseFeedback(raw);
      if (parsed) setFeedback(parsed);
      else setFeedbackFailed(true);
    } catch {
      // Already classified and toasted by AIContext.
      setFeedbackFailed(true);
    } finally {
      setIsChecking(false);
    }
  }, [generate, isChecking, spoken, task]);

  const goTo = (id: string) => {
    stopTTS();
    ExpoSpeechRecognitionModule.abort();
    router.replace({ pathname: '/speaking-exam-exercise', params: { taskId: id } } as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: `Onderdeel ${part.number}` }} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {engineState === 'error' && <AIErrorBanner />}

        {/* Part badge + translation toggle */}
        <View style={styles.topRow}>
          <View style={[styles.partBadge, { backgroundColor: part.color + '18' }]}>
            <Text style={[styles.partBadgeText, { color: part.color }]}>
              {part.title}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowEnglish(v => !v)} hitSlop={8} style={styles.translateBtn}>
            {showEnglish
              ? <EyeOff size={16} color={theme.textSecondary} />
              : <Eye size={16} color={theme.textSecondary} />}
            <Text style={[styles.translateText, { color: theme.textSecondary }]}>EN</Text>
          </TouchableOpacity>
        </View>

        {/* The question */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.context, { color: theme.textSecondary }]}>{task.context}</Text>
          {showEnglish && (
            <Text style={[styles.contextEn, { color: theme.textSecondary }]}>{task.contextEnglish}</Text>
          )}

          {task.scenes.length > 0 && (
            <View style={styles.scenesRow}>
              {task.scenes.map((scene, i) => (
                <View
                  key={i}
                  style={[styles.sceneCard, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                >
                  {task.scenes.length > 1 && (
                    <Text style={[styles.sceneNumber, { color: part.color }]}>{i + 1}</Text>
                  )}
                  {(() => {
                    const SceneIcon = SCENE_ICONS[scene.icon] ?? HelpCircle;
                    return <SceneIcon size={30} color={part.color} />;
                  })()}
                  <Text style={[styles.sceneCaption, { color: theme.text }]}>{scene.caption}</Text>
                  {showEnglish && (
                    <Text style={[styles.sceneCaptionEn, { color: theme.textSecondary }]}>
                      {scene.captionEnglish}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={styles.questionRow}>
            <Text style={[styles.question, { color: theme.text }]}>{task.question}</Text>
            <TouchableOpacity onPress={playQuestion} hitSlop={8} style={styles.iconBtn}>
              <Volume2 size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
          {showEnglish && (
            <Text style={[styles.questionEn, { color: theme.textSecondary }]}>{task.questionEnglish}</Text>
          )}
        </View>

        {/* What you said */}
        {spoken ? (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Uw antwoord</Text>
            <Text style={[styles.spokenText, { color: theme.text }]}>{spoken}</Text>
            <Text style={[styles.transcriptNote, { color: theme.textSecondary }]}>
              Transcribed from speech — leestekens tellen niet mee.
            </Text>
          </View>
        ) : null}

        {/* Feedback */}
        {isChecking && (
          <View style={[styles.card, styles.centerCard, { backgroundColor: theme.cardBackground }]}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Checking your answer…</Text>
          </View>
        )}

        {feedbackFailed && !isChecking && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.summary, { color: theme.text }]}>Could not check this answer</Text>
            <Text style={[styles.transcriptNote, { color: theme.textSecondary }]}>
              The feedback did not come back readable. Your answer was left unmarked rather than
              scored wrongly — try again.
            </Text>
          </View>
        )}

        {feedback && !isChecking && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.feedbackHeader}>
              <Sparkles size={18} color={theme.primary} />
              <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Feedback</Text>
            </View>
            <Text style={[styles.summary, { color: theme.text }]}>{feedback.summary}</Text>

            {feedback.checkpoints.map((c, i) => (
              <View key={i} style={[styles.checkRow, { borderTopColor: theme.border }]}>
                {c.met
                  ? <CheckCircle2 size={18} color={theme.success} />
                  : <XCircle size={18} color={theme.danger} />}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.checkCriterion, { color: theme.text }]}>{c.criterion}</Text>
                  {c.explanation ? (
                    <Text style={[styles.checkExplanation, { color: theme.textSecondary }]}>
                      {c.explanation}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}

            {feedback.languageNotes ? (
              <View style={[styles.checkRow, { borderTopColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.checkCriterion, { color: theme.text }]}>Taal</Text>
                  <Text style={[styles.checkExplanation, { color: theme.textSecondary }]}>
                    {feedback.languageNotes}
                  </Text>
                </View>
              </View>
            ) : null}

            {feedback.improvedAnswer ? (
              <View style={[styles.improvedBox, { backgroundColor: theme.surfaceSecondary }]}>
                <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Zo kan het ook</Text>
                <View style={styles.questionRow}>
                  <Text style={[styles.improvedText, { color: theme.text }]}>{feedback.improvedAnswer}</Text>
                  <TouchableOpacity
                    onPress={() => { stopTTS(); ttsSpeak(feedback.improvedAnswer, 0.85); }}
                    hitSlop={8}
                    style={styles.iconBtn}
                  >
                    <Volume2 size={18} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        )}

        {micError && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.summary, { color: theme.danger }]}>Microfoon</Text>
            <Text style={[styles.transcriptNote, { color: theme.textSecondary }]}>{micError}</Text>
            <Text style={[styles.transcriptNote, { color: theme.textSecondary }]}>
              U kunt het voorbeeldantwoord hieronder wel beluisteren en hardop nazeggen.
            </Text>
          </View>
        )}

        {/* Model answer */}
        <TouchableOpacity
          onPress={() => setShowSample(v => !v)}
          style={[styles.sampleToggle, { borderColor: theme.border }]}
        >
          <Text style={[styles.sampleToggleText, { color: theme.primary }]}>
            {showSample ? 'Verberg voorbeeldantwoord' : 'Toon voorbeeldantwoord'}
          </Text>
        </TouchableOpacity>

        {showSample && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.questionRow}>
              <Text style={[styles.sampleText, { color: theme.text }]}>{task.sampleAnswer}</Text>
              <TouchableOpacity
                onPress={() => { stopTTS(); ttsSpeak(task.sampleAnswer, 0.85); }}
                hitSlop={8}
                style={styles.iconBtn}
              >
                <Volume2 size={18} color={theme.primary} />
              </TouchableOpacity>
            </View>
            {showEnglish && (
              <Text style={[styles.sampleTextEn, { color: theme.textSecondary }]}>
                {task.sampleAnswerEnglish}
              </Text>
            )}
          </View>
        )}

        {nextTask && (
          <TouchableOpacity onPress={() => goTo(nextTask.id)} style={styles.nextBtn}>
            <Text style={[styles.nextBtnText, { color: theme.primary }]}>Volgende vraag</Text>
            <ChevronRight size={18} color={theme.primary} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Record bar */}
      <View style={[styles.recordBar, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
        {spoken && !isRecording ? (
          <TouchableOpacity onPress={startRecording} style={styles.retryBtn} hitSlop={8}>
            <RotateCcw size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          style={[
            styles.micBtn,
            { backgroundColor: isRecording ? theme.danger : theme.primary },
          ]}
        >
          {isRecording ? <Square size={20} color="#fff" /> : <Mic size={22} color="#fff" />}
          <Text style={styles.micBtnText}>
            {isRecording ? 'Stop' : spoken ? 'Opnieuw' : 'Spreek uw antwoord in'}
          </Text>
        </TouchableOpacity>

        {spoken && !isRecording ? (
          <TouchableOpacity
            onPress={checkAnswer}
            disabled={isChecking}
            style={[
              styles.checkBtn,
              { backgroundColor: isChecking ? theme.surfaceSecondary : theme.success },
            ]}
          >
            <Text style={styles.checkBtnText}>Nakijken</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.md },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  partBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  partBadgeText: { fontSize: FontSize.caption, fontWeight: FontWeight.semibold },
  translateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  translateText: { fontSize: FontSize.caption, fontWeight: FontWeight.semibold },

  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.sm },
  centerCard: { alignItems: 'center' },
  cardLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  context: { fontSize: FontSize.subhead, fontWeight: FontWeight.medium },
  contextEn: { fontSize: FontSize.footnote, fontStyle: 'italic' },

  scenesRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  sceneCard: {
    flex: 1,
    minWidth: 96,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    gap: 4,
    alignItems: 'center',
  },
  sceneNumber: { fontSize: FontSize.caption, fontWeight: FontWeight.bold },
  sceneCaption: { fontSize: FontSize.footnote, textAlign: 'center', lineHeight: 17 },
  sceneCaptionEn: { fontSize: FontSize.caption, textAlign: 'center', fontStyle: 'italic', lineHeight: 15 },

  questionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  question: { flex: 1, fontSize: FontSize.body, fontWeight: FontWeight.semibold, lineHeight: 24 },
  questionEn: { fontSize: FontSize.footnote, fontStyle: 'italic', lineHeight: 18 },
  iconBtn: { padding: 2 },

  spokenText: { fontSize: FontSize.subhead, lineHeight: 22 },
  transcriptNote: { fontSize: FontSize.caption, fontStyle: 'italic', lineHeight: 16 },

  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  summary: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, lineHeight: 21 },
  checkRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
  },
  checkCriterion: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium, lineHeight: 18 },
  checkExplanation: { fontSize: FontSize.caption, lineHeight: 17, marginTop: 2 },
  improvedBox: { borderRadius: BorderRadius.md, padding: Spacing.sm, gap: 4, marginTop: Spacing.xs },
  improvedText: { flex: 1, fontSize: FontSize.subhead, lineHeight: 22 },

  sampleToggle: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  sampleToggleText: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },
  sampleText: { flex: 1, fontSize: FontSize.subhead, lineHeight: 22 },
  sampleTextEn: { fontSize: FontSize.footnote, fontStyle: 'italic', lineHeight: 18 },

  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
  },
  nextBtnText: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },

  recordBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  micBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  micBtnText: { color: '#fff', fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  retryBtn: { padding: Spacing.sm },
  checkBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  checkBtnText: { color: '#fff', fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
});
