import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Play, Square, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react-native';
import { LISTENING_EXERCISES, ListeningQuestion } from '@/data/listening_exercises';
import { speakInLanguage, stopTTS, startNewPlayback, getPlaybackGeneration } from '@/utils/tts';
import { useSettings } from '@/context/SettingsContext';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const ACCENT = '#0ea5e9';

type AnswerState = Record<number, string>; // questionIndex → chosen option

function parseDialogueTurns(dialogue: string): { speaker: string; text: string }[] {
  return dialogue.split('\n').map(line => {
    const m = line.match(/^([AB]):\s*(.+)/);
    return m ? { speaker: m[1], text: m[2] } : { speaker: '', text: line };
  }).filter(t => t.text);
}

export default function ListeningExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { speechRate } = useSettings();

  const exercise = LISTENING_EXERCISES.find(e => e.id === id);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTurn, setActiveTurn] = useState<number | null>(null);
  const [showText, setShowText] = useState(false);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const stopRef = useRef(false);

  useEffect(() => () => { stopRef.current = true; stopTTS(); }, []);

  if (!exercise) return null;

  const turns = parseDialogueTurns(exercise.dialogue);

  const speakTurn = (text: string): Promise<void> =>
    new Promise(resolve => {
      speakInLanguage(text, 'nl', speechRate * 0.9, {
        onDone: resolve, onError: resolve, onStopped: resolve,
      });
    });

  const playAll = async () => {
    if (isPlaying) {
      stopRef.current = true;
      stopTTS();
      setIsPlaying(false);
      setActiveTurn(null);
      return;
    }

    const gen = startNewPlayback();
    stopRef.current = false;
    setIsPlaying(true);

    for (let i = 0; i < turns.length; i++) {
      if (stopRef.current || getPlaybackGeneration() !== gen) break;
      setActiveTurn(i);
      await speakTurn(turns[i].text);
      if (stopRef.current || getPlaybackGeneration() !== gen) break;
      await new Promise(r => setTimeout(r, 350));
    }

    if (getPlaybackGeneration() === gen) {
      setIsPlaying(false);
      setActiveTurn(null);
    }
  };

  const selectAnswer = (qIdx: number, option: string) => {
    if (submitted[qIdx]) return;
    setAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const submitAnswer = (qIdx: number) => {
    if (!answers[qIdx]) return;
    setSubmitted(prev => ({ ...prev, [qIdx]: true }));
  };

  const score = exercise.questions.filter((q, i) => submitted[i] && answers[i] === q.answer).length;
  const totalSubmitted = Object.keys(submitted).length;
  const allDone = totalSubmitted === exercise.questions.length;

  const optionStyle = (q: ListeningQuestion, qIdx: number, opt: string) => {
    const isSelected = answers[qIdx] === opt;
    const isRevealed = submitted[qIdx];
    const isCorrect = opt === q.answer;

    if (!isRevealed) {
      return [
        styles.option,
        { borderColor: isSelected ? ACCENT : theme.border, backgroundColor: isSelected ? ACCENT + '12' : theme.cardBackground },
      ];
    }
    if (isCorrect) {
      return [styles.option, { borderColor: '#10b981', backgroundColor: '#10b981' + '18' }];
    }
    if (isSelected && !isCorrect) {
      return [styles.option, { borderColor: '#ef4444', backgroundColor: '#ef4444' + '12' }];
    }
    return [styles.option, { borderColor: theme.border, backgroundColor: theme.cardBackground }];
  };

  const optionTextColor = (q: ListeningQuestion, qIdx: number, opt: string) => {
    if (!submitted[qIdx]) return answers[qIdx] === opt ? ACCENT : theme.text;
    if (opt === q.answer) return '#10b981';
    if (answers[qIdx] === opt) return '#ef4444';
    return theme.textSecondary;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: exercise.title }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Listen section ───────────────────────────── */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>LISTEN</Text>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{exercise.title}</Text>
          <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
            Listen to the conversation, then answer the questions below.
          </Text>

          <View style={styles.audioRow}>
            <TouchableOpacity
              style={[styles.playBtn, { backgroundColor: ACCENT }]}
              onPress={playAll}
              activeOpacity={0.8}
            >
              {isPlaying
                ? <><Square size={14} color="#fff" /><Text style={styles.playBtnText}>Stop</Text></>
                : <><Play size={14} color="#fff" /><Text style={styles.playBtnText}>Play</Text></>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.textToggle, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => setShowText(v => !v)}
              activeOpacity={0.8}
            >
              {showText
                ? <><EyeOff size={14} color={theme.textSecondary} /><Text style={[styles.textToggleText, { color: theme.textSecondary }]}>Hide Text</Text></>
                : <><Eye size={14} color={theme.primary} /><Text style={[styles.textToggleText, { color: theme.primary }]}>Show Text</Text></>
              }
            </TouchableOpacity>
          </View>

          {/* Dialogue transcript */}
          {showText && (
            <View style={[styles.transcript, { borderTopColor: theme.border }]}>
              {turns.map((turn, i) => {
                const isA = turn.speaker === 'A';
                const isActive = activeTurn === i;
                return (
                  <View
                    key={i}
                    style={[
                      styles.turn,
                      isA ? styles.turnLeft : styles.turnRight,
                    ]}
                  >
                    {isA && (
                      <View style={[styles.avatar, { backgroundColor: ACCENT + '20' }]}>
                        <Text style={[styles.avatarText, { color: ACCENT }]}>A</Text>
                      </View>
                    )}
                    <View style={[
                      styles.bubble,
                      isA
                        ? [styles.bubbleLeft, { backgroundColor: theme.surfaceSecondary }]
                        : [styles.bubbleRight, { backgroundColor: ACCENT + '15' }],
                      isActive && { borderWidth: 1.5, borderColor: ACCENT },
                    ]}>
                      <Text style={[styles.bubbleText, { color: theme.text }]}>{turn.text}</Text>
                    </View>
                    {!isA && (
                      <View style={[styles.avatar, { backgroundColor: theme.success + '20' }]}>
                        <Text style={[styles.avatarText, { color: theme.success }]}>B</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Quiz section ─────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>QUIZ</Text>
          {allDone && (
            <View style={[styles.scoreRow, { backgroundColor: score === exercise.questions.length ? '#10b981' + '15' : ACCENT + '12' }]}>
              {score === exercise.questions.length
                ? <CheckCircle size={16} color="#10b981" />
                : <XCircle size={16} color={ACCENT} />
              }
              <Text style={[styles.scoreText, { color: score === exercise.questions.length ? '#10b981' : ACCENT }]}>
                {score} / {exercise.questions.length} correct
              </Text>
            </View>
          )}

          {exercise.questions.map((q, qIdx) => (
            <View key={qIdx} style={[styles.question, qIdx > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.lg, paddingTop: Spacing.lg }]}>
              <Text style={[styles.questionNum, { color: ACCENT }]}>Question {qIdx + 1}</Text>
              <Text style={[styles.questionText, { color: theme.text }]}>{q.question}</Text>

              {(['A', 'B', 'C', 'D'] as const).map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={optionStyle(q, qIdx, opt)}
                  onPress={() => selectAnswer(qIdx, opt)}
                  activeOpacity={submitted[qIdx] ? 1 : 0.7}
                >
                  <Text style={[styles.optionLetter, { color: optionTextColor(q, qIdx, opt) }]}>{opt}</Text>
                  <Text style={[styles.optionText, { color: optionTextColor(q, qIdx, opt) }]}>{q.options[opt]}</Text>
                  {submitted[qIdx] && opt === q.answer && (
                    <CheckCircle size={16} color="#10b981" />
                  )}
                  {submitted[qIdx] && answers[qIdx] === opt && opt !== q.answer && (
                    <XCircle size={16} color="#ef4444" />
                  )}
                </TouchableOpacity>
              ))}

              {!submitted[qIdx] && (
                <TouchableOpacity
                  style={[styles.checkBtn, { backgroundColor: answers[qIdx] ? ACCENT : theme.border }]}
                  onPress={() => submitAnswer(qIdx)}
                  disabled={!answers[qIdx]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.checkBtnText}>Check Answer</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  cardLabel: { fontSize: 10, fontWeight: FontWeight.semibold, letterSpacing: 0.8, marginBottom: Spacing.xs },
  cardTitle: { fontSize: FontSize.title3, fontWeight: FontWeight.bold, marginBottom: 4 },
  cardSub: { fontSize: FontSize.footnote, lineHeight: 18, marginBottom: Spacing.lg },
  audioRow: { flexDirection: 'row', gap: Spacing.sm },
  playBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
  },
  playBtnText: { color: '#fff', fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },
  textToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
  },
  textToggleText: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },

  // Transcript
  transcript: { borderTopWidth: 1, marginTop: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.sm },
  turn: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  turnLeft: { justifyContent: 'flex-start' },
  turnRight: { justifyContent: 'flex-end' },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 11, fontWeight: FontWeight.bold },
  bubble: { maxWidth: '80%', borderRadius: BorderRadius.lg, padding: Spacing.sm + 2 },
  bubbleLeft: { borderBottomLeftRadius: 4 },
  bubbleRight: { borderBottomRightRadius: 4 },
  bubbleText: { fontSize: FontSize.footnote, lineHeight: 20 },

  // Quiz
  scoreRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.lg,
  },
  scoreText: { fontSize: FontSize.subhead, fontWeight: FontWeight.bold },
  question: {},
  questionNum: { fontSize: FontSize.caption, fontWeight: FontWeight.semibold, letterSpacing: 0.5, marginBottom: 4 },
  questionText: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, lineHeight: 22, marginBottom: Spacing.md },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderWidth: 1.5, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  optionLetter: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold, width: 18 },
  optionText: { flex: 1, fontSize: FontSize.footnote, lineHeight: 18 },
  checkBtn: {
    alignItems: 'center', paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md, marginTop: Spacing.xs,
  },
  checkBtnText: { color: '#fff', fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },
});
