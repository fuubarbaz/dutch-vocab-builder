import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { MessageCircle, Play, Square, Volume2, Languages, RefreshCw, ChevronDown, ChevronUp, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react-native';
import { speakWithCallback, stopTTS } from '@/utils/tts';
import AIModule from 'dutch-vocab-ai';
import { useAI } from '@/context/AIContext';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type AIAvailability = 'available' | 'not_downloaded' | 'downloading' | 'load_error' | 'checking';

type SetupStep = { label: string; detail?: string };

type SetupGuideConfig = {
  icon: any;
  accentColor: string;
  bg: string;
  borderColor: string;
  title: string;
  subtitle: string;
  steps: SetupStep[];
  note?: string;
};

const SETUP_GUIDES: Partial<Record<AIAvailability, SetupGuideConfig>> = {
  not_downloaded: {
    icon: AlertCircle,
    accentColor: '#B45309',
    bg: '#FFFBEB',
    borderColor: '#FCD34D',
    title: 'AI Model Not Downloaded',
    subtitle: 'The on-device AI model (Gemma 4) needs to be downloaded before conversations can be generated.',
    steps: [
      { label: 'Open the Settings tab' },
      { label: 'Under "On-device AI", tap "Download model" (~2.6 GB)' },
      { label: 'Make sure you are connected to Wi-Fi' },
      { label: 'Come back here after the download completes' },
    ],
  },
  load_error: {
    icon: AlertCircle,
    accentColor: '#991B1B',
    bg: '#FEF2F2',
    borderColor: '#FCA5A5',
    title: 'AI Model Failed to Load',
    subtitle: 'The on-device AI model could not be loaded. This may be due to insufficient memory or a corrupted download.',
    steps: [
      { label: 'Close other apps to free up memory' },
      { label: 'Restart the app and try again' },
      { label: 'If the issue persists, close and reopen the app to re-download the model' },
    ],
  },
};

type Turn = {
  speaker: 'A' | 'B';
  dutch: string;
  english: string;
};

const SUGGESTED_TOPICS = [
  'the weather', 'work', 'the weekend', 'food', 'travel',
  'hobbies', 'family', 'sports', 'music', 'the city',
];

const TURN_OPTIONS = [4, 6, 8, 10];

function parseTurns(raw: string): Turn[] {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  // Find the JSON array
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1) return [];
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t: any) => t && typeof t.dutch === 'string' && typeof t.english === 'string'
    ) as Turn[];
  } catch {
    return [];
  }
}

