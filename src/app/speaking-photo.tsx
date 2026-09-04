import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  Camera, ImagePlus, Mic, Square, Volume2, CheckCircle2, XCircle,
  RotateCcw, Sparkles, Eye, EyeOff,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { speak as ttsSpeak, stopTTS } from '@/utils/tts';
import { useAI, AIErrorBanner } from '@/context/AIContext';
import {
  SpeakingFeedback, PictureTask, parseSpeakingFeedback, parsePictureTask,
} from '@/utils/speakingFeedback';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type Level = 'A1' | 'A2' | 'B1';
const LEVELS: Level[] = ['A1', 'A2', 'B1'];

/**
 * Longest edge the photo is reduced to before it reaches the model.
 *
 * The vision encoder takes a small fixed input, so sending a full camera frame
 * only costs time and memory. 768px keeps signs and faces legible.
 */
const MAX_IMAGE_EDGE = 768;

export default function SpeakingPhotoScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];
  const {
    engineState, visionAvailable,
    generatePictureTask, reviewPictureAnswer,
  } = useAI();

  const [level, setLevel] = useState<Level>('A2');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [task, setTask] = useState<PictureTask | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildFailed, setBuildFailed] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [spoken, setSpoken] = useState('');
  const [micError, setMicError] = useState<string | null>(null);

  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [feedbackFailed, setFeedbackFailed] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);

  const silenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
    try { ExpoSpeechRecognitionModule.stop(); } catch { /* already stopped */ }
  }, []);

  const resetSilenceTimeout = useCallback(() => {
    if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
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

  const resetAnswer = () => {
    setSpoken('');
    setFeedback(null);
    setFeedbackFailed(false);
    setMicError(null);
  };

  /** Picks a photo, shrinks it, then asks the model to write a question about it. */
  const usePhoto = useCallback(async (fromCamera: boolean) => {
    stopTTS();
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setMicError(fromCamera
        ? 'Geen toegang tot de camera. Sta dit toe in Instellingen.'
        : 'Geen toegang tot uw foto\'s. Sta dit toe in Instellingen.');
      return;
    }

    const picked = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.9 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });
    if (picked.canceled || !picked.assets?.[0]) return;

    resetAnswer();
    setTask(null);
    setBuildFailed(false);
    setIsBuilding(true);

    try {
      const shrunk = await manipulateAsync(
        picked.assets[0].uri,
        [{ resize: { width: MAX_IMAGE_EDGE } }],
        { compress: 0.85, format: SaveFormat.JPEG },
      );
      setImageUri(shrunk.uri);

      // LiteRT-LM opens the path directly, so the file:// scheme has to go.
      const path = shrunk.uri.replace(/^file:\/\//, '');
      const raw = await generatePictureTask(path, level);
      const parsed = parsePictureTask(raw);
      if (parsed) setTask(parsed);
      else setBuildFailed(true);
    } catch {
      // Classified and toasted by AIContext.
      setBuildFailed(true);
    } finally {
      setIsBuilding(false);
    }
  }, [generatePictureTask, level]);

  const startRecording = useCallback(async () => {
    stopTTS();
    resetAnswer();
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

  const checkAnswer = useCallback(async () => {
    if (!spoken.trim() || !task || !imageUri || isChecking) return;
    setIsChecking(true);
    setFeedbackFailed(false);
    try {
      const path = imageUri.replace(/^file:\/\//, '');
      const raw = await reviewPictureAnswer(path, task.question, task.checkpoints, spoken.trim());
      const parsed = parseSpeakingFeedback(raw);
      if (parsed) setFeedback(parsed);
      else setFeedbackFailed(true);
    } catch {
      setFeedbackFailed(true);
    } finally {
      setIsChecking(false);
    }
  }, [imageUri, isChecking, reviewPictureAnswer, spoken, task]);

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

        {micError && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.summary, { color: theme.danger }]}>Microfoon</Text>
            <Text style={[styles.note, { color: theme.textSecondary }]}>{micError}</Text>
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

        {feedback && !isChecking && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.questionRow}>
              <Sparkles size={18} color={theme.primary} />
              <Text style={[styles.label, { color: theme.textSecondary }]}>FEEDBACK</Text>
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
                    <Text style={[styles.note, { color: theme.textSecondary }]}>{c.explanation}</Text>
                  ) : null}
                </View>
              </View>
            ))}

            {feedback.languageNotes ? (
              <View style={[styles.checkRow, { borderTopColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.checkCriterion, { color: theme.text }]}>Taal</Text>
                  <Text style={[styles.note, { color: theme.textSecondary }]}>{feedback.languageNotes}</Text>
                </View>
              </View>
            ) : null}

            {feedback.improvedAnswer ? (
              <View style={[styles.improvedBox, { backgroundColor: theme.surfaceSecondary }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>ZO KAN HET OOK</Text>
                <View style={styles.questionRow}>
                  <Text style={[styles.spokenText, { color: theme.text }]}>{feedback.improvedAnswer}</Text>
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
        )}
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
              onPress={isRecording ? stopRecording : startRecording}
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
