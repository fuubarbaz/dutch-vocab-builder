/**
 * AIContext — unified on-device AI state machine.
 *
 * State machine:
 *
 *   idle  ──► loading_model ──► model_ready ──► generating ──► model_ready
 *              │                    │                │
 *              ▼                    ▼                ▼
 *            error               error             error
 *              │                    │                │
 *              └────────────────────┴────────────────┘
 *                              (retry)
 *
 * Every AI feature in the app goes through this context.  It provides:
 *  • A single source of truth for engine state
 *  • Classified, user-friendly errors with recovery actions
 *  • Standardised debug logging (only in __DEV__ mode)
 *  • A non-blocking toast for transient errors
 */

import React, {
  createContext, useCallback, useContext, useEffect,
  useRef, useState,
} from 'react';
import {
  Alert, Animated, Pressable, StyleSheet, Text, View,
} from 'react-native';
import AIModule, { isFallback } from 'dutch-vocab-ai';
import type { AIAvailability, DownloadProgress } from 'dutch-vocab-ai';
import Colors, { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AIEngineState =
  | 'idle'
  | 'loading_model'
  | 'model_ready'
  | 'generating'
  | 'error';

export type AIErrorKind =
  | 'not_downloaded'
  | 'load_failed'
  | 'out_of_memory'
  | 'generation_timeout'
  | 'generation_failed'
  | 'session_expired'
  | 'vision_unavailable'
  | 'not_available';

export interface AIError {
  kind: AIErrorKind;
  /** Short human-readable message shown in UI. */
  message: string;
  /** Raw error string from native layer (shown in debug / load-error screen). */
  detail?: string;
  /** True if the user can retry without re-downloading the model. */
  recoverable: boolean;
}

export interface AIContextValue {
  // ── State ──
  engineState: AIEngineState;
  error: AIError | null;
  isFallback: boolean;

  // ── Generate wrappers ──
  generate(prompt: string): Promise<string>;
  generateSmallTalk(topic: string, turnCount: number): Promise<string>;
  generateSmallTalkStream(topic: string, turnCount: number): Promise<void>;
  translateTexts(texts: string[], from: string, to: string): Promise<string[]>;

  // ── Roleplay (stateful — see DutchVocabAIModule.swift) ──
  startRoleplay(scenario: string, character: string, level: string): Promise<string>;
  sendRoleplayTurn(sessionId: string, text: string): Promise<string>;
  sendRoleplayTurnStream(sessionId: string, text: string): Promise<void>;
  endRoleplay(sessionId: string): Promise<boolean>;
  /** End-of-scene correction pass. Evicts any live session, so call it after the scene. */
  reviewRoleplay(lines: string[]): Promise<string>;

  // ── Vision ──
  /** null until the engine has loaded at least once and reported in. */
  visionAvailable: boolean | null;
  generatePictureTask(imagePath: string, level: string): Promise<string>;
  reviewPictureAnswer(
    imagePath: string,
    question: string,
    checkpoints: string[],
    answer: string,
  ): Promise<string>;

  // ── Lifecycle ──
  retryLoad(): Promise<void>;
  clearError(): void;

  // ── Download (delegated from AIModelGate) ──
  availability: AIAvailability | null;
  downloadProgress: DownloadProgress | null;
}

// ─── Error classification ─────────────────────────────────────────────────────

function classifyError(err: unknown): AIError {
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes('not_downloaded')) {
    return {
      kind: 'not_downloaded',
      message: 'The AI model is not installed yet.',
      detail: msg,
      recoverable: false,
    };
  }
  if (msg.includes('out of memory') || msg.includes('OOM') || msg.includes('jetsam')) {
    return {
      kind: 'out_of_memory',
      message: 'Not enough memory to run the AI model. Close other apps and try again.',
      detail: msg,
      recoverable: true,
    };
  }
  if (msg.includes('load_failed') || msg.includes('failedToCreateEngine') || msg.includes('failedToCreateSettings')) {
    return {
      kind: 'load_failed',
      message: 'The AI model could not be loaded. Restart the app and try again.',
      detail: msg,
      recoverable: true,
    };
  }
  if (msg.includes('vision_unavailable') || msg.includes('image_missing')) {
    return {
      kind: 'vision_unavailable',
      message: 'Photo features are not available on this device.',
      detail: msg,
      recoverable: false,
    };
  }
  if (msg.includes('session_expired')) {
    return {
      kind: 'session_expired',
      message: 'This roleplay scene ended. Start a new one to keep practising.',
      detail: msg,
      recoverable: true,
    };
  }
  if (msg.includes('timed out') || msg.includes('timeout')) {
    return {
      kind: 'generation_timeout',
      message: 'The AI took too long to respond. Try a shorter prompt.',
      detail: msg,
      recoverable: true,
    };
  }
  if (msg.includes('load_error')) {
    return {
      kind: 'load_failed',
      message: 'The AI model failed to load.',
      detail: msg,
      recoverable: true,
    };
  }
  return {
    kind: 'generation_failed',
    message: 'The AI request failed. Please try again.',
    detail: msg,
    recoverable: true,
  };
}

