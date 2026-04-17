import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { MessageCircle, Play, Square, Volume2, Languages, RefreshCw, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock, RotateCcw } from 'lucide-react-native';
import { speakWithCallback, stopTTS } from '@/utils/tts';
import AIModule from 'dutch-vocab-ai';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type AIAvailability = 'available' | 'not_enabled' | 'model_not_ready' | 'requires_ios26' | 'unavailable' | 'checking';

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
  not_enabled: {
    icon: AlertCircle,
    accentColor: '#B45309',
    bg: '#FFFBEB',
    borderColor: '#FCD34D',
    title: 'Apple Intelligence Required',
    subtitle: 'Enable Apple Intelligence to generate conversations using on-device AI.',
    steps: [
      { label: 'Open Settings on your iPhone' },
      { label: 'Tap Apple Intelligence & Siri' },
      { label: 'Turn on Apple Intelligence' },
      { label: 'Set device language to English (US)', detail: 'Settings → General → Language & Region → iPhone Language' },
      { label: 'Wait for the model to download', detail: 'A progress bar will appear in Apple Intelligence & Siri' },
      { label: 'Come back here and tap Check Again' },
    ],
  },
  model_not_ready: {
    icon: Clock,
    accentColor: '#1D4ED8',
    bg: '#EFF6FF',
    borderColor: '#93C5FD',
    title: 'Apple Intelligence is Setting Up',
    subtitle: 'The on-device model is downloading. This usually takes a few minutes on Wi-Fi.',
    steps: [
      { label: 'Make sure you are connected to Wi-Fi' },
      { label: 'Open Settings → Apple Intelligence & Siri', detail: 'Look for a progress bar — it shows download status' },
      { label: 'Keep the screen on and wait for it to finish' },
      { label: 'Come back here and tap Check Again' },
    ],
    note: 'Do not switch your device language away from English (US) while downloading.',
  },
  requires_ios26: {
    icon: AlertCircle,
    accentColor: '#991B1B',
    bg: '#FEF2F2',
    borderColor: '#FCA5A5',
    title: 'iOS 26 Required',
    subtitle: 'This feature uses Apple Intelligence which requires iOS 26 or later.',
    steps: [
      { label: 'Open Settings → General → Software Update' },
      { label: 'Download and install iOS 26' },
      { label: 'After updating, enable Apple Intelligence', detail: 'Settings → Apple Intelligence & Siri' },
      { label: 'Come back here and tap Check Again' },
    ],
  },
  unavailable: {
    icon: AlertCircle,
    accentColor: '#6B7280',
    bg: '#F9FAFB',
    borderColor: '#D1D5DB',
    title: 'Apple Intelligence Unavailable',
    subtitle: 'This feature requires Apple Intelligence on a supported device.',
    steps: [
      { label: 'Supported devices: iPhone 15 Pro, 15 Pro Max, iPhone 16 series or later' },
      { label: 'Requires iOS 26 or later' },
      { label: 'Enable Apple Intelligence in Settings → Apple Intelligence & Siri' },
      { label: 'Set device language to English (US)' },
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

  const stopRef = useRef(false);

  const checkAvailability = () => {
    setAiStatus('checking');
    AIModule.getAIAvailabilityAsync()
      .then(setAiStatus)
      .catch(() => setAiStatus('unavailable'));
  };

  useEffect(() => {
    checkAvailability();
  }, []);

  const generate = async () => {
    const t = topic.trim();
    if (!t) {
      Alert.alert('Enter a topic', 'Please type or choose a topic first.');
      return;
    }
    setTurns([]);
    setShowTranslations({});
    setShowAllTranslations(false);
    setIsGenerating(true);
    try {
      const raw = await AIModule.generateSmallTalkAsync(t, turnCount);
      console.log('[SmallTalk] raw response:', raw);

      if (raw.startsWith('ERROR:')) {
        const code = raw.replace('ERROR:', '');
        const messages: Record<string, string> = {
          REQUIRES_IOS26: 'iOS 26 or later is required.',
          DEVICE_NOT_SUPPORTED: 'Your device does not support Apple Intelligence.',
          AI_NOT_ENABLED: 'Apple Intelligence is not enabled. Go to Settings → Apple Intelligence & Siri to enable it.',
          MODEL_NOT_READY: 'Apple Intelligence model is still downloading. Please wait a few minutes and try again.',
        };
        const msg = messages[code] ?? `Apple Intelligence error: ${code}`;
        Alert.alert('Apple Intelligence Unavailable', msg);
        return;
      }

      const parsed = parseTurns(raw);
      if (parsed.length === 0) {
        Alert.alert('Generation failed', 'Could not parse the conversation. Please try again.');
      } else {
        setTurns(parsed);
      }
    } catch (e) {
      console.error('Small talk error:', e);
      Alert.alert('Error', 'Apple Intelligence is required to generate conversations (iOS 26+ with Apple Intelligence enabled).');
    } finally {
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

        {/* Apple Intelligence setup guide */}
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
              {aiStatus !== 'requires_ios26' && (
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
