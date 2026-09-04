import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useDutchSpeechRecognition } from '@/hooks/useDutchSpeechRecognition';
import { pronunciationAccuracy } from '@/utils/pronunciationAccuracy';
import { PRACTICE_SENTENCES, SENTENCE_TOPICS, Sentence } from '@/data/sentences';
import { speak as ttsSpeak, stopTTS } from '@/utils/tts';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';

const ACCENT = '#6366f1';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SentencePracticeScreen() {
  const { sentenceId } = useLocalSearchParams<{ sentenceId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [phase, setPhase] = useState<'setup' | 'quiz'>('setup');
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

  // Quiz state
  const [pool, setPool] = useState<Sentence[]>([]);
  const [poolIndex, setPoolIndex] = useState(0);
  const [targetSentence, setTargetSentence] = useState<Sentence | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const speech = useDutchSpeechRecognition({
    meterVolume: true,
    onVolume: (level) => { audioLevel.value = withTiming(level, { duration: 100 }); },
    onResult: (text) => {
      const target = targetRef.current;
      if (target) setAccuracy(pronunciationAccuracy(target.dutch, text));
    },
  });
  const { isRecording, isProcessing: isVoiceProcessing, transcript: spokenText } = speech;

  const audioLevel = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const targetRef = useRef<Sentence | null>(null);

  const animatedRecordButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  useEffect(() => { targetRef.current = targetSentence; }, [targetSentence]);

  const buildPool = (topics: Set<string>): Sentence[] => {
    const items = topics.size === 0
      ? PRACTICE_SENTENCES
      : PRACTICE_SENTENCES.filter(s => topics.has(s.topic));
    return shuffle(items);
  };

  const startQuiz = () => {
    const p = buildPool(selectedTopics);
    setPool(p);
    setPoolIndex(0);
    setTargetSentence(p[0] ?? null);
    speech.reset();
    setAccuracy(null);
    setPhase('quiz');
  };

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Speech recognition
  // Driven by isRecording rather than by the start call: a refused microphone
  // permission used to leave the button pulsing forever.
  useEffect(() => {
    pulseScale.value = isRecording
      ? withRepeat(withSequence(withTiming(1.1, { duration: 500 }), withTiming(1, { duration: 500 })), -1, true)
      : withTiming(1);
  }, [isRecording, pulseScale]);

  const startRecording = async () => {
    setAccuracy(null);
    await speech.start();
  };

  const stopRecording = () => speech.stop();

  const speakSentence = async () => {
    if (!targetSentence) return;
    if (isSpeaking) { stopTTS(); setIsSpeaking(false); return; }
    setIsSpeaking(true);
    await ttsSpeak(targetSentence.dutch, 0.85);
    setIsSpeaking(false);
  };

  const handleNext = () => {
    const nextIdx = poolIndex + 1 < pool.length ? poolIndex + 1 : 0;
    setPoolIndex(nextIdx);
    setTargetSentence(pool[nextIdx]);
    speech.reset(); setAccuracy(null);
  };

  const handleBack = () => {
    if (poolIndex > 0) {
      const prev = poolIndex - 1;
      setPoolIndex(prev);
      setTargetSentence(pool[prev]);
      speech.reset(); setAccuracy(null);
    }
  };

  // ── Setup phase ───────────────────────────────────────────────────────────

  if (phase === 'setup') {
    const allSelected = selectedTopics.size === 0;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Sentence Practice</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.setupScroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.setupTitle, { color: theme.text }]}>Choose Topics</Text>
          <Text style={[styles.setupSub, { color: theme.textSecondary }]}>
            Select which sentence topics to include
          </Text>

          <View style={styles.chipsWrap}>
            <Pressable
              style={[styles.chip, allSelected && { backgroundColor: ACCENT, borderColor: ACCENT }]}
              onPress={() => setSelectedTopics(new Set())}
            >
              <Text style={[styles.chipText, { color: allSelected ? '#fff' : theme.text }]}>All</Text>
            </Pressable>

            {SENTENCE_TOPICS.map(t => {
              const active = selectedTopics.has(t.id);
              return (
                <Pressable
                  key={t.id}
                  style={[styles.chip, { borderColor: active ? ACCENT : theme.border }, active && { backgroundColor: ACCENT + '18' }]}
                  onPress={() => toggleTopic(t.id)}
                >
                  <Text style={[styles.chipText, { color: active ? ACCENT : theme.text }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={[styles.startBtn, { backgroundColor: ACCENT }]} onPress={startQuiz}>
            <Text style={styles.startBtnText}>Start Practice</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Quiz phase ────────────────────────────────────────────────────────────

  let feedbackColor = theme.text;
  let feedbackMessage = 'Tap to speak';
  if (accuracy !== null) {
    if (accuracy > 80) { feedbackColor = '#28a745'; feedbackMessage = 'Excellent!'; }
    else if (accuracy > 50) { feedbackColor = '#ffc107'; feedbackMessage = 'Close, try again!'; }
    else { feedbackColor = '#dc3545'; feedbackMessage = 'Keep practicing!'; }
  }

  const topicLabel = selectedTopics.size === 0
    ? 'All topics'
    : SENTENCE_TOPICS.filter(t => selectedTopics.has(t.id)).map(t => t.label).join(', ');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => { speech.abort(); setPhase('setup'); }}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Sentence Practice</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {/* Topic badge */}
        <View style={[styles.topicBadge, { backgroundColor: ACCENT + '15' }]}>
          <Text style={[styles.topicBadgeText, { color: ACCENT }]} numberOfLines={1}>{topicLabel}</Text>
        </View>

        {/* Target sentence */}
        <View style={styles.wordCard}>
          <Text style={[styles.label, { color: theme.text, opacity: 0.6 }]}>Say this sentence:</Text>
          <View style={styles.dutchRow}>
            <Text style={[styles.targetDutch, { color: theme.text }]}>{targetSentence?.dutch}</Text>
            <Pressable
              onPress={speakSentence}
              style={[styles.listenButton, { backgroundColor: isSpeaking ? ACCENT : 'transparent', borderColor: ACCENT }]}
            >
              <Ionicons name={isSpeaking ? 'volume-high' : 'volume-medium-outline'} size={24} color={isSpeaking ? '#fff' : ACCENT} />
            </Pressable>
          </View>
          <Text style={[styles.targetEnglish, { color: ACCENT }]}>{targetSentence?.english}</Text>
          <Text style={[styles.progress, { color: theme.textSecondary }]}>{poolIndex + 1} / {pool.length}</Text>
        </View>

        {/* Feedback */}
        <View style={styles.feedbackContainer}>
          {accuracy !== null && (
            <View style={styles.scoreBadge}>
              <Text style={[styles.scoreText, { color: feedbackColor }]}>{accuracy}% Match</Text>
            </View>
          )}
          {!!spokenText && (
            <Text style={[styles.spokenText, { color: theme.text, opacity: 0.7 }]}>Heard: "{spokenText}"</Text>
          )}
          <Text style={[styles.feedbackMessage, { color: accuracy !== null ? feedbackColor : theme.text }]}>
            {isRecording ? 'Listening...' : feedbackMessage}
          </Text>
        </View>

        {/* Waveform */}
        <View style={styles.visualizerContainer}>
          {[1,2,3,4,5,6,7,8].map(i => (
            <WaveformBar key={i} index={i} audioLevel={audioLevel} theme={theme} isRecording={isRecording} />
          ))}
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <Pressable onPress={handleBack} disabled={poolIndex <= 0} style={{ opacity: poolIndex <= 0 ? 0.3 : 1 }}>
            <Ionicons name="chevron-back-circle" size={54} color={theme.text} />
          </Pressable>
          <Pressable onPress={isRecording ? stopRecording : startRecording} disabled={isVoiceProcessing}>
            <Animated.View style={[
              styles.recordButton,
              { backgroundColor: isRecording ? '#dc3545' : ACCENT, shadowColor: isRecording ? '#dc3545' : ACCENT },
              animatedRecordButtonStyle,
            ]}>
              {isVoiceProcessing
                ? <ActivityIndicator color="#fff" />
                : isRecording
                  ? <Ionicons name="square" size={32} color="#fff" />
                  : <Ionicons name="mic" size={48} color="#fff" />
              }
            </Animated.View>
          </Pressable>
          <Pressable onPress={handleNext}>
            <Ionicons name="chevron-forward-circle" size={54} color={theme.text} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const WaveformBar = ({ index, audioLevel, theme, isRecording }: { index: number; audioLevel: any; theme: any; isRecording: boolean }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const offset = 0.6 + ((index % 3) * 0.2);
    return {
      transform: [{ scaleY: withTiming(1 + audioLevel.value * 3 * offset, { duration: 100 }) }],
      opacity: withTiming(isRecording ? 0.3 + audioLevel.value * 0.7 : 0.1, { duration: 100 }),
    };
  });
  return <Animated.View style={[styles.meterBar, { backgroundColor: ACCENT, height: 20 }, animatedStyle]} />;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },

  // Setup
  setupScroll: { padding: Spacing.lg, paddingBottom: 60 },
  setupTitle: { fontSize: FontSize.title3, fontWeight: FontWeight.bold, marginBottom: 6, textAlign: 'center' },
  setupSub: { fontSize: FontSize.footnote, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 18 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  chip: {
    borderWidth: 1.5, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2,
    borderColor: '#ccc',
  },
  chipText: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  startBtn: {
    borderRadius: BorderRadius.lg, paddingVertical: Spacing.md + 2,
    alignItems: 'center', marginTop: Spacing.sm,
  },
  startBtnText: { color: '#fff', fontSize: FontSize.subhead, fontWeight: FontWeight.bold },

  // Quiz
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'space-between' },
  topicBadge: {
    paddingHorizontal: Spacing.md, paddingVertical: 4,
    borderRadius: BorderRadius.full, maxWidth: '80%',
  },
  topicBadgeText: { fontSize: FontSize.caption, fontWeight: FontWeight.medium },
  wordCard: { alignItems: 'center', paddingHorizontal: 16 },
  dutchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  listenButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  label: { fontSize: 16, marginBottom: 8 },
  targetDutch: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  targetEnglish: { fontSize: 18, fontWeight: '500', textAlign: 'center', marginBottom: 8 },
  progress: { fontSize: FontSize.caption },
  feedbackContainer: { alignItems: 'center', height: 120, justifyContent: 'center' },
  scoreBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 8 },
  scoreText: { fontSize: 24, fontWeight: 'bold' },
  spokenText: { fontSize: 16, fontStyle: 'italic', marginBottom: 8, textAlign: 'center' },
  feedbackMessage: { fontSize: 18, fontWeight: '600' },
  visualizerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 80, width: '100%', gap: 4 },
  meterBar: { width: 6, borderRadius: 3 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 40, marginBottom: 40 },
  recordButton: {
    width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
});
