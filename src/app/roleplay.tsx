import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  Drama, Send, Volume2, RotateCcw, X, ChevronRight, CheckCircle2, SpellCheck,
} from 'lucide-react-native';
import AIModule, { sanitizeRoleplayReply, parseRoleplayReview } from 'dutch-vocab-ai';
import type { RoleplayCorrection } from 'dutch-vocab-ai';
import { speakWithCallback, stopTTS } from '@/utils/tts';
import { useAI, AIErrorBanner } from '@/context/AIContext';
import { useMistakeJournal } from '@/context/MistakeJournalContext';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type Level = 'A1' | 'A2' | 'B1';

type Scenario = {
  id: string;
  title: string;
  subtitle: string;
  /** Who the model plays. Goes straight into the system prompt. */
  character: string;
  /** The situation. Also goes into the system prompt. */
  scene: string;
  color: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'cafe',
    title: 'At the café',
    subtitle: 'Order a drink and something to eat',
    character: 'a friendly barista in an Amsterdam café',
    scene: 'the learner has just walked in and wants to order',
    color: '#f59e0b',
  },
  {
    id: 'bakery',
    title: 'At the bakery',
    subtitle: 'Buy bread and ask what is fresh',
    character: 'a baker behind the counter of a neighbourhood bakkerij',
    scene: 'the learner is next in the queue',
    color: '#ec4899',
  },
  {
    id: 'doctor',
    title: 'At the doctor',
    subtitle: 'Describe symptoms and make an appointment',
    character: 'a huisarts seeing a patient',
    scene: 'the learner has come in feeling unwell',
    color: '#10b981',
  },
  {
    id: 'apartment',
    title: 'Apartment viewing',
    subtitle: 'Ask about rent, rooms and the neighbourhood',
    character: 'a landlord showing a flat to a prospective tenant',
    scene: 'the learner has arrived for a bezichtiging',
    color: '#6366f1',
  },
  {
    id: 'gemeente',
    title: 'At the gemeente',
    subtitle: 'Register and hand in your documents',
    character: 'a municipal desk clerk at the gemeentehuis',
    scene: 'the learner has an appointment to register at a new address',
    color: '#0ea5e9',
  },
  {
    id: 'neighbour',
    title: 'Meeting a neighbour',
    subtitle: 'Introduce yourself and make small talk',
    character: 'a chatty new neighbour meeting someone in the hallway',
    scene: 'the learner has just moved into the building',
    color: '#8b5cf6',
  },
];

const LEVELS: Level[] = ['A1', 'A2', 'B1'];

type Turn = {
  id: number;
  speaker: 'character' | 'learner';
  text: string;
};