// ─── Debug logger ─────────────────────────────────────────────────────────────

const AI_LOG_TAG = '[AI]';

function aiLog(level: 'info' | 'warn' | 'error', ...args: unknown[]) {
  if (!__DEV__) return;
  const fn = level === 'info' ? console.log : level === 'warn' ? console.warn : console.error;
  fn(AI_LOG_TAG, ...args);
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AIContext = createContext<AIContextValue | null>(null);

// ─── Toast component ──────────────────────────────────────────────────────────

interface ToastMessage { id: number; message: string; kind: AIErrorKind }

function AIToast({ toasts }: { toasts: ToastMessage[] }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.toastStack} pointerEvents="none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} isDark={isDark} />
      ))}
    </View>
  );
}

function ToastItem({ toast, isDark }: { toast: ToastMessage; isDark: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const bg = toast.kind === 'out_of_memory' || toast.kind === 'load_failed'
    ? '#7f1d1d'
    : '#1c1917';

  return (
    <Animated.View style={[styles.toast, { backgroundColor: bg, opacity }]}>
      <Text style={styles.toastText}>{toast.message}</Text>
    </Animated.View>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AIProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();

  const [engineState, setEngineState] = useState<AIEngineState>('idle');
  const [error, setError] = useState<AIError | null>(null);
  const [availability, setAvailability] = useState<AIAvailability | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [visionAvailable, setVisionAvailable] = useState<boolean | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastCounter = useRef(0);

  // Track whether the engine has ever loaded successfully in this session.
  // Drives the loading_model vs generating state distinction.
  const engineLoadedOnce = useRef(false);

  // ── Initialise availability on mount ──────────────────────────────────────

  useEffect(() => {
    if (isFallback) {
      aiLog('warn', 'Running on JS fallback — native module not available');
      setEngineState('error');
      setError({
        kind: 'not_available',
        message: 'AI features require a development build.',
        recoverable: false,
      });
      return;
    }

    AIModule.getAIAvailabilityAsync()
      .then(av => {
        aiLog('info', 'Initial availability:', av);
        setAvailability(av);
        if (av === 'available') {
          // File exists and (possibly) engine already loaded in a prior session.
          // We set model_ready optimistically; the first generate call will
          // confirm by either succeeding or transitioning to error.
          setEngineState('model_ready');
          engineLoadedOnce.current = true;
        }
        if (av === 'load_error') {
          AIModule.getLoadErrorAsync().then(detail => {
            setEngineState('error');
            setError({ kind: 'load_failed', message: 'Model failed to load.', detail: detail ?? undefined, recoverable: true });
          });
        }
      })
      .catch(err => {
        aiLog('error', 'getAIAvailabilityAsync failed:', err);
      });
  }, []);

  // ── Toast helper ──────────────────────────────────────────────────────────

  const showToast = useCallback((aiError: AIError) => {
    const id = ++toastCounter.current;
    setToasts(prev => [...prev, { id, message: aiError.message, kind: aiError.kind }]);
    // Auto-remove after animation completes (~3.5s)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3600);
  }, []);

  // ── Core generate wrapper ─────────────────────────────────────────────────

  // The trailing comma on <T,> disambiguates the generic from a JSX tag in .tsx files.
  const withEngineGuard = useCallback(async <T,>(
    label: string,
    fn: () => Promise<T>,
  ): Promise<T> => {
    aiLog('info', `▶ ${label}: starting`);
    const t0 = Date.now();

    // Determine if this is the very first call (engine not yet confirmed loaded)
    const isFirstCall = !engineLoadedOnce.current;
    setEngineState(isFirstCall ? 'loading_model' : 'generating');
    setError(null);

    try {
      const result = await fn();
      engineLoadedOnce.current = true;
      setEngineState('model_ready');
      if (visionAvailable === null) {
        AIModule.isVisionAvailableAsync()
          .then(setVisionAvailable)
          .catch(() => setVisionAvailable(false));
      }
      aiLog('info', `✓ ${label}: completed in ${Date.now() - t0}ms`);
      return result;
    } catch (err) {
      const aiError = classifyError(err);
      aiLog('error', `✗ ${label}: ${aiError.kind} — ${aiError.detail}`);
      setError(aiError);
      setEngineState('error');
      // Show a toast for transient errors that shouldn't block the whole screen
      if (aiError.recoverable) showToast(aiError);
      throw aiError;
    }
  }, [showToast, visionAvailable]);

  // ── Public API ─────────────────────────────────────────────────────────────

  const generate = useCallback((prompt: string) =>
    withEngineGuard('generateText', () => AIModule.generateTextAsync(prompt)),
  [withEngineGuard]);

  const generateSmallTalk = useCallback((topic: string, turnCount: number) =>
    withEngineGuard('generateSmallTalk', () => AIModule.generateSmallTalkAsync(topic, turnCount)),
  [withEngineGuard]);

  const generateSmallTalkStream = useCallback((topic: string, turnCount: number) =>
    withEngineGuard('generateSmallTalkStream', () => AIModule.generateSmallTalkStreamAsync(topic, turnCount)),
  [withEngineGuard]);

  const startRoleplay = useCallback((scenario: string, character: string, level: string) =>
    withEngineGuard('startRoleplay', () => AIModule.startRoleplaySessionAsync(scenario, character, level)),
  [withEngineGuard]);

  const sendRoleplayTurn = useCallback((sessionId: string, text: string) =>
    withEngineGuard('sendRoleplayTurn', () => AIModule.sendRoleplayTurnAsync(sessionId, text)),
  [withEngineGuard]);

  const sendRoleplayTurnStream = useCallback((sessionId: string, text: string) =>
    withEngineGuard('sendRoleplayTurnStream', () => AIModule.sendRoleplayTurnStreamAsync(sessionId, text)),
  [withEngineGuard]);

  // Not wrapped in withEngineGuard: ending a scene is cleanup that runs on unmount,
  // and it must not flip the whole engine into `error` if the session is already gone.
  const endRoleplay = useCallback(async (sessionId: string) => {
    try {
      return await AIModule.endRoleplaySessionAsync(sessionId);
    } catch {
      return false;
    }
  }, []);

  const reviewRoleplay = useCallback((lines: string[]) =>
    withEngineGuard('reviewRoleplay', () => AIModule.reviewRoleplayAsync(lines)),
  [withEngineGuard]);

  const generatePictureTask = useCallback((imagePath: string, level: string) =>
    withEngineGuard('generatePictureTask', () => AIModule.generatePictureTaskAsync(imagePath, level)),
  [withEngineGuard]);

  const reviewPictureAnswer = useCallback((
    imagePath: string,
    question: string,
    checkpoints: string[],
    answer: string,
  ) =>
    withEngineGuard('reviewPictureAnswer',
      () => AIModule.reviewPictureAnswerAsync(imagePath, question, checkpoints, answer)),
  [withEngineGuard]);

  const translateTexts = useCallback((texts: string[], from: string, to: string) =>
    withEngineGuard('translateTexts', () => AIModule.translateTextsAsync(texts, from, to)),
  [withEngineGuard]);

  const retryLoad = useCallback(async () => {
    aiLog('info', 'retryLoad: resetting engine state and retrying');
    engineLoadedOnce.current = false;
    setError(null);
    setEngineState('idle');
    // Ping availability to re-check file system state
    try {
      const av = await AIModule.getAIAvailabilityAsync();
      setAvailability(av);
      if (av === 'available') setEngineState('model_ready');
    } catch { /* ignore */ }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setEngineState(engineLoadedOnce.current ? 'model_ready' : 'idle');
  }, []);

  const value: AIContextValue = {
    engineState,
    error,
    isFallback,
    generate,
    generateSmallTalk,
    generateSmallTalkStream,
    translateTexts,
    startRoleplay,
    sendRoleplayTurn,
    sendRoleplayTurnStream,
    endRoleplay,
    reviewRoleplay,
    visionAvailable,
    generatePictureTask,
    reviewPictureAnswer,
    retryLoad,
    clearError,
    availability,
    downloadProgress,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
      <AIToast toasts={toasts} />
    </AIContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAI(): AIContextValue {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used inside <AIProvider>');
  return ctx;
}

/**
 * Lightweight hook for components that only need to check availability
 * without subscribing to the full generation state.
 */
export function useAIAvailability() {
  const { engineState, error, isFallback } = useAI();
  return {
    isReady: engineState === 'model_ready' || engineState === 'generating',
    isLoading: engineState === 'loading_model',
    hasError: engineState === 'error',
    isFallback,
    error,
  };
}

// ─── Inline error banner ──────────────────────────────────────────────────────

/**
 * Drop-in banner for AI features that shows recovery instructions when the
 * engine is in error state.  Usage:
 *
 *   const { engineState } = useAI();
 *   if (engineState === 'error') return <AIErrorBanner />;
 */
export function AIErrorBanner() {
  const { error, retryLoad, clearError } = useAI();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  if (!error) return null;

  const isRecoverable = error.recoverable;
  // load_failed almost always means the model file is corrupt / truncated /
  // unparseable. Offer a one-tap recovery that deletes the file and resets
  // engine state so the gate re-prompts for download on next mount.
  const isLoadFailed = error.kind === 'load_failed';
  const bg = colorScheme === 'dark' ? '#2d1b1b' : '#fef2f2';
  const border = colorScheme === 'dark' ? '#7f1d1d' : '#fca5a5';

  const handleRedownload = () => {
    Alert.alert(
      'Delete & re-download AI model?',
      'This removes the current model file (~2.6 GB) and asks you to download a fresh copy. Use this if the AI keeps failing to load.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete & re-download',
          style: 'destructive',
          onPress: async () => {
            try { await AIModule.resetModelAsync(true); } catch { /* ignore */ }
            await retryLoad();
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.errorBanner, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.errorBannerTitle, { color: theme.danger }]}>
        AI unavailable
      </Text>
      <Text style={[styles.errorBannerMsg, { color: theme.text }]}>
        {error.message}
      </Text>
      {__DEV__ && error.detail ? (
        <Text style={[styles.errorBannerDetail, { color: theme.textSecondary }]}>
          {error.detail}
        </Text>
      ) : null}
      <View style={styles.errorBannerActions}>
        {isRecoverable && (
          <Pressable onPress={retryLoad} style={[styles.errorBannerBtn, { backgroundColor: theme.danger }]}>
            <Text style={styles.errorBannerBtnText}>Retry</Text>
          </Pressable>
        )}
        {isLoadFailed && (
          <Pressable onPress={handleRedownload} style={[styles.errorBannerBtn, { backgroundColor: theme.danger }]}>
            <Text style={styles.errorBannerBtnText}>Re-download</Text>
          </Pressable>
        )}
        <Pressable onPress={clearError} style={[styles.errorBannerBtn, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={[styles.errorBannerBtnText, { color: theme.text }]}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  toastStack: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.lg,
    right: Spacing.lg,
    gap: Spacing.sm,
    zIndex: 9999,
    pointerEvents: 'none',
  } as any,
  toast: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  toastText: {
    color: '#fff',
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  },

  errorBanner: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  errorBannerTitle: {
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorBannerMsg: {
    fontSize: FontSize.subhead,
    lineHeight: 20,
  },
  errorBannerDetail: {
    fontSize: FontSize.caption,
    fontFamily: 'Menlo',
    lineHeight: 16,
  },
  errorBannerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  errorBannerBtn: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  errorBannerBtnText: {
    color: '#fff',
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.semibold,
  },
});
