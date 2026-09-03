import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView,
  Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence,
} from 'react-native-reanimated';
import {
  useAudioRecorder, useAudioRecorderState,
  createAudioPlayer,
  RecordingPresets, requestRecordingPermissionsAsync,
  setAudioModeAsync, setIsAudioActiveAsync,
  type AudioPlayer,
} from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { speakWithCallback, stopTTS } from '@/utils/tts';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// ─── Vowel palette ────────────────────────────────────────────────────────────

const PALETTE = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6',
  '#f97316', '#06b6d4', '#84cc16', '#a855f7',
  '#e11d48',
];

// ─── Word data ────────────────────────────────────────────────────────────────

type VowelWord = { dutch: string; english: string };

type VowelCategory = {
  id: string;
  label: string;
  sound: string;
  color: string;
  words: VowelWord[];
};

export const VOWEL_CATEGORIES: VowelCategory[] = [
  {
    id: 'aa',
    label: 'aa',
    sound: 'long "ah" — like "father"',
    color: PALETTE[0],
    words: [
      { dutch: 'maan', english: 'moon' },
      { dutch: 'naam', english: 'name' },
      { dutch: 'kaas', english: 'cheese' },
      { dutch: 'paard', english: 'horse' },
      { dutch: 'straat', english: 'street' },
      { dutch: 'jaar', english: 'year' },
      { dutch: 'baas', english: 'boss' },
      { dutch: 'raam', english: 'window' },
      { dutch: 'maand', english: 'month' },
      { dutch: 'staat', english: 'state' },
    ],
  },
  {
    id: 'ee',
    label: 'ee',
    sound: 'long "ay" — like "say"',
    color: PALETTE[1],
    words: [
      { dutch: 'zee', english: 'sea' },
      { dutch: 'been', english: 'leg / bone' },
      { dutch: 'meer', english: 'lake / more' },
      { dutch: 'feest', english: 'party' },
      { dutch: 'breed', english: 'wide' },
      { dutch: 'veel', english: 'much / many' },
      { dutch: 'steen', english: 'stone' },
      { dutch: 'geel', english: 'yellow' },
      { dutch: 'leeg', english: 'empty' },
      { dutch: 'beest', english: 'animal / beast' },
    ],
  },
  {
    id: 'oo',
    label: 'oo',
    sound: 'long "oh" — like "go"',
    color: PALETTE[2],
    words: [
      { dutch: 'rood', english: 'red' },
      { dutch: 'boot', english: 'boat' },
      { dutch: 'boom', english: 'tree' },
      { dutch: 'groot', english: 'big / large' },
      { dutch: 'dood', english: 'dead / death' },
      { dutch: 'oog', english: 'eye' },
      { dutch: 'oor', english: 'ear' },
      { dutch: 'noot', english: 'nut / note' },
      { dutch: 'toon', english: 'tone / show' },
      { dutch: 'school', english: 'school' },
    ],
  },
  {
    id: 'uu',
    label: 'uu',
    sound: 'long "ew" — like French "tu"',
    color: PALETTE[3],
    words: [
      { dutch: 'duur', english: 'expensive' },
      { dutch: 'uur', english: 'hour' },
      { dutch: 'vuur', english: 'fire' },
      { dutch: 'muur', english: 'wall' },
      { dutch: 'huur', english: 'rent' },
      { dutch: 'puur', english: 'pure' },
      { dutch: 'zuur', english: 'sour / acid' },
      { dutch: 'stuur', english: 'steering wheel' },
      { dutch: 'buur', english: 'neighbour' },
      { dutch: 'uur', english: 'hour' },
    ],
  },
  {
    id: 'ie',
    label: 'ie',
    sound: 'long "ee" — like "see"',
    color: PALETTE[4],
    words: [
      { dutch: 'bier', english: 'beer' },
      { dutch: 'hier', english: 'here' },
      { dutch: 'brief', english: 'letter' },
      { dutch: 'ziek', english: 'sick / ill' },
      { dutch: 'lief', english: 'sweet / dear' },
      { dutch: 'vier', english: 'four' },
      { dutch: 'dier', english: 'animal' },
      { dutch: 'piek', english: 'peak / spike' },
      { dutch: 'bied', english: 'offer' },
      { dutch: 'riem', english: 'belt / strap' },
    ],
  },
  {
    id: 'oe',
    label: 'oe',
    sound: '"oo" — like "food"',
    color: PALETTE[5],
    words: [
      { dutch: 'boek', english: 'book' },
      { dutch: 'hoek', english: 'corner' },
      { dutch: 'broek', english: 'trousers' },
      { dutch: 'goed', english: 'good' },
      { dutch: 'hoed', english: 'hat' },
      { dutch: 'koek', english: 'cookie' },
      { dutch: 'moe', english: 'tired' },
      { dutch: 'schoen', english: 'shoe' },
      { dutch: 'vloek', english: 'curse' },
      { dutch: 'doek', english: 'cloth' },
    ],
  },
  {
    id: 'ui',
    label: 'ui',
    sound: 'unique Dutch sound — "ow-ee" combined',
    color: PALETTE[6],
    words: [
      { dutch: 'huis', english: 'house' },
      { dutch: 'muis', english: 'mouse' },
      { dutch: 'buik', english: 'belly / stomach' },
      { dutch: 'duif', english: 'pigeon / dove' },
      { dutch: 'ruim', english: 'spacious' },
      { dutch: 'tuin', english: 'garden' },
      { dutch: 'uil', english: 'owl' },
      { dutch: 'luik', english: 'hatch / flap' },
      { dutch: 'ruis', english: 'noise / static' },
      { dutch: 'zuil', english: 'pillar / column' },
    ],
  },
  {
    id: 'eu',
    label: 'eu',
    sound: 'French "eu" — like "her" without the r',
    color: PALETTE[7],
    words: [
      { dutch: 'deur', english: 'door' },
      { dutch: 'neus', english: 'nose' },
      { dutch: 'kleur', english: 'colour' },
      { dutch: 'geur', english: 'smell / scent' },
      { dutch: 'beurs', english: 'stock exchange' },
      { dutch: 'reus', english: 'giant' },
      { dutch: 'keus', english: 'choice' },
      { dutch: 'deuk', english: 'dent' },
      { dutch: 'neuk', english: 'knock' },
      { dutch: 'seun', english: 'son (regional)' },
    ],
  },
  {
    id: 'ij',
    label: 'ij',
    sound: '"ay" — like "my"',
    color: PALETTE[8],
    words: [
      { dutch: 'zijn', english: 'to be / his' },
      { dutch: 'wijn', english: 'wine' },
      { dutch: 'fijn', english: 'fine / nice' },
      { dutch: 'rijst', english: 'rice' },
      { dutch: 'mijn', english: 'my / mine' },
      { dutch: 'tijd', english: 'time' },
      { dutch: 'prijs', english: 'price / prize' },
      { dutch: 'gelijk', english: 'equal / right' },
      { dutch: 'rijk', english: 'rich / kingdom' },
      { dutch: 'blijf', english: 'stay' },
    ],
  },
  {
    id: 'ei',
    label: 'ei',
    sound: '"ay" — same as ij',
    color: PALETTE[9],
    words: [
      { dutch: 'ei', english: 'egg' },
      { dutch: 'reis', english: 'trip / journey' },
      { dutch: 'trein', english: 'train' },
      { dutch: 'klein', english: 'small / little' },
      { dutch: 'meid', english: 'girl' },
      { dutch: 'peil', english: 'level / gauge' },
      { dutch: 'veil', english: 'for sale' },
      { dutch: 'heil', english: 'salvation' },
      { dutch: 'feite', english: 'fact (in feite)' },
      { dutch: 'brein', english: 'brain' },
    ],
  },
  {
    id: 'au',
    label: 'au',
    sound: '"ow" — like "now"',
    color: PALETTE[10],
    words: [
      { dutch: 'blauw', english: 'blue' },
      { dutch: 'graauw', english: 'grey / dull' },
      { dutch: 'mauwen', english: 'to meow' },
      { dutch: 'pauze', english: 'pause / break' },
      { dutch: 'claus', english: 'Claus (name)' },
      { dutch: 'lauw', english: 'lukewarm' },
      { dutch: 'gauw', english: 'soon / quick' },
      { dutch: 'nauw', english: 'narrow / tight' },
      { dutch: 'rauwe', english: 'raw' },
      { dutch: 'flauw', english: 'weak / bland' },
    ],
  },
  {
    id: 'ou',
    label: 'ou',
    sound: '"ow" — same sound as au',
    color: PALETTE[11],
    words: [
      { dutch: 'oud', english: 'old' },
      { dutch: 'goud', english: 'gold' },
      { dutch: 'houd', english: 'hold / keep' },
      { dutch: 'woud', english: 'forest / jungle' },
      { dutch: 'jouw', english: 'your' },
      { dutch: 'vrouw', english: 'woman / wife' },
      { dutch: 'mouw', english: 'sleeve' },
      { dutch: 'rouw', english: 'grief / mourning' },
      { dutch: 'bouw', english: 'construction' },
      { dutch: 'vouw', english: 'fold' },
    ],
  },
  {
    id: 'aai',
    label: 'aai',
    sound: '"aai" — long "ah" + "ee"',
    color: PALETTE[12],
    words: [
      { dutch: 'kraai', english: 'crow' },
      { dutch: 'saai', english: 'boring / dull' },
      { dutch: 'taai', english: 'tough / chewy' },
      { dutch: 'haai', english: 'shark' },
      { dutch: 'draai', english: 'turn / rotation' },
      { dutch: 'vlaai', english: 'Limburg pie' },
      { dutch: 'raai', english: 'row / line' },
      { dutch: 'maai', english: 'mow (grass)' },
      { dutch: 'zaai', english: 'sow (seeds)' },
      { dutch: 'aai', english: 'stroke / caress' },
    ],
  },
  {
    id: 'ooi',
    label: 'ooi',
    sound: '"ooee" — long "oh" + "ee"',
    color: PALETTE[0],
    words: [
      { dutch: 'mooi', english: 'beautiful' },
      { dutch: 'nooit', english: 'never' },
      { dutch: 'gooit', english: 'throws' },
      { dutch: 'fooi', english: 'tip (money)' },
      { dutch: 'ooit', english: 'ever / once' },
      { dutch: 'rooien', english: 'to uproot' },
      { dutch: 'booien', english: 'handcuffs' },
      { dutch: 'looien', english: 'to tan (leather)' },
      { dutch: 'mooier', english: 'more beautiful' },
      { dutch: 'nooien', english: 'to invite (informal)' },
    ],
  },
  {
    id: 'eeu',
    label: 'eeu',
    sound: '"ay-oo" — long ee + w',
    color: PALETTE[1],
    words: [
      { dutch: 'leeuw', english: 'lion' },
      { dutch: 'sneeuw', english: 'snow' },
      { dutch: 'meeuw', english: 'seagull' },
      { dutch: 'eeuw', english: 'century' },
      { dutch: 'eeuwen', english: 'centuries' },
      { dutch: 'pauw', english: 'peacock' },
      { dutch: 'spreeuw', english: 'starling (bird)' },
      { dutch: 'leeuwrik', english: 'lark (bird)' },
      { dutch: 'ijsbeer', english: 'polar bear' },
      { dutch: 'kleeuw', english: 'claw (archaic)' },
    ],
  },
  {
    id: 'ieuw',
    label: 'ieuw',
    sound: '"ee-oo" — ee + w glide',
    color: PALETTE[2],
    words: [
      { dutch: 'nieuw', english: 'new' },
      { dutch: 'kieuw', english: 'gill (of a fish)' },
      { dutch: 'nieuwjaar', english: 'New Year' },
      { dutch: 'interview', english: 'interview' },
      { dutch: 'nieuwsgierig', english: 'curious' },
      { dutch: 'nieuwste', english: 'newest' },
      { dutch: 'rieuw', english: 'mew (cat sound)' },
      { dutch: 'mieuw', english: 'miaow' },
      { dutch: 'trieuw', english: 'true (archaic)' },
      { dutch: 'nieuwkomer', english: 'newcomer' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Render the Dutch word with the vowel combination highlighted. */
function HighlightedWord({
  word, vowel, baseStyle, highlightStyle,
}: {
  word: string; vowel: string; baseStyle: object; highlightStyle: object;
}) {
  const lower = word.toLowerCase();
  const lowerVowel = vowel.toLowerCase();
  const idx = lower.indexOf(lowerVowel);
  if (idx === -1) {
    return <Text style={baseStyle}>{word}</Text>;
  }
  return (
    <Text style={baseStyle}>
      {word.slice(0, idx)}
      <Text style={highlightStyle}>{word.slice(idx, idx + vowel.length)}</Text>
      {word.slice(idx + vowel.length)}
    </Text>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PracticePhase =
  | 'idle'
  | 'listening'
  | 'recording'
  | 'recorded'
  | 'comparing_tts'
  | 'comparing_audio';

type AppPhase = 'setup' | 'practice';

type PracticeItem = VowelWord & { vowel: string; categoryColor: string };

// ─── Waveform bar ─────────────────────────────────────────────────────────────

function WaveformBar({ index, level, active, color }: {
  index: number; level: number; active: boolean; color: string;
}) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (active) {
      const offset = 0.5 + ((index % 4) * 0.15);
      scale.value = withRepeat(
        withSequence(
          withTiming(1 + level * 2.5 * offset, { duration: 120 }),
          withTiming(1, { duration: 120 }),
        ),
        -1,
        true,
      );
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [active, level]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
    opacity: active ? 0.85 : 0.15,
  }));

  return (
    <Animated.View
      style={[{ width: 5, height: 22, borderRadius: 3, backgroundColor: color }, style]}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VowelPracticeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [appPhase, setAppPhase] = useState<AppPhase>('setup');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Practice state
  const [pool, setPool] = useState<PracticeItem[]>([]);
  const [poolIndex, setPoolIndex] = useState(0);
  const [phase, setPhase] = useState<PracticePhase>('idle');
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  // Button pulse animation
  const recordPulse = useSharedValue(1);
  const recordAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: recordPulse.value }],
  }));

  // ── Audio recorder ────────────────────────────────────────────────────────

  const recorder = useAudioRecorder(
    { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true },
    () => {},
  );
  const recorderState = useAudioRecorderState(recorder, 80);

  // ── Audio player ──────────────────────────────────────────────────────────
  //
  // Fully imperative: we create a fresh AudioPlayer per recording.
  // The useAudioPlayer hook (both with an auto-reloading source and with
  // null + replace()) failed to load the recorded .m4a on iOS — isLoaded
  // never flipped true. createAudioPlayer with keepAudioSessionActive
  // works reliably.
  const playerRef = useRef<AudioPlayer | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  const releasePlayer = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try { (p as any).__statusSub?.remove?.(); } catch { /* ignore */ }
    try { p.pause(); } catch { /* ignore */ }
    try { p.remove(); } catch { /* ignore */ }
    playerRef.current = null;
    setPlayerReady(false);
  }, []);

  // Start playback once the recording has loaded and we're in the
  // 'comparing_audio' phase.
  useEffect(() => {
    if (phase !== 'comparing_audio' || !playerReady) return;
    const p = playerRef.current;
    if (!p) return;
    (async () => {
      try {
        await setIsAudioActiveAsync(true).catch(() => {});
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
        p.volume = 1.0;
        p.muted = false;
        await p.seekTo(0);
        p.play();
      } catch (err) {
        console.warn('[VowelPractice] compare playback failed:', err);
        setPhase('recorded');
      }
    })();
  }, [phase, playerReady]);

  // Configure the iOS audio session once on mount: allow playback in silent
  // mode so the user can hear TTS / playback even with the ringer off.
  useEffect(() => {
    setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true })
      .catch(() => { /* ignore — best effort */ });
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      stopTTS();
      releasePlayer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const currentItem = pool[poolIndex] ?? null;

  const resetWord = useCallback(() => {
    stopTTS();
    releasePlayer();
    setPhase('idle');
    setRecordingUri(null);
  }, [releasePlayer]);

  const buildPool = useCallback((ids: Set<string>): PracticeItem[] => {
    const cats = ids.size === 0
      ? VOWEL_CATEGORIES
      : VOWEL_CATEGORIES.filter(c => ids.has(c.id));
    return shuffle(
      cats.flatMap(cat =>
        cat.words.map(w => ({
          ...w,
          vowel: cat.label,
          categoryColor: cat.color,
        })),
      ),
    );
  }, []);

  const startPractice = useCallback(() => {
    const p = buildPool(selectedIds);
    setPool(p);
    setPoolIndex(0);
    setPhase('idle');
    setRecordingUri(null);
    setAppPhase('practice');
  }, [selectedIds, buildPool]);

  const handleNext = useCallback(() => {
    stopTTS();
    const next = poolIndex + 1 < pool.length ? poolIndex + 1 : 0;
    setPoolIndex(next);
    resetWord();
  }, [poolIndex, pool.length, resetWord]);

  const handleBack = useCallback(() => {
    stopTTS();
    if (poolIndex > 0) {
      setPoolIndex(poolIndex - 1);
      resetWord();
    }
  }, [poolIndex, resetWord]);

  // ── Listen ────────────────────────────────────────────────────────────────

  const handleListen = useCallback(() => {
    if (!currentItem) return;
    if (phase === 'recording') return;

    stopTTS();
    try { playerRef.current?.pause(); } catch { /* ignore */ }

    setPhase('listening');
    speakWithCallback(currentItem.dutch, 0.82, {
      onDone: () => setPhase(recordingUri ? 'recorded' : 'idle'),
      onStopped: () => setPhase(recordingUri ? 'recorded' : 'idle'),
      onError: () => setPhase(recordingUri ? 'recorded' : 'idle'),
    });
  }, [currentItem, phase, recordingUri]);

  // ── Record ────────────────────────────────────────────────────────────────

  const handleRecord = useCallback(async () => {
    if (!currentItem) return;

    if (phase === 'recording') {
      recordPulse.value = withTiming(1);
      try {
        await recorder.stop();
        const uri = recorder.uri;

        // Switch the iOS audio session back from record mode to playback mode
        // and re-activate it before creating the player. The recorder
        // category leaves the session in a state where AVPlayer load can
        // silently fail.
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
        await setIsAudioActiveAsync(true).catch(() => {});

        if (uri) {
          // recorder.stop() resolves before the .m4a encoder has flushed
          // the file, so the reported path doesn't exist yet. Wait for it
          // to appear, then copy it into the document directory — loading
          // directly from the recorder's Caches/ExpoAudio path leaves the
          // AVPlayer stuck in isBuffering forever.
          const src = new File(uri);
          const waitStart = Date.now();
          while (!src.exists && Date.now() - waitStart < 2000) {
            await new Promise(r => setTimeout(r, 50));
          }

          let playUri = uri;
          if (src.exists) {
            try {
              const dest = new File(Paths.document, `vp-${Date.now()}.m4a`);
              if (dest.exists) dest.delete();
              src.copy(dest);
              playUri = dest.uri;
            } catch (e) {
              console.warn('[VowelPractice] copy failed, using original uri:', e);
            }
          }
          setRecordingUri(playUri);

          releasePlayer();
          try {
            const p = createAudioPlayer(
              { uri: playUri },
              { updateInterval: 200, keepAudioSessionActive: true },
            );
            playerRef.current = p;

            const sub = p.addListener('playbackStatusUpdate', (status: any) => {
              if (status?.isLoaded) setPlayerReady(true);
              if (status?.didJustFinish) setPhase('recorded');
            });
            (p as any).__statusSub = sub;
          } catch (e) {
            console.warn('[VowelPractice] createAudioPlayer failed:', e);
          }
          setPhase('recorded');
        } else {
          setPhase('idle');
        }
      } catch (err) {
        console.warn('[VowelPractice] recorder.stop failed:', err);
        setPhase('idle');
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
      }
      return;
    }

    // Start recording
    stopTTS();
    setRecordingUri(null);
    setPhase('idle');

    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Microphone access is required to record your voice.');
      return;
    }

    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await setIsAudioActiveAsync(true).catch(() => {});
      // prepareToRecordAsync MUST be awaited before record() — otherwise
      // recorder.record() is a no-op and the resulting file never gets
      // written.
      await recorder.prepareToRecordAsync();
      recorder.record();
      setPhase('recording');
      recordPulse.value = withRepeat(
        withSequence(withTiming(1.08, { duration: 450 }), withTiming(1, { duration: 450 })),
        -1,
        true,
      );
    } catch {
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
    }
  }, [currentItem, phase]);

  // ── Compare ───────────────────────────────────────────────────────────────

  const handleCompare = useCallback(() => {
    if (!currentItem || !recordingUri) return;

    if (phase === 'comparing_tts' || phase === 'comparing_audio') {
      // Second tap cancels playback
      stopTTS();
      try { playerRef.current?.pause(); } catch { /* ignore */ }
      setPhase('recorded');
      return;
    }

    setPhase('comparing_tts');
    speakWithCallback(currentItem.dutch, 0.82, {
      onDone: () => {
        // Brief gap between native and user audio. The effect watching
        // (phase, playerStatus.isLoaded) actually triggers play().
        setTimeout(() => setPhase('comparing_audio'), 350);
      },
      onStopped: () => setPhase('recorded'),
      onError: () => setPhase('recorded'),
    });
  }, [currentItem, recordingUri, phase]);

  // ─── Setup phase ─────────────────────────────────────────────────────────

  if (appPhase === 'setup') {
    const allSelected = selectedIds.size === 0;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={26} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Vowel Practice</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.setupScroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.setupTitle, { color: theme.text }]}>Choose Vowel Sounds</Text>
          <Text style={[styles.setupSub, { color: theme.textSecondary }]}>
            Listen, record yourself, and compare with native pronunciation
          </Text>

          {/* All chip */}
          <View style={styles.chipsWrap}>
            <Pressable
              style={[
                styles.chip,
                allSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                !allSelected && { borderColor: theme.border },
              ]}
              onPress={() => setSelectedIds(new Set())}
            >
              <Text style={[styles.chipText, { color: allSelected ? '#fff' : theme.text }]}>
                All
              </Text>
            </Pressable>

            {VOWEL_CATEGORIES.map(cat => {
              const active = selectedIds.has(cat.id);
              return (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.chip,
                    { borderColor: active ? cat.color : theme.border },
                    active && { backgroundColor: cat.color + '20' },
                  ]}
                  onPress={() => {
                    setSelectedIds(prev => {
                      const next = new Set(prev);
                      if (next.has(cat.id)) next.delete(cat.id);
                      else next.add(cat.id);
                      return next;
                    });
                  }}
                >
                  <Text
                    style={[styles.chipLabel, { color: active ? cat.color : theme.text }]}
                  >
                    {cat.label}
                  </Text>
                  <Text
                    style={[styles.chipSound, { color: active ? cat.color + 'cc' : theme.textSecondary }]}
                  >
                    {cat.sound.split('—')[0].trim()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.startBtn, { backgroundColor: theme.primary }]}
            onPress={startPractice}
          >
            <Ionicons name="mic" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.startBtnText}>Start Practice</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Practice phase ───────────────────────────────────────────────────────

  const ACCENT = currentItem?.categoryColor ?? theme.primary;

  const statusMessages: Record<PracticePhase, string> = {
    idle: 'Tap Listen to hear the word',
    listening: 'Playing native pronunciation…',
    recording: 'Recording your voice…',
    recorded: 'Ready to compare!',
    comparing_tts: 'Playing native…',
    comparing_audio: 'Playing your recording…',
  };

  const isComparing = phase === 'comparing_tts' || phase === 'comparing_audio';
  const hasRecording = !!recordingUri;
  const meteringLevel = Math.max(0, Math.min(1, ((recorderState.metering ?? -60) + 60) / 60));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable
          hitSlop={12}
          onPress={() => {
            stopTTS();
            setAppPhase('setup');
          }}
        >
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Vowel Practice</Text>
        <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
          {poolIndex + 1}/{pool.length}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.practiceScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Vowel badge ── */}
        <View style={[styles.vowelBadge, { backgroundColor: ACCENT + '18', borderColor: ACCENT + '40' }]}>
          <Text style={[styles.vowelBadgeText, { color: ACCENT }]}>
            {currentItem?.vowel}
          </Text>
          <Text style={[styles.vowelBadgeSound, { color: ACCENT + 'cc' }]}>
            {VOWEL_CATEGORIES.find(c => c.label === currentItem?.vowel)?.sound ?? ''}
          </Text>
        </View>

        {/* ── Word card ── */}
        <View style={[styles.wordCard, { backgroundColor: theme.cardBackground }]}>
          {currentItem && (
            <HighlightedWord
              word={currentItem.dutch}
              vowel={currentItem.vowel}
              baseStyle={[styles.wordText, { color: theme.text }]}
              highlightStyle={[styles.wordText, styles.vowelHighlight, { color: ACCENT }]}
            />
          )}
          <Text style={[styles.translationText, { color: theme.textSecondary }]}>
            {currentItem?.english}
          </Text>
        </View>

        {/* ── Waveform ── */}
        <View style={styles.waveform}>
          {Array.from({ length: 18 }, (_, i) => (
            <WaveformBar
              key={i}
              index={i}
              level={meteringLevel}
              active={phase === 'recording'}
              color={ACCENT}
            />
          ))}
        </View>

        {/* ── Status text ── */}
        <Text style={[styles.statusText, { color: theme.textSecondary }]}>
          {statusMessages[phase]}
        </Text>

        {/* ── Three action buttons ── */}
        <View style={styles.actionRow}>

          {/* Listen */}
          <Pressable
            onPress={handleListen}
            disabled={phase === 'recording' || isComparing}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: theme.cardBackground,
                borderColor: phase === 'listening' ? '#0ea5e9' : theme.border,
                opacity: (phase === 'recording' || isComparing) ? 0.4 : pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons
              name={phase === 'listening' ? 'volume-high' : 'volume-medium-outline'}
              size={28}
              color={phase === 'listening' ? '#0ea5e9' : theme.text}
            />
            <Text style={[styles.actionLabel, {
              color: phase === 'listening' ? '#0ea5e9' : theme.text,
            }]}>
              Listen
            </Text>
          </Pressable>

          {/* Record — big centre button */}
          <Animated.View style={recordAnimStyle}>
            <Pressable
              onPress={handleRecord}
              disabled={phase === 'listening' || isComparing}
              style={[
                styles.recordButton,
                {
                  backgroundColor: phase === 'recording' ? '#ef4444' : ACCENT,
                  shadowColor: phase === 'recording' ? '#ef4444' : ACCENT,
                  opacity: (phase === 'listening' || isComparing) ? 0.4 : 1,
                },
              ]}
            >
              <Ionicons
                name={phase === 'recording' ? 'stop' : 'mic'}
                size={36}
                color="#fff"
              />
            </Pressable>
          </Animated.View>

          {/* Compare */}
          <Pressable
            onPress={handleCompare}
            disabled={!hasRecording && !isComparing}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: theme.cardBackground,
                borderColor: isComparing ? '#10b981' : hasRecording ? '#10b981' : theme.border,
                opacity: (!hasRecording && !isComparing) ? 0.35 : pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons
              name={isComparing ? 'stop-circle-outline' : 'play-circle-outline'}
              size={28}
              color={isComparing ? '#10b981' : hasRecording ? '#10b981' : theme.textSecondary}
            />
            <Text style={[styles.actionLabel, {
              color: isComparing ? '#10b981' : hasRecording ? '#10b981' : theme.textSecondary,
            }]}>
              Compare
            </Text>
          </Pressable>
        </View>

        {/* ── Compare legend ── */}
        {(hasRecording || isComparing) && (
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {
                backgroundColor: '#0ea5e9',
                opacity: phase === 'comparing_tts' ? 1 : 0.35,
              }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>Native</Text>
            </View>
            <View style={[styles.legendArrow, { backgroundColor: theme.border }]} />
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {
                backgroundColor: ACCENT,
                opacity: phase === 'comparing_audio' ? 1 : 0.35,
              }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>You</Text>
            </View>
          </View>
        )}

        {/* ── Navigation ── */}
        <View style={styles.navRow}>
          <Pressable
            onPress={handleBack}
            disabled={poolIndex <= 0}
            style={({ pressed }) => ({
              opacity: poolIndex <= 0 ? 0.25 : pressed ? 0.6 : 1,
            })}
          >
            <Ionicons name="chevron-back-circle-outline" size={52} color={theme.text} />
          </Pressable>

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Ionicons name="chevron-forward-circle-outline" size={52} color={theme.text} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.bold },
  progressLabel: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium, minWidth: 40, textAlign: 'right' },

  // ── Setup ──
  setupScroll: { padding: Spacing.lg, paddingBottom: 60 },
  setupTitle: { fontSize: FontSize.title2, fontWeight: FontWeight.bold, textAlign: 'center', marginBottom: 6 },
  setupSub: { fontSize: FontSize.footnote, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xl },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  chip: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: 80,
  },
  chipLabel: { fontSize: FontSize.subhead, fontWeight: FontWeight.bold, textAlign: 'center' },
  chipSound: { fontSize: 10, textAlign: 'center', marginTop: 2 },
  chipText: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium, textAlign: 'center' },

  startBtn: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  startBtnText: { color: '#fff', fontSize: FontSize.subhead, fontWeight: FontWeight.bold },

  // ── Practice ──
  practiceScroll: {
    padding: Spacing.lg,
    paddingBottom: 40,
    alignItems: 'center',
    gap: Spacing.xl,
  },

  vowelBadge: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  vowelBadgeText: { fontSize: 28, fontWeight: FontWeight.heavy, letterSpacing: 2 },
  vowelBadgeSound: { fontSize: FontSize.caption, marginTop: 2 },

  wordCard: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: 6,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  wordText: { fontSize: 54, fontWeight: FontWeight.heavy, textAlign: 'center', letterSpacing: -1 },
  vowelHighlight: { textDecorationLine: 'underline' },
  translationText: { fontSize: FontSize.title3, fontWeight: FontWeight.medium, textAlign: 'center' },

  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 50,
    width: '100%',
  },

  statusText: { fontSize: FontSize.footnote, textAlign: 'center' },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    width: '100%',
  },
  actionButton: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionLabel: { fontSize: 11, fontWeight: FontWeight.semibold },

  recordButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },

  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.caption },
  legendArrow: { flex: 1, height: 1, maxWidth: 32 },

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.xxl,
    marginTop: Spacing.sm,
  },
});
