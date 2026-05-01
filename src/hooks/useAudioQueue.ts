/**
 * useAudioQueue
 *
 * Two-tier audio system for Learn Phrases:
 *
 * Tier 1 (preferred): bundled MP3 assets → react-native-track-player
 *   • Fully offline — no network required
 *   • Audio continues when app is backgrounded
 *   • Lock-screen / notification media controls
 *   • Assets generated once via: GOOGLE_TTS_API_KEY=... npx tsx scripts/generate-audio.ts
 *   • Requires EAS rebuild to link react-native-track-player
 *
 * Tier 2 (fallback): expo-speech on-device TTS
 *   • Used before EAS rebuild, or if bundled audio not yet generated
 *   • Stops when app is backgrounded
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { speakInLanguage, stopTTS, startNewPlayback, getPlaybackGeneration } from '@/utils/tts';
import { PHRASE_AUDIO } from '@/assets/audio/phrases';

// ── Lazy-load react-native-track-player ──────────────────────────────────────

let TrackPlayer: any = null;
let nativeAvailable: boolean | null = null;

function getTrackPlayer(): any | null {
  if (nativeAvailable === false) return null;
  if (nativeAvailable === true) return TrackPlayer;
  try {
    TrackPlayer = require('react-native-track-player').default;
    nativeAvailable = true;
    return TrackPlayer;
  } catch {
    nativeAvailable = false;
    return null;
  }
}

// Bundled audio is ready when the manifest has entries AND track player is linked
const hasBundledAudio = Object.keys(PHRASE_AUDIO).length > 0;

export interface QueuePhrase {
  id: string;
  dutch: string;
  english: string;
  category: string;
}

export interface AudioQueueState {
  isReady: boolean;
  isPlaying: boolean;
  isSynthesizing: boolean; // always false with bundled audio; kept for API compat
  currentIndex: number;
  totalCount: number;
  currentPhrase: QueuePhrase | null;
  usingNative: boolean;
}

const INITIAL_STATE: AudioQueueState = {
  isReady: false,
  isPlaying: false,
  isSynthesizing: false,
  currentIndex: 0,
  totalCount: 0,
  currentPhrase: null,
  usingNative: false,
};

// ── Track Player one-time setup ───────────────────────────────────────────────

let playerSetupPromise: Promise<boolean> | null = null;

async function setupTrackPlayer(): Promise<boolean> {
  if (playerSetupPromise) return playerSetupPromise;
  playerSetupPromise = (async () => {
    const tp = getTrackPlayer();
    if (!tp) return false;
    try {
      const { Capability } = require('react-native-track-player');
      await tp.setupPlayer();
      await tp.updateOptions({
        capabilities: [
          Capability.Play, Capability.Pause, Capability.Stop,
          Capability.SkipToNext, Capability.SkipToPrevious,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
        progressUpdateEventInterval: 1,
      });
      return true;
    } catch (e: any) {
      if (typeof e?.message === 'string' && e.message.includes('already')) return true;
      console.warn('TrackPlayer setup failed, falling back to expo-speech:', e?.message);
      nativeAvailable = false;
      playerSetupPromise = null;
      return false;
    }
  })();
  return playerSetupPromise;
}

// ── Track building ────────────────────────────────────────────────────────────

// Each phrase = 2 tracks: Dutch then English (from bundled MP3 assets)
function buildPhraseTracks(phrase: QueuePhrase) {
  const assets = PHRASE_AUDIO[phrase.id];
  if (!assets) return null;
  return [
    { id: `${phrase.id}_nl`, url: assets.nl,  title: phrase.dutch,   artist: phrase.english, album: phrase.category },
    { id: `${phrase.id}_en`, url: assets.en,  title: phrase.english, artist: phrase.dutch,   album: phrase.category },
  ];
}

// Phrase index ↔ track player index (2 tracks per phrase)
const trackToPhrase = (trackIndex: number) => Math.floor(trackIndex / 2);
const phraseToTrack = (phraseIndex: number) => phraseIndex * 2;

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAudioQueue(livePhrasePause?: number) {
  const [state, setState] = useState<AudioQueueState>(INITIAL_STATE);

  const phrasesRef    = useRef<QueuePhrase[]>([]);
  const stopRef       = useRef(false);
  const jumpRef       = useRef<number | null>(null);
  const startIndexRef = useRef<number>(0);
  const phrasePauseRef = useRef<number>(livePhrasePause ?? 1);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep phrasePauseRef in sync when the setting changes mid-playback
  useEffect(() => {
    if (livePhrasePause != null) {
      phrasePauseRef.current = livePhrasePause;
    }
  }, [livePhrasePause]);

  // ── Expo-speech fallback ──────────────────────────────────────────────────

  const speakLang = (text: string, lang: 'nl' | 'en', rate: number): Promise<void> =>
    new Promise(resolve => {
      speakInLanguage(text, lang, rate, { onDone: resolve, onError: resolve, onStopped: resolve });
    });

  const runTtsLoop = async (startIdx: number, phrases: QueuePhrase[], rate: number, pauseSec: number = 1) => {
    const gen = startNewPlayback();
    stopRef.current = false;
    jumpRef.current = null;

    const superseded = () => stopRef.current || getPlaybackGeneration() !== gen;

    let i = startIdx;
    while (i < phrases.length) {
      if (superseded()) break;
      if (jumpRef.current !== null) { i = jumpRef.current; jumpRef.current = null; continue; }

      const phrase = phrases[i];
      setState(prev => ({ ...prev, isPlaying: true, currentIndex: i, currentPhrase: phrase }));

      await speakLang(phrase.dutch, 'nl', rate);
      if (superseded()) break;
      await new Promise(r => setTimeout(r, 300));
      await speakLang(phrase.english, 'en', rate);
      if (superseded()) break;
      // Read live value from ref so mid-playback changes take effect
      await new Promise(r => setTimeout(r, phrasePauseRef.current * 1000));
      i++;
    }

    if (getPlaybackGeneration() === gen) {
      setState(prev => ({ ...prev, isPlaying: false, currentPhrase: null }));
    }
  };

  // ── Track player event listeners ──────────────────────────────────────────

  useEffect(() => {
    const tp = getTrackPlayer();
    if (!tp) return;
    const { Event, State } = require('react-native-track-player');
    let prevTrackIndex: number | null = null;

    const sub1 = tp.addEventListener(Event.PlaybackActiveTrackChanged, async (event: any) => {
      if (event.index == null) return;
      const trackIndex = event.index;

      // event.index is queue-relative (0 = first track loaded), convert to absolute phrase index
      const phraseIndex = Math.floor(trackIndex / 2) + startIndexRef.current;
      const phrase = phrasesRef.current[phraseIndex] ?? null;
      setState(prev => ({ ...prev, currentIndex: phraseIndex, currentPhrase: phrase }));

      // Insert pause between phrases: when moving from an English track (odd) to a Dutch track (even)
      // that means a new phrase is starting — pause for the configured duration
      if (prevTrackIndex != null && prevTrackIndex % 2 === 1 && trackIndex % 2 === 0) {
        const pauseMs = phrasePauseRef.current * 1000;
        if (pauseMs > 0) {
          try {
            await tp.pause();
            pauseTimerRef.current = setTimeout(async () => {
              pauseTimerRef.current = null;
              try { await tp.play(); } catch { /* ignore */ }
            }, pauseMs);
          } catch { /* ignore */ }
        }
      }
      prevTrackIndex = trackIndex;
    });

    const sub2 = tp.addEventListener(Event.PlaybackState, (event: any) => {
      setState(prev => ({ ...prev, isPlaying: event.state === State.Playing }));
    });

    return () => { sub1?.remove?.(); sub2?.remove?.(); };
  }, []);

  useEffect(() => {
    return () => {
      stopRef.current = true;
      if (pauseTimerRef.current) { clearTimeout(pauseTimerRef.current); pauseTimerRef.current = null; }
      if (nativeAvailable !== true) stopTTS();
    };
  }, []);

  // ── Public API ────────────────────────────────────────────────────────────

  /** Load phrases and return `true` if native track player is ready (caller should follow with `play()`). */
  const load = useCallback(async (
    phrases: QueuePhrase[],
    startIndex = 0,
    speechRate = 0.85,
    phrasePause = 1,
  ): Promise<boolean> => {
    phrasesRef.current = phrases;
    startIndexRef.current = startIndex;
    phrasePauseRef.current = phrasePause;
    if (pauseTimerRef.current) { clearTimeout(pauseTimerRef.current); pauseTimerRef.current = null; }

    setState(prev => ({
      ...prev, isReady: false, isSynthesizing: false,
      currentIndex: startIndex, totalCount: phrases.length,
      currentPhrase: phrases[startIndex] ?? null,
    }));

    // Try bundled audio + track player path
    if (hasBundledAudio) {
      const playerReady = await setupTrackPlayer();
      if (playerReady) {
        try {
          const tp = getTrackPlayer()!;
          await tp.reset();

          // Build all tracks from the start index onwards synchronously
          const allTracks: any[] = [];
          for (let i = startIndex; i < phrases.length; i++) {
            const tracks = buildPhraseTracks(phrases[i]);
            if (tracks) allTracks.push(...tracks);
          }

          await tp.add(allTracks);
          setState(prev => ({ ...prev, isReady: true, usingNative: true }));
          return true;
        } catch (e: any) {
          console.warn('Track player load failed, falling back to expo-speech:', e?.message);
          nativeAvailable = false;
          playerSetupPromise = null;
        }
      }
    }

    // expo-speech fallback (starts playing immediately, no need for caller to call play())
    setState(prev => ({ ...prev, isReady: true, usingNative: false }));
    runTtsLoop(startIndex, phrases, speechRate, phrasePause);
    return false;
  }, []);

  const play = useCallback(async () => {
    if (nativeAvailable === true) {
      try { await TrackPlayer.play(); } catch { /* ignore */ }
    }
  }, []);

  const pause = useCallback(async () => {
    if (nativeAvailable === true) {
      try { await TrackPlayer.pause(); } catch { /* ignore */ }
    } else {
      stopRef.current = true;
      stopTTS();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const stop = useCallback(async () => {
    stopRef.current = true;
    stopTTS();
    if (pauseTimerRef.current) { clearTimeout(pauseTimerRef.current); pauseTimerRef.current = null; }
    if (nativeAvailable === true) {
      try { await TrackPlayer.reset(); } catch { /* ignore */ }
    }
    setState(prev => ({ ...prev, isPlaying: false, currentPhrase: null, isReady: false }));
  }, []);

  const next = useCallback(async () => {
    if (nativeAvailable === true) {
      try {
        if (pauseTimerRef.current) { clearTimeout(pauseTimerRef.current); pauseTimerRef.current = null; }
        const nextPhrase = state.currentIndex + 1;
        if (nextPhrase < phrasesRef.current.length) {
          // TrackPlayer queue is 0-based from startIndex, so convert to queue-relative
          await TrackPlayer.skip((nextPhrase - startIndexRef.current) * 2);
          await TrackPlayer.play();
        }
      } catch { /* ignore */ }
    } else {
      if (jumpRef.current === null) {
        const nextIdx = state.currentIndex + 1;
        jumpRef.current = nextIdx < phrasesRef.current.length ? nextIdx : phrasesRef.current.length - 1;
        stopTTS();
      }
    }
  }, [state.currentIndex]);

  const prev = useCallback(async () => {
    if (nativeAvailable === true) {
      try {
        if (pauseTimerRef.current) { clearTimeout(pauseTimerRef.current); pauseTimerRef.current = null; }
        const prevPhrase = Math.max(startIndexRef.current, state.currentIndex - 1);
        await TrackPlayer.skip((prevPhrase - startIndexRef.current) * 2);
        await TrackPlayer.play();
      } catch { /* ignore */ }
    } else {
      jumpRef.current = Math.max(0, state.currentIndex - 1);
      stopTTS();
    }
  }, [state.currentIndex]);

  const jumpTo = useCallback(async (phraseIndex: number, speechRate = 0.85, phrasePause = 1) => {
    const phrases = phrasesRef.current;
    if (phraseIndex < 0 || phraseIndex >= phrases.length) return;
    const isNative = await load(phrases, phraseIndex, speechRate, phrasePause);
    if (isNative) await play();
  }, [load, play]);

  return { state, load, play, pause, stop, next, prev, jumpTo };
}