export default function RoleplayScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];
  const {
    engineState, error, isFallback,
    startRoleplay, sendRoleplayTurnStream, endRoleplay, reviewRoleplay,
  } = useAI();
  const { logSentenceMistake } = useMistakeJournal();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [level, setLevel] = useState<Level>('A1');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sceneEnded, setSceneEnded] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [corrections, setCorrections] = useState<RoleplayCorrection[] | null>(null);
  const [reviewFailed, setReviewFailed] = useState(false);
  // Scene ended because another AI call took the engine's one session, not because
  // the learner finished — the two need different messaging.
  const [evicted, setEvicted] = useState(false);

  const turnCounter = useRef(0);
  const scrollRef = useRef<ScrollView>(null);
  // Guards against the return key firing a second turn while one is in flight —
  // the engine has a single session and overlapping sends fight over it.
  const busyRef = useRef(false);
  // Kept in a ref so the unmount cleanup sees the latest id without re-running.
  const sessionRef = useRef<string | null>(null);

  useEffect(() => { sessionRef.current = sessionId; }, [sessionId]);

  // Free the native session when the user navigates away, otherwise the scene
  // holds the engine's only conversation slot until some other feature evicts it.
  useEffect(() => () => {
    stopTTS();
    if (sessionRef.current) endRoleplay(sessionRef.current);
  }, [endRoleplay]);

  const addTurn = useCallback((speaker: Turn['speaker'], text: string) => {
    const id = ++turnCounter.current;
    setTurns(prev => [...prev, { id, speaker, text }]);
    return id;
  }, []);

  /**
   * Streams one character reply into the transcript.
   *
   * `text` is the learner's line; '' opens the scene, which is what the native
   * layer turns into "begin in character".
   */
  const runTurn = useCallback(async (id: string, text: string) => {
    setIsThinking(true);
    busyRef.current = true;

    const replyId = ++turnCounter.current;
    let placed = false;
    let subscription: ReturnType<typeof AIModule.addListener> | null = null;

    try {
      subscription = AIModule.addListener('onRoleplayChunk', ({ text: accumulated }) => {
        const clean = sanitizeRoleplayReply(accumulated);
        if (!clean) return;
        placed = true;
        // The updater stays side-effect free — it decides append vs. replace from
        // `prev` itself, so a double-invoked updater can't drop the bubble.
        setTurns(prev => (
          prev.some(t => t.id === replyId)
            ? prev.map(t => (t.id === replyId ? { ...t, text: clean } : t))
            : [...prev, { id: replyId, speaker: 'character', text: clean }]
        ));
      });

      await sendRoleplayTurnStream(id, text);
    } catch (e) {
      // AIContext has already classified this and shown a toast; all that is left
      // is deciding whether the scene can continue.
      const kind = (e as { kind?: string } | undefined)?.kind;
      if (kind === 'session_expired') { setSceneEnded(true); setEvicted(true); }
      if (!placed) {
        setTurns(prev => prev.filter(t => t.id !== replyId));
      }
    } finally {
      subscription?.remove();
      busyRef.current = false;
      setIsThinking(false);
    }
  }, [sendRoleplayTurnStream]);

  const beginScene = useCallback(async (chosen: Scenario) => {
    if (busyRef.current) return;
    setScenario(chosen);
    setTurns([]);
    setSceneEnded(false);
    setCorrections(null);
    setReviewFailed(false);
    setEvicted(false);
    turnCounter.current = 0;

    try {
      const id = await startRoleplay(chosen.scene, chosen.character, level);
      setSessionId(id);
      await runTurn(id, '');
    } catch {
      // Classified and surfaced by AIContext; drop back to the picker.
      setScenario(null);
      setSessionId(null);
    }
  }, [level, runTurn, startRoleplay]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || !sessionId || busyRef.current || sceneEnded) return;
    setDraft('');
    addTurn('learner', text);
    await runTurn(sessionId, text);
  }, [addTurn, draft, runTurn, sceneEnded, sessionId]);

  const leaveScene = useCallback(async () => {
    stopTTS();
    if (sessionId) await endRoleplay(sessionId);
    setSessionId(null);
    setScenario(null);
    setTurns([]);
    setDraft('');
    setSceneEnded(false);
    setCorrections(null);
    setReviewFailed(false);
    setEvicted(false);
  }, [endRoleplay, sessionId]);

  const restartScene = useCallback(async () => {
    if (!scenario) return;
    if (sessionId) await endRoleplay(sessionId);
    setSessionId(null);
    await beginScene(scenario);
  }, [beginScene, endRoleplay, scenario, sessionId]);

  /**
   * Ends the scene, then checks every line the learner wrote in a single pass.
   *
   * Review deliberately runs *after* the scene: the engine holds one conversation, so
   * a correction mid-scene would evict the scene it is correcting. Ending the session
   * first also means the review is not competing for the slot.
   */
  const finishScene = useCallback(async () => {
    const lines = turns.filter(t => t.speaker === 'learner').map(t => t.text);
    if (lines.length === 0 || isReviewing) return;

    stopTTS();
    setIsReviewing(true);
    setSceneEnded(true);
    setReviewFailed(false);

    if (sessionId) await endRoleplay(sessionId);
    setSessionId(null);

    try {
      const raw = await reviewRoleplay(lines);
      const parsed = parseRoleplayReview(raw, lines);
      if (!parsed) {
        // Nothing parseable came back. Saying "all correct" here would be a lie.
        setReviewFailed(true);
        return;
      }
      setCorrections(parsed);
      for (const c of parsed) {
        if (c.ok) continue;
        await logSentenceMistake({
          original: c.original,
          corrected: c.fix,
          note: c.why || undefined,
          scenario: scenario?.title,
        });
      }
    } catch {
      // Classified and toasted by AIContext; the panel shows the fallback message.
      setReviewFailed(true);
    } finally {
      setIsReviewing(false);
    }
  }, [endRoleplay, isReviewing, logSentenceMistake, reviewRoleplay, scenario, sessionId, turns]);

  const learnerLineCount = turns.filter(t => t.speaker === 'learner').length;

  const speak = (text: string) => {
    stopTTS();
    speakWithCallback(text, 0.85);
  };

  // ── Scenario picker ────────────────────────────────────────────────────────

  if (!scenario) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Roleplay' }} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {engineState === 'error' && <AIErrorBanner />}

          {isFallback && (
            <View style={[styles.notice, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
              <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
                Roleplay runs on the on-device model, which needs a development build of Dutchify.
              </Text>
            </View>
          )}

          <View style={styles.introRow}>
            <Drama size={22} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.introTitle, { color: theme.text }]}>Play out a scene</Text>
              <Text style={[styles.introSubtitle, { color: theme.textSecondary }]}>
                You take one side of the conversation. Reply in Dutch and the scene keeps going.
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>YOUR LEVEL</Text>
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

          <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>SCENE</Text>
          <View style={styles.group}>
            {SCENARIOS.map((s, i) => (
              <React.Fragment key={s.id}>
                <TouchableOpacity
                  style={[styles.sceneRow, { backgroundColor: theme.cardBackground }]}
                  onPress={() => beginScene(s)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.sceneIcon, { backgroundColor: s.color + '18' }]}>
                    <Drama size={20} color={s.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sceneTitle, { color: theme.text }]}>{s.title}</Text>
                    <Text style={[styles.sceneSubtitle, { color: theme.textSecondary }]}>{s.subtitle}</Text>
                  </View>
                  <ChevronRight size={18} color={theme.textSecondary} />
                </TouchableOpacity>
                {i < SCENARIOS.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: theme.border }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Live scene ─────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
    >
      <Stack.Screen options={{ title: scenario.title }} />

      <View style={[styles.sceneHeader, { borderBottomColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sceneHeaderTitle, { color: theme.text }]}>{scenario.title}</Text>
          <Text style={[styles.sceneHeaderMeta, { color: theme.textSecondary }]}>
            {level} · {scenario.subtitle}
          </Text>
        </View>
        <TouchableOpacity onPress={restartScene} style={styles.headerBtn} hitSlop={8}>
          <RotateCcw size={18} color={theme.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={leaveScene} style={styles.headerBtn} hitSlop={8}>
          <X size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.transcript}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {turns.map(turn => {
          const mine = turn.speaker === 'learner';
          return (
            <View
              key={turn.id}
              style={[
                styles.bubbleRow,
                { justifyContent: mine ? 'flex-end' : 'flex-start' },
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  mine
                    ? { backgroundColor: theme.primary, borderBottomRightRadius: 4 }
                    : { backgroundColor: theme.cardBackground, borderBottomLeftRadius: 4 },
                ]}
              >
                <Text style={[styles.bubbleText, { color: mine ? '#fff' : theme.text }]}>
                  {turn.text}
                </Text>
                {!mine && (
                  <TouchableOpacity
                    onPress={() => speak(turn.text)}
                    style={styles.speakBtn}
                    hitSlop={8}
                  >
                    <Volume2 size={15} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {isThinking && (
          <View style={[styles.bubbleRow, { justifyContent: 'flex-start' }]}>
            <View style={[styles.bubble, { backgroundColor: theme.cardBackground }]}>
              <ActivityIndicator size="small" color={theme.textSecondary} />
            </View>
          </View>
        )}

        {evicted && (
          <View style={[styles.notice, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
              {error?.message ?? 'This scene ended.'}
            </Text>
            <TouchableOpacity onPress={restartScene} style={[styles.noticeBtn, { borderColor: theme.primary }]}>
              <RotateCcw size={14} color={theme.primary} />
              <Text style={[styles.noticeBtnText, { color: theme.primary }]}>Start again</Text>
            </TouchableOpacity>
          </View>
        )}
        {isReviewing && (
          <View style={[styles.reviewCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.reviewNote, { color: theme.textSecondary }]}>
              Checking your Dutch…
            </Text>
          </View>
        )}

        {reviewFailed && !isReviewing && (
          <View style={[styles.reviewCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.reviewTitle, { color: theme.text }]}>Could not check this scene</Text>
            <Text style={[styles.reviewNote, { color: theme.textSecondary }]}>
              The review did not come back readable, so your lines were left unmarked rather
              than reported as correct.
            </Text>
          </View>
        )}

        {corrections && !isReviewing && (() => {
          const fixes = corrections.filter(c => !c.ok);
          return (
            <View style={[styles.reviewCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.reviewHeader}>
                <SpellCheck size={18} color={theme.primary} />
                <Text style={[styles.reviewTitle, { color: theme.text }]}>Scene review</Text>
              </View>

              {fixes.length === 0 ? (
                <View style={styles.reviewAllGood}>
                  <CheckCircle2 size={18} color={theme.success} />
                  <Text style={[styles.reviewNote, { color: theme.textSecondary }]}>
                    All {corrections.length} of your lines looked correct. Nice work.
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.reviewNote, { color: theme.textSecondary }]}>
                    {fixes.length === 1
                      ? `1 of ${corrections.length} lines needs a fix`
                      : `${fixes.length} of ${corrections.length} lines need a fix`}
                    {' '}— saved to your mistake journal.
                  </Text>
                  {fixes.map((c, i) => (
                    <View key={i} style={[styles.fixRow, { borderTopColor: theme.border }]}>
                      <Text style={[styles.fixOriginal, { color: theme.textSecondary }]}>
                        {c.original}
                      </Text>
                      <View style={styles.fixCorrectedRow}>
                        <Text style={[styles.fixCorrected, { color: theme.text }]}>{c.fix}</Text>
                        <TouchableOpacity onPress={() => speak(c.fix)} hitSlop={8}>
                          <Volume2 size={15} color={theme.primary} />
                        </TouchableOpacity>
                      </View>
                      {c.why ? (
                        <Text style={[styles.fixWhy, { color: theme.textSecondary }]}>{c.why}</Text>
                      ) : null}
                    </View>
                  ))}
                </>
              )}
            </View>
          );
        })()}
      </ScrollView>

      {!sceneEnded && learnerLineCount > 0 && (
        <TouchableOpacity
          onPress={finishScene}
          disabled={isThinking}
          style={[
            styles.finishBtn,
            { backgroundColor: theme.cardBackground, borderTopColor: theme.border },
          ]}
        >
          <SpellCheck size={16} color={isThinking ? theme.textSecondary : theme.primary} />
          <Text
            style={[
              styles.finishBtnText,
              { color: isThinking ? theme.textSecondary : theme.primary },
            ]}
          >
            Finish &amp; check my Dutch
          </Text>
        </TouchableOpacity>
      )}

      {sceneEnded && !isReviewing ? (
        <View style={[styles.composer, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
          <TouchableOpacity
            onPress={leaveScene}
            style={[styles.wideBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.wideBtnText}>Back to scenes</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <View style={[styles.composer, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
        <TextInput
          style={[styles.composerInput, { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border }]}
          placeholder={sceneEnded ? 'Scene ended' : 'Antwoord in het Nederlands…'}
          placeholderTextColor={theme.textSecondary}
          value={draft}
          onChangeText={setDraft}
          editable={!sceneEnded}
          multiline
          // The learner is typing a target language the keyboard usually isn't set to,
          // so autocorrect mangles Dutch into English lookalikes. Leaving their own
          // spelling intact is also the point of the exercise.
          autoCorrect={false}
          spellCheck={false}
          autoCapitalize="sentences"
          returnKeyType="send"
          onSubmitEditing={send}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          onPress={send}
          disabled={isThinking || sceneEnded || draft.trim().length === 0}
          style={[
            styles.sendBtn,
            {
              backgroundColor:
                isThinking || sceneEnded || draft.trim().length === 0
                  ? theme.surfaceSecondary
                  : theme.primary,
            },
          ]}
        >
          <Send
            size={18}
            color={isThinking || sceneEnded || draft.trim().length === 0 ? theme.textSecondary : '#fff'}
          />
        </TouchableOpacity>
      </View>
      )}

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl },

  introRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  introTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  introSubtitle: { fontSize: FontSize.footnote, lineHeight: 18, marginTop: 2 },

  sectionHeader: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  levelRow: { flexDirection: 'row', gap: Spacing.sm },
  levelChip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  levelChipText: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },

  group: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  sceneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  sceneIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sceneTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  sceneSubtitle: { fontSize: FontSize.footnote, marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.md + 40 + Spacing.md },

  sceneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sceneHeaderTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  sceneHeaderMeta: { fontSize: FontSize.caption, marginTop: 1 },
  headerBtn: { padding: Spacing.xs },

  transcript: { padding: Spacing.lg, gap: Spacing.sm },
  bubbleRow: { flexDirection: 'row' },
  bubble: {
    maxWidth: '82%',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  bubbleText: { fontSize: FontSize.subhead, lineHeight: 22 },
  speakBtn: { marginTop: Spacing.xs, alignSelf: 'flex-start' },

  notice: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  noticeText: { fontSize: FontSize.footnote, lineHeight: 18 },
  noticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  noticeBtnText: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },

  reviewCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reviewTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  reviewNote: { fontSize: FontSize.footnote, lineHeight: 18 },
  reviewAllGood: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fixRow: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm, gap: 2 },
  fixOriginal: {
    fontSize: FontSize.footnote,
    textDecorationLine: 'line-through',
    lineHeight: 18,
  },
  fixCorrectedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fixCorrected: {
    flex: 1,
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.medium,
    lineHeight: 21,
  },
  fixWhy: { fontSize: FontSize.caption, fontStyle: 'italic', lineHeight: 16 },

  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  finishBtnText: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },
  wideBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  wideBtnText: { color: '#fff', fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composerInput: {
    flex: 1,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.subhead,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
