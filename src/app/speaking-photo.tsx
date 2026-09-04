import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  Camera, ImagePlus, Mic, Square, Volume2, CheckCircle2, XCircle,
  RotateCcw, Sparkles, Eye, EyeOff,
} from 'lucide-react-native';
import { pickAndPreparePhoto } from '@/utils/photoInput';
import { speak as ttsSpeak, stopTTS } from '@/utils/tts';
import { useAI, AIErrorBanner } from '@/context/AIContext';
import { useMistakeJournal } from '@/context/MistakeJournalContext';
import { useDutchSpeechRecognition } from '@/hooks/useDutchSpeechRecognition';
import {
  SpeakingFeedback, PictureTask, parseSpeakingFeedback, parsePictureTask,
} from '@/utils/speakingFeedback';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SpeakingFeedbackCard } from '@/components/SpeakingFeedbackCard';

type Level = 'A1' | 'A2' | 'B1';
const LEVELS: Level[] = ['A1', 'A2', 'B1'];

export default function SpeakingPhotoScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];
  const {
    engineState, visionAvailable,
    generatePictureTask, reviewPictureAnswer,
  } = useAI();
  const { logSentenceMistake } = useMistakeJournal();

  const [level, setLevel] = useState<Level>('A2');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [task, setTask] = useState<PictureTask | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildFailed, setBuildFailed] = useState(false);

  const speech = useDutchSpeechRecognition({ silenceMs: 5000 });
  const { isRecording, transcript: spoken, error: micError } = speech;

  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [feedbackFailed, setFeedbackFailed] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  // Camera and library refusals are a separate problem from the microphone, and
  // used to be reported through the same slot as if they were the same thing.
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => () => { stopTTS(); }, []);

  const resetAnswer = useCallback(() => {
    speech.reset();
    setFeedback(null);
    setFeedbackFailed(false);
  }, [speech]);

  /** Picks a photo, shrinks it, then asks the model to write a question about it. */
  /** Picks a photo, shrinks it, then asks the model to write a question about it. */
  const usePhoto = useCallback(async (fromCamera: boolean) => {
    stopTTS();
    setPhotoError(null);

    const photo = await pickAndPreparePhoto(fromCamera);
    if (photo.status === 'cancelled') return;
    if (photo.status === 'denied') {
      setPhotoError(photo.message);
      return;
    }

    resetAnswer();
    setTask(null);
    setBuildFailed(false);
    setIsBuilding(true);
    setImageUri(photo.uri);

    try {
      const raw = await generatePictureTask(photo.path, level);
      const parsed = parsePictureTask(raw);
      if (parsed) setTask(parsed);
      else setBuildFailed(true);
    } catch {
      // Classified and toasted by AIContext.
      setBuildFailed(true);
    } finally {
      setIsBuilding(false);
    }
  }, [generatePictureTask, level, resetAnswer]);

  const startRecording = useCallback(async () => {
    stopTTS();
    setFeedback(null);
    setFeedbackFailed(false);
    await speech.start();
  }, [speech]);

  const checkAnswer = useCallback(async () => {
    if (!spoken.trim() || !task || !imageUri || isChecking) return;
    setIsChecking(true);
    setFeedbackFailed(false);
    try {
      const raw = await reviewPictureAnswer(
        imageUri.replace(/^file:\/\//, ''), task.question, task.checkpoints, spoken.trim());
      const parsed = parseSpeakingFeedback(raw);
      if (parsed) {
        setFeedback(parsed);
        // Same treatment roleplay gives its corrections: a spoken answer that needed
        // fixing is a mistake worth seeing again, not just feedback you scroll past.
        if (parsed.improvedAnswer && parsed.checkpoints.some(c => !c.met)) {
          await logSentenceMistake({
            original: spoken.trim(),
            corrected: parsed.improvedAnswer,
            note: parsed.languageNotes || undefined,
            scenario: task?.context || 'Eigen foto',
          });
        }
      } else {
        setFeedbackFailed(true);
      }
    } catch {
      setFeedbackFailed(true);
    } finally {
      setIsChecking(false);
    }
  }, [imageUri, isChecking, logSentenceMistake, reviewPictureAnswer, spoken, task]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Eigen foto' }} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {engineState === 'error' && <AIErrorBanner />}

        {visionAvailable === false && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.summary, { color: theme.danger }]}>Foto's werken hier niet</Text>
            <Text style={[styles.note, { color: theme.textSecondary }]}>
              Het model is op dit apparaat zonder beeldherkenning geladen. De vragen met
              vaste plaatjes in het examenonderdeel werken wel gewoon.
            </Text>
          </View>
        )}

        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          Maak een foto van iets om u heen — uw keuken, de supermarkt, de bushalte. U krijgt
          er een examenvraag bij en uw antwoord wordt tegen de foto zelf nagekeken.
        </Text>

        {!task && !isBuilding && (
          <>
            <Text style={[styles.label, { color: theme.textSecondary }]}>NIVEAU</Text>
            <View style={styles.levelRow}>
              {LEVELS.map(l => {
                const active = l === level;
                return (
                  <TouchableOpacity
                    key={l}
                    onPress={() => setLevel(l)}
                    style={[
                      styles.levelChip,
                      {
                        backgroundColor: active ? theme.primary : theme.cardBackground,
                        borderColor: active ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.levelChipText, { color: active ? '#fff' : theme.text }]}>{l}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="cover" />
        )}

        {isBuilding && (
          <View style={[styles.card, styles.centerCard, { backgroundColor: theme.cardBackground }]}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.note, { color: theme.textSecondary }]}>
              De vraag wordt bij uw foto gemaakt…
            </Text>
          </View>
        )}

        {buildFailed && !isBuilding && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.summary, { color: theme.text }]}>Geen vraag gemaakt</Text>
            <Text style={[styles.note, { color: theme.textSecondary }]}>
              Er kwam geen bruikbare vraag terug. Probeer een foto met wat meer erop, of
              probeer het opnieuw.
            </Text>
          </View>
        )}

        {task && !isBuilding && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            {task.context ? (
              <Text style={[styles.context, { color: theme.textSecondary }]}>{task.context}</Text>
            ) : null}
            <View style={styles.questionRow}>
              <Text style={[styles.question, { color: theme.text }]}>{task.question}</Text>
              <TouchableOpacity
                onPress={() => { stopTTS(); ttsSpeak(task.question, 0.85); }}
                hitSlop={8}
              >
                <Volume2 size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setShowEnglish(v => !v)} hitSlop={8} style={styles.checkToggle}>
              {showEnglish
                ? <EyeOff size={14} color={theme.textSecondary} />
                : <Eye size={14} color={theme.textSecondary} />}
              <Text style={[styles.note, { color: theme.textSecondary }]}>
                {showEnglish ? 'Verberg waar de examinator op let' : 'Waar let de examinator op?'}
              </Text>
            </TouchableOpacity>
            {showEnglish && task.checkpoints.map((c, i) => (
              <Text key={i} style={[styles.note, { color: theme.textSecondary }]}>• {c}</Text>
            ))}
          </View>
        )}

        {spoken ? (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>UW ANTWOORD</Text>
            <Text style={[styles.spokenText, { color: theme.text }]}>{spoken}</Text>
          </View>
        ) : null}

        {(micError || photoError) && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.summary, { color: theme.danger }]}>
              {micError ? 'Microfoon' : 'Foto'}
            </Text>
            <Text style={[styles.note, { color: theme.textSecondary }]}>{micError ?? photoError}</Text>
          </View>
        )}

        {isChecking && (
          <View style={[styles.card, styles.centerCard, { backgroundColor: theme.cardBackground }]}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.note, { color: theme.textSecondary }]}>Uw antwoord wordt nagekeken…</Text>
          </View>
        )}

        {feedbackFailed && !isChecking && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.summary, { color: theme.text }]}>Niet nagekeken</Text>
            <Text style={[styles.note, { color: theme.textSecondary }]}>
              De feedback kwam niet leesbaar terug. Uw antwoord is daarom niet beoordeeld
              in plaats van verkeerd beoordeeld.
            </Text>
          </View>
        )}

        {feedback && !isChecking && <SpeakingFeedbackCard feedback={feedback} />}
      </ScrollView>

      <View style={[styles.bar, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
        {task && !isBuilding ? (
          <>
            {spoken && !isRecording ? (
              <TouchableOpacity onPress={startRecording} hitSlop={8} style={styles.iconBtn}>
                <RotateCcw size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={isRecording ? speech.stop : startRecording}
              style={[styles.mainBtn, { backgroundColor: isRecording ? theme.danger : theme.primary }]}
            >
              {isRecording ? <Square size={20} color="#fff" /> : <Mic size={22} color="#fff" />}
              <Text style={styles.mainBtnText}>
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
                <Text style={styles.mainBtnText}>Nakijken</Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => usePhoto(true)}
              disabled={isBuilding}
              style={[styles.mainBtn, { backgroundColor: theme.primary }]}
            >
              <Camera size={20} color="#fff" />
              <Text style={styles.mainBtnText}>Foto maken</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => usePhoto(false)}
              disabled={isBuilding}
              style={[styles.secondaryBtn, { borderColor: theme.border }]}
            >
              <ImagePlus size={20} color={theme.primary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {task && (
        <TouchableOpacity
          onPress={() => { setTask(null); setImageUri(null); resetAnswer(); }}
          style={[styles.newPhotoBtn, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}
        >
          <Text style={[styles.newPhotoText, { color: theme.primary }]}>Andere foto</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.md },

  intro: { fontSize: FontSize.footnote, lineHeight: 19 },
  label: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  levelRow: { flexDirection: 'row', gap: Spacing.sm },
  levelChip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  levelChipText: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },

  photo: { width: '100%', height: 220, borderRadius: BorderRadius.lg },

  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.sm },
  centerCard: { alignItems: 'center' },
  context: { fontSize: FontSize.subhead, fontWeight: FontWeight.medium },
  questionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  question: { flex: 1, fontSize: FontSize.body, fontWeight: FontWeight.semibold, lineHeight: 24 },
  checkToggle: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  spokenText: { flex: 1, fontSize: FontSize.subhead, lineHeight: 22 },
  summary: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, lineHeight: 21 },
  note: { fontSize: FontSize.footnote, lineHeight: 18 },

  checkRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
  },
  checkCriterion: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium, lineHeight: 18 },
  improvedBox: { borderRadius: BorderRadius.md, padding: Spacing.sm, gap: 4, marginTop: Spacing.xs },

  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  mainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  mainBtnText: { color: '#fff', fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  secondaryBtn: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  checkBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  iconBtn: { padding: Spacing.sm },

  newPhotoBtn: { alignItems: 'center', paddingVertical: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  newPhotoText: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },
});
