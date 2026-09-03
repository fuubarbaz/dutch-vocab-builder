import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Download, Sparkles, X } from 'lucide-react-native';

import AIModule, { isFallback, type AIAvailability, type DownloadProgress } from 'dutch-vocab-ai';
import { Alert } from 'react-native';
import Colors, { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

/**
 * Set when the user dismisses the first-run download prompt. While it is set the
 * gate stays out of the way on every launch, so any later install has to go
 * through Settings › On-device AI — the in-app "AI unavailable" guides point
 * there for exactly this reason. Clear it whenever the model is installed so a
 * subsequent delete re-arms the first-run prompt.
 */
export const AI_MODEL_SKIPPED_KEY = '@dutchify/ai-model-skipped-v2';
const SKIPPED_KEY = AI_MODEL_SKIPPED_KEY;
const APPROX_SIZE_LABEL = '~2.6 GB';

type GateStatus = 'checking' | 'ready' | 'prompt' | 'downloading' | 'error' | 'load_error';

type Props = { children: React.ReactNode };

export function AIModelGate({ children }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [status, setStatus] = useState<GateStatus>('checking');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadErrorDetail, setLoadErrorDetail] = useState<string | null>(null);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (isFallback) {
        setStatus('ready');
        return;
      }
      try {
        const availability: AIAvailability = await AIModule.getAIAvailabilityAsync();
        if (cancelled) return;
        if (availability === 'available') {
          setStatus('ready');
          return;
        }
        if (availability === 'load_error') {
          const detail = await AIModule.getLoadErrorAsync().catch(() => null);
          if (!cancelled) {
            setLoadErrorDetail(detail);
            setStatus('load_error');
          }
          return;
        }
        const skipped = await AsyncStorage.getItem(SKIPPED_KEY);
        if (cancelled) return;
        if (skipped === '1') {
          setStatus('ready');
          return;
        }
        setStatus('prompt');
      } catch {
        if (!cancelled) setStatus('ready');
      }
    };

    init();
    return () => {
      cancelled = true;
      subscriptionRef.current?.remove();
    };
  }, []);

  const startDownload = async () => {
    setErrorMessage(null);
    setStatus('downloading');
    setProgress({ bytesReceived: 0, totalBytes: 0, fraction: 0 });

    subscriptionRef.current?.remove();
    subscriptionRef.current = AIModule.addListener(
      'onDownloadProgress',
      (p: DownloadProgress) => setProgress(p),
    );

    try {
      await AIModule.downloadModelAsync();
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      await AsyncStorage.removeItem(SKIPPED_KEY);
      setStatus('ready');
    } catch (err) {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  const cancelDownload = async () => {
    try {
      await AIModule.cancelDownloadAsync();
    } catch {
      // ignore
    }
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setStatus('prompt');
    setProgress(null);
  };

  const skip = async () => {
    await AsyncStorage.setItem(SKIPPED_KEY, '1');
    setStatus('ready');
  };

  const resetAndRedownload = () => {
    Alert.alert(
      'Delete & Re-download?',
      'This will delete the current model file and start a fresh download (~2.6 GB). Make sure you are on Wi-Fi.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete & Re-download',
          style: 'destructive',
          onPress: async () => {
            try {
              await AIModule.resetModelAsync(true);
              setLoadErrorDetail(null);
              setStatus('prompt');
            } catch {
              setStatus('prompt');
            }
          },
        },
      ],
    );
  };

  const confirmSkip = () => {
    Alert.alert(
      'Skip AI download?',
      'You can install the on-device tutor later from Settings. AI-powered features will be disabled until then.',
      [
        { text: 'Keep download', style: 'cancel' },
        { text: 'Skip', style: 'destructive', onPress: skip },
      ],
    );
  };

  if (status === 'checking' || status === 'ready') {
    return <>{children}</>;
  }

  const pct = progress ? Math.round(progress.fraction * 100) : 0;
  const mbReceived = progress ? (progress.bytesReceived / (1024 * 1024)).toFixed(0) : '0';
  const mbTotal = progress && progress.totalBytes > 0
    ? (progress.totalBytes / (1024 * 1024)).toFixed(0)
    : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={[styles.iconBubble, { backgroundColor: theme.accentLight }]}>
          <Sparkles size={32} color={theme.primary} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>On-device AI tutor</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Dutchify uses a private, on-device language model (Gemma 4 E2B) for grammar checks, small talk, and writing feedback. Download it once to use AI features offline.
        </Text>

        {status === 'prompt' && (
          <>
            <View style={[styles.detailRow, { borderColor: theme.border }]}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Download size</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{APPROX_SIZE_LABEL}</Text>
            </View>
            <Pressable
              onPress={startDownload}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Download size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>Download model</Text>
            </Pressable>
            <Pressable onPress={confirmSkip} hitSlop={8} style={styles.skipButton}>
              <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>Skip for now</Text>
            </Pressable>
          </>
        )}

        {status === 'downloading' && (
          <>
            <View style={styles.progressWrap}>
              <View style={[styles.progressTrack, { backgroundColor: theme.surfaceSecondary }]}>
                <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${pct}%` }]} />
              </View>
              <Text style={[styles.progressLabel, { color: theme.text }]}>
                {pct}% {mbTotal ? `· ${mbReceived} / ${mbTotal} MB` : `· ${mbReceived} MB`}
              </Text>
              <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.md }} />
            </View>
            <Pressable onPress={cancelDownload} hitSlop={8} style={styles.skipButton}>
              <X size={14} color={theme.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>Cancel</Text>
            </Pressable>
          </>
        )}

        {status === 'error' && (
          <>
            <Text style={[styles.errorText, { color: theme.danger }]}>
              Download failed: {errorMessage ?? 'unknown error'}
            </Text>
            <Pressable
              onPress={startDownload}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.primaryButtonText}>Try again</Text>
            </Pressable>
            <Pressable onPress={confirmSkip} hitSlop={8} style={styles.skipButton}>
              <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>Skip for now</Text>
            </Pressable>
          </>
        )}

        {status === 'load_error' && (
          <>
            <Text style={[styles.errorText, { color: theme.danger }]}>
              The model downloaded but failed to load on this device.
            </Text>
            {loadErrorDetail && (
              <Text style={[styles.errorDetail, { color: theme.textSecondary }]}>
                {loadErrorDetail}
              </Text>
            )}
            <Pressable
              onPress={resetAndRedownload}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.danger, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.primaryButtonText}>Delete & Re-download</Text>
            </Pressable>
            <Pressable onPress={confirmSkip} hitSlop={8} style={styles.skipButton}>
              <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>Skip for now</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: BorderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.title2,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.subhead,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  detailRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.lg,
  },
  detailLabel: {
    fontSize: FontSize.footnote,
  },
  detailValue: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    width: '100%',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
  skipButton: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  skipButtonText: {
    fontSize: FontSize.footnote,
  },
  progressWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressLabel: {
    marginTop: Spacing.sm,
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.medium,
  },
  errorText: {
    fontSize: FontSize.subhead,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  errorDetail: {
    fontSize: FontSize.footnote,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
});
