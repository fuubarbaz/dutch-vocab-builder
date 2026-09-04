import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

/**
 * One place for Dutch speech recognition.
 *
 * Four screens had grown their own copy of this — the same permission request, the
 * same silence timer, the same five event handlers — and they had already drifted
 * apart on whether a failure is shown to the user at all.
 *
 * The screens keep whatever they do with the result (accuracy scoring, sending the
 * text to the model, driving an animation); the hook owns the recogniser lifecycle.
 */

export interface DutchSpeechOptions {
  /** Stop listening after this much silence. Exam answers need longer than single words. */
  silenceMs?: number;
  /** Enables volume events. Only turn this on if something is actually drawn with them. */
  meterVolume?: boolean;
  /** Called for every result, interim ones included. */
  onResult?: (transcript: string, isFinal: boolean) => void;
  /** Microphone level, already normalised to roughly 0–1. */
  onVolume?: (level: number) => void;
}

export interface DutchSpeechRecognition {
  isRecording: boolean;
  /** True between stop() and the final result — the recogniser is still thinking. */
  isProcessing: boolean;
  transcript: string;
  /** User-facing Dutch message, or null. 'no-speech' is deliberately not an error. */
  error: string | null;
  start: () => Promise<void>;
  /** Stop and wait for the final result. */
  stop: () => void;
  /** Stop and discard — for leaving the screen or cancelling outright. */
  abort: () => void;
  reset: () => void;
}

/** The recogniser can go quiet without ever sending a final result; don't hang on it. */
const PROCESSING_GIVE_UP_MS = 5000;

export function useDutchSpeechRecognition(
  options: DutchSpeechOptions = {},
): DutchSpeechRecognition {
  const { silenceMs = 3000, meterVolume = false } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Kept in refs so the event handlers below never close over a stale callback.
  const onResultRef = useRef(options.onResult);
  const onVolumeRef = useRef(options.onVolume);
  onResultRef.current = options.onResult;
  onVolumeRef.current = options.onVolume;

  const clearTimers = useCallback(() => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    if (processingTimer.current) clearTimeout(processingTimer.current);
    silenceTimer.current = null;
    processingTimer.current = null;
  }, []);

  const stop = useCallback(() => {
    setIsRecording(false);
    setIsProcessing(true);
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    processingTimer.current = setTimeout(() => setIsProcessing(false), PROCESSING_GIVE_UP_MS);
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      setIsProcessing(false);
    }
  }, []);

  const bumpSilenceTimer = useCallback(() => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => stop(), silenceMs);
  }, [silenceMs, stop]);

  useSpeechRecognitionEvent('start', () => {
    setIsRecording(true);
    bumpSilenceTimer();
  });

  useSpeechRecognitionEvent('end', () => {
    setIsRecording(false);
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    onVolumeRef.current?.(0);
  });

  useSpeechRecognitionEvent('error', (e) => {
    setIsRecording(false);
    setIsProcessing(false);
    clearTimers();
    onVolumeRef.current?.(0);
    // Staying silent is not a failure worth telling the user about.
    if (e?.error !== 'no-speech') {
      setError('Spraakherkenning werkt hier niet. Controleer de microfoon en of Nederlands beschikbaar is.');
    }
  });

  useSpeechRecognitionEvent('result', (e) => {
    bumpSilenceTimer();
    const text = e.results?.[0]?.transcript;
    if (typeof text !== 'string') return;
    setTranscript(text);
    onResultRef.current?.(text, !!e.isFinal);
    if (e.isFinal) {
      setIsProcessing(false);
      if (processingTimer.current) clearTimeout(processingTimer.current);
    }
  });

  useSpeechRecognitionEvent('volumechange', (e) => {
    if (!meterVolume) return;
    onVolumeRef.current?.(Math.max(0.1, Math.min(1, (e.value + 2) / 12)));
  });

  useEffect(() => () => {
    clearTimers();
    ExpoSpeechRecognitionModule.abort();
  }, [clearTimers]);

  const abort = useCallback(() => {
    clearTimers();
    setIsRecording(false);
    setIsProcessing(false);
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch { /* nothing was running */ }
  }, [clearTimers]);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    setIsProcessing(false);
  }, []);

  const start = useCallback(async () => {
    reset();
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setError('Geen toegang tot de microfoon. Sta dit toe in Instellingen om hardop te oefenen.');
      return;
    }
    try {
      ExpoSpeechRecognitionModule.start({
        lang: 'nl-NL',
        interimResults: true,
        ...(meterVolume ? { volumeChangeEventOptions: { enabled: true } } : {}),
      });
    } catch {
      setError('Spraakherkenning kon niet starten. Probeer het opnieuw.');
    }
  }, [meterVolume, reset]);

  return { isRecording, isProcessing, transcript, error, start, stop, abort, reset };
}