export default function SmallTalkScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];

  const [topic, setTopic] = useState('');
  const [turnCount, setTurnCount] = useState(6);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTurnIdx, setActiveTurnIdx] = useState<number | null>(null);
  const [showTranslations, setShowTranslations] = useState<Record<number, boolean>>({});
  const [showAllTranslations, setShowAllTranslations] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIAvailability>('checking');
  const { generateSmallTalkStream } = useAI();

  const stopRef = useRef(false);
  const seenTurnCountRef = useRef(0);
  const generatingRef = useRef(false);

  const checkAvailability = () => {
    setAiStatus('checking');
    AIModule.getAIAvailabilityAsync()
      .then((status) => {
        const known: AIAvailability[] = ['available', 'not_downloaded', 'downloading', 'load_error'];
        setAiStatus(known.includes(status as AIAvailability) ? (status as AIAvailability) : 'load_error');
      })
      .catch(() => setAiStatus('load_error'));
  };

  useEffect(() => {
    checkAvailability();
  }, []);

  // Extracts complete turn objects from accumulated streaming JSON.
  // Parses turn-by-turn as each closing `}` arrives so turns appear progressively.
  const extractCompletedTurns = useCallback((text: string): Turn[] => {
    const result: Turn[] = [];
    let depth = 0;
    let objStart = -1;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        if (depth === 0) objStart = i;
        depth++;
      } else if (text[i] === '}') {
        depth--;
        if (depth === 0 && objStart !== -1) {
          try {
            const obj = JSON.parse(text.slice(objStart, i + 1));
            if (obj.speaker && typeof obj.dutch === 'string' && typeof obj.english === 'string') {
              result.push(obj as Turn);
            }
          } catch {}
          objStart = -1;
        }
      }
    }
    return result;
  }, []);

  const generate = async () => {
    // The keyboard's return key can fire this while a run is already in flight;
    // overlapping requests fight over the single on-device model session.
    if (generatingRef.current) return;

    const t = topic.trim();
    if (!t) {
      Alert.alert('Enter a topic', 'Please type or choose a topic first.');
      return;
    }
    setTurns([]);
    setShowTranslations({});
    setShowAllTranslations(false);
    generatingRef.current = true;
    setIsGenerating(true);
    seenTurnCountRef.current = 0;

    let subscription: ReturnType<typeof AIModule.addListener> | null = null;

    try {
      subscription = AIModule.addListener('onSmallTalkChunk', ({ text, done }) => {
        const completed = extractCompletedTurns(text);
        if (completed.length > seenTurnCountRef.current) {
          seenTurnCountRef.current = completed.length;
          setTurns(completed);
        }
        if (done && completed.length === 0) {
          Alert.alert('Generation failed', 'Could not parse the conversation. Please try again.');
        }
      });

      await generateSmallTalkStream(t, turnCount);
    } catch (e) {
      // AIContext has already classified this and shown a toast; all that is left
      // is pointing the setup guide at the right recovery step.
      const err = e as { kind?: string; message?: string };
      if (err?.kind === 'not_downloaded') {
        setAiStatus('not_downloaded');
      } else if (err?.kind === 'load_failed') {
        setAiStatus('load_error');
      } else {
        // The model is present and loaded — this one request failed. Saying
        // "AI Unavailable" here sends people to Settings to fix nothing.
        Alert.alert('Generation failed', err?.message ?? 'Could not generate this conversation. Please try again.');
      }
    } finally {
      subscription?.remove();
      generatingRef.current = false;
      setIsGenerating(false);
    }
  };

  const playAll = async () => {
    if (isPlaying) {
      stopRef.current = true;
      stopTTS();
      setIsPlaying(false);
      setActiveTurnIdx(null);
      return;
    }

    stopRef.current = false;
    setIsPlaying(true);

    for (let i = 0; i < turns.length; i++) {
      if (stopRef.current) break;
      setActiveTurnIdx(i);
      await speakTurn(turns[i]);
      await new Promise(r => setTimeout(r, 400));
    }

    setIsPlaying(false);
    setActiveTurnIdx(null);
  };

  const speakTurn = (turn: Turn): Promise<void> =>
    new Promise(resolve => {
      speakWithCallback(turn.dutch, 0.85, {
        onDone: resolve,
        onError: resolve,
        onStopped: resolve,
      });
    });

  const speakOne = (turn: Turn) => {
    stopTTS();
    speakWithCallback(turn.dutch, 0.85);
  };

  const toggleTranslation = (idx: number) => {
    setShowTranslations(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAllTranslations = () => {
    const next = !showAllTranslations;
    setShowAllTranslations(next);
    const map: Record<number, boolean> = {};
    turns.forEach((_, i) => { map[i] = next; });
    setShowTranslations(map);
  };

  const isShown = (idx: number) => showTranslations[idx] ?? false;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Small Talk' }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* AI model setup guide */}
        {(() => {
          if (aiStatus === 'checking' || aiStatus === 'available') return null;
          const guide = SETUP_GUIDES[aiStatus];
          if (!guide) return null;
          const Icon = guide.icon;
          return (
            <View style={[styles.setupCard, { backgroundColor: guide.bg, borderColor: guide.borderColor }]}>
              {/* Header */}
              <View style={styles.setupHeader}>
                <Icon size={20} color={guide.accentColor} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.setupTitle, { color: guide.accentColor }]}>{guide.title}</Text>
                  <Text style={[styles.setupSubtitle, { color: guide.accentColor }]}>{guide.subtitle}</Text>
                </View>
              </View>

              {/* Steps */}
              <View style={styles.stepsContainer}>
                {guide.steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={[styles.stepNumber, { backgroundColor: guide.accentColor }]}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.stepLabel, { color: guide.accentColor }]}>{step.label}</Text>
                      {step.detail && (
                        <Text style={[styles.stepDetail, { color: guide.accentColor + 'CC' }]}>{step.detail}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* Note */}
              {guide.note && (
                <Text style={[styles.setupNote, { color: guide.accentColor + 'BB' }]}>{guide.note}</Text>
              )}

              {/* Check Again button */}
              {(
                <TouchableOpacity
                  style={[styles.checkAgainBtn, { borderColor: guide.accentColor }]}
                  onPress={checkAvailability}
                >
                  <RotateCcw size={14} color={guide.accentColor} />
                  <Text style={[styles.checkAgainText, { color: guide.accentColor }]}>Check Again</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })()}

        {/* Topic input */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <MessageCircle size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Generate a Conversation</Text>
          </View>

          <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Topic</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. the weather, work, travel…"
            placeholderTextColor={theme.textSecondary}
            value={topic}
            onChangeText={setTopic}
            returnKeyType="done"
            onSubmitEditing={generate}
          />

          {/* Suggested topics */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {SUGGESTED_TOPICS.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, { borderColor: topic === t ? theme.primary : theme.border },
                  topic === t && { backgroundColor: theme.primary }]}
                onPress={() => setTopic(t)}
              >
                <Text style={[styles.chipText, { color: topic === t ? '#fff' : theme.textSecondary }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Turn count */}
          <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>Turns</Text>
          <View style={styles.turnRow}>
            {TURN_OPTIONS.map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.turnChip, { borderColor: theme.border },
                  turnCount === n && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                onPress={() => setTurnCount(n)}
              >
                <Text style={[styles.turnChipText, { color: turnCount === n ? '#fff' : theme.text }]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.generateBtn, { backgroundColor: topic.trim() ? theme.primary : theme.border }]}
            onPress={generate}
            disabled={isGenerating || !topic.trim()}
          >
            {isGenerating
              ? <ActivityIndicator color="#fff" size="small" />
              : <><RefreshCw size={16} color="#fff" /><Text style={styles.generateBtnText}>Generate</Text></>
            }
          </TouchableOpacity>
        </View>

        {/* Conversation */}
        {turns.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            {/* Toolbar */}
            <View style={styles.toolbar}>
              <TouchableOpacity style={[styles.toolbarBtn, { backgroundColor: theme.primary }]} onPress={playAll}>
                {isPlaying
                  ? <><Square size={14} color="#fff" /><Text style={styles.toolbarBtnText}>Stop</Text></>
                  : <><Play size={14} color="#fff" /><Text style={styles.toolbarBtnText}>Play All</Text></>
                }
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toolbarBtn, { backgroundColor: theme.surfaceSecondary }]}
                onPress={toggleAllTranslations}
              >
                <Languages size={14} color={theme.primary} />
                <Text style={[styles.toolbarBtnText, { color: theme.primary }]}>
                  {showAllTranslations ? 'Hide' : 'Translate All'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Turns */}
            {turns.map((turn, idx) => {
              const isA = turn.speaker === 'A';
              const isActive = activeTurnIdx === idx;
              return (
                <View
                  key={idx}
                  style={[
                    styles.turnRow2,
                    isA ? styles.turnLeft : styles.turnRight,
                  ]}
                >
                  {/* Avatar */}
                  {isA && (
                    <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
                      <Text style={[styles.avatarText, { color: theme.primary }]}>A</Text>
                    </View>
                  )}

                  <View style={[
                    styles.bubble,
                    isA
                      ? [styles.bubbleLeft, { backgroundColor: theme.surfaceSecondary }]
                      : [styles.bubbleRight, { backgroundColor: theme.primary + '15' }],
                    isActive && { borderWidth: 2, borderColor: theme.primary },
                  ]}>
                    <Text style={[styles.dutchText, { color: theme.text }]}>{turn.dutch}</Text>

                    {isShown(idx) && (
                      <Text style={[styles.englishText, { color: theme.textSecondary }]}>{turn.english}</Text>
                    )}

                    {/* Bubble actions */}
                    <View style={styles.bubbleActions}>
                      <TouchableOpacity onPress={() => speakOne(turn)} hitSlop={8}>
                        <Volume2 size={14} color={theme.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => toggleTranslation(idx)} hitSlop={8}>
                        {isShown(idx)
                          ? <ChevronUp size={14} color={theme.textSecondary} />
                          : <ChevronDown size={14} color={theme.textSecondary} />
                        }
                      </TouchableOpacity>
                    </View>
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg },
  setupCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  setupTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.bold, marginBottom: 2 },
  setupSubtitle: { fontSize: FontSize.footnote, lineHeight: 18, opacity: 0.85 },
  stepsContainer: { gap: Spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumberText: { color: '#fff', fontSize: 11, fontWeight: FontWeight.bold },
  stepLabel: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium, lineHeight: 18 },
  stepDetail: { fontSize: 11, lineHeight: 16, marginTop: 2 },
  setupNote: { fontSize: FontSize.footnote, fontStyle: 'italic', marginTop: Spacing.md, lineHeight: 18 },
  checkAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  checkAgainText: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  cardTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  fieldLabel: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium, marginBottom: Spacing.sm },
  input: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSize.body,
    marginBottom: Spacing.md,
  },
  chipScroll: { flexGrow: 0, marginBottom: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  chipText: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  turnRow: { flexDirection: 'row', gap: Spacing.sm },
  turnChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  turnChipText: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },
  generateBtnText: { color: '#fff', fontSize: FontSize.body, fontWeight: FontWeight.semibold },
  toolbar: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  toolbarBtnText: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold, color: '#fff' },
  turnRow2: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: Spacing.md, gap: Spacing.sm },
  turnLeft: { justifyContent: 'flex-start' },
  turnRight: { justifyContent: 'flex-end' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  bubble: {
    maxWidth: '78%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  bubbleLeft: { borderBottomLeftRadius: 4 },
  bubbleRight: { borderBottomRightRadius: 4 },
  dutchText: { fontSize: FontSize.subhead, fontWeight: FontWeight.medium, lineHeight: 22 },
  englishText: { fontSize: FontSize.footnote, fontStyle: 'italic', marginTop: 4, lineHeight: 18 },
  bubbleActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm, justifyContent: 'flex-end' },
});
