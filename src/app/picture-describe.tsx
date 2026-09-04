import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  Camera, ImagePlus, Volume2, Eye, EyeOff, ScanSearch,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { speak as ttsSpeak, stopTTS } from '@/utils/tts';
import { useAI, AIErrorBanner } from '@/context/AIContext';
import { ImageDescription, parseImageDescription } from '@/utils/imageDescription';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type Level = 'A1' | 'A2' | 'B1';
const LEVELS: Level[] = ['A1', 'A2', 'B1'];

/** The vision encoder takes a small fixed input; a full camera frame is wasted work. */
const MAX_IMAGE_EDGE = 768;

export default function PictureDescribeScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];
  const { engineState, visionAvailable, describeImage } = useAI();

  const [level, setLevel] = useState<Level>('A2');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState<ImageDescription | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [showEnglish, setShowEnglish] = useState(true);

  useEffect(() => () => { stopTTS(); }, []);

  const describe = useCallback(async (fromCamera: boolean) => {
    stopTTS();
    setPermissionError(null);

    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setPermissionError(fromCamera
        ? 'Geen toegang tot de camera. Sta dit toe in Instellingen.'
        : 'Geen toegang tot uw foto\'s. Sta dit toe in Instellingen.');
      return;
    }

    const picked = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.9 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });
    if (picked.canceled || !picked.assets?.[0]) return;

    setDescription(null);
    setFailed(false);
    setIsBusy(true);

    try {
      const shrunk = await manipulateAsync(
        picked.assets[0].uri,
        [{ resize: { width: MAX_IMAGE_EDGE } }],
        { compress: 0.85, format: SaveFormat.JPEG },
      );
      setImageUri(shrunk.uri);

      // LiteRT-LM opens the path directly, so the file:// scheme has to go.
      const raw = await describeImage(shrunk.uri.replace(/^file:\/\//, ''), level);
      const parsed = parseImageDescription(raw);
      if (parsed) setDescription(parsed);
      else setFailed(true);
    } catch {
      // Classified and toasted by AIContext.
      setFailed(true);
    } finally {
      setIsBusy(false);
    }
  }, [describeImage, level]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Wat zie ik?' }} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {engineState === 'error' && <AIErrorBanner />}

        {visionAvailable === false && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.cardTitle, { color: theme.danger }]}>Foto's werken hier niet</Text>
            <Text style={[styles.note, { color: theme.textSecondary }]}>
              Het model is op dit apparaat zonder beeldherkenning geladen.
            </Text>
          </View>
        )}

        <View style={styles.introRow}>
          <ScanSearch size={22} color={theme.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.introTitle, { color: theme.text }]}>Wat zie ik?</Text>
            <Text style={[styles.note, { color: theme.textSecondary }]}>
              Richt uw camera op iets en krijg de beschrijving in het Nederlands, met de
              vertaling en de woorden erbij.
            </Text>
          </View>
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>NIVEAU</Text>
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

        {imageUri && <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="cover" />}

        {permissionError && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.note, { color: theme.textSecondary }]}>{permissionError}</Text>
          </View>
        )}

        {isBusy && (
          <View style={[styles.card, styles.centerCard, { backgroundColor: theme.cardBackground }]}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.note, { color: theme.textSecondary }]}>De foto wordt bekeken…</Text>
          </View>
        )}

        {failed && !isBusy && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Geen beschrijving</Text>
            <Text style={[styles.note, { color: theme.textSecondary }]}>
              Er kwam geen bruikbare beschrijving terug. Probeer een foto met wat meer licht
              of wat duidelijker in beeld.
            </Text>
          </View>
        )}

        {description && !isBusy && (
          <>
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.rowBetween}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>NEDERLANDS</Text>
                <TouchableOpacity
                  onPress={() => { stopTTS(); ttsSpeak(description.dutch, 0.85); }}
                  hitSlop={8}
                >
                  <Volume2 size={20} color={theme.primary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.dutchText, { color: theme.text }]}>{description.dutch}</Text>

              {description.english ? (
                <>
                  <TouchableOpacity
                    onPress={() => setShowEnglish(v => !v)}
                    hitSlop={8}
                    style={styles.translateToggle}
                  >
                    {showEnglish
                      ? <EyeOff size={14} color={theme.textSecondary} />
                      : <Eye size={14} color={theme.textSecondary} />}
                    <Text style={[styles.note, { color: theme.textSecondary }]}>
                      {showEnglish ? 'Verberg Engels' : 'Toon Engels'}
                    </Text>
                  </TouchableOpacity>
                  {showEnglish && (
                    <Text style={[styles.englishText, { color: theme.textSecondary }]}>
                      {description.english}
                    </Text>
                  )}
                </>
              ) : null}
            </View>

            {description.words.length > 0 && (
              <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>WOORDEN</Text>
                {description.words.map((w, i) => (
                  <View key={i} style={[styles.wordRow, { borderTopColor: theme.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.wordDutch, { color: theme.text }]}>{w.dutch}</Text>
                      {w.english ? (
                        <Text style={[styles.note, { color: theme.textSecondary }]}>{w.english}</Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => { stopTTS(); ttsSpeak(w.dutch, 0.85); }}
                      hitSlop={8}
                    >
                      <Volume2 size={18} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.bar, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => describe(true)}
          disabled={isBusy}
          style={[styles.mainBtn, { backgroundColor: isBusy ? theme.surfaceSecondary : theme.primary }]}
        >
          <Camera size={20} color="#fff" />
          <Text style={styles.mainBtnText}>
            {description ? 'Nieuwe foto' : 'Foto maken'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => describe(false)}
          disabled={isBusy}
          style={[styles.secondaryBtn, { borderColor: theme.border }]}
        >
          <ImagePlus size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.md },

  introRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  introTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  label: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  note: { fontSize: FontSize.footnote, lineHeight: 18 },

  levelRow: { flexDirection: 'row', gap: Spacing.sm },
  levelChip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  levelChipText: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },

  photo: { width: '100%', height: 220, borderRadius: BorderRadius.lg },

  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.sm },
  centerCard: { alignItems: 'center' },
  cardTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  dutchText: { fontSize: FontSize.body, lineHeight: 25 },
  englishText: { fontSize: FontSize.subhead, lineHeight: 22, fontStyle: 'italic' },
  translateToggle: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: Spacing.xs },

  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
  },
  wordDutch: { fontSize: FontSize.subhead, fontWeight: FontWeight.medium },

  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  mainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  mainBtnText: { color: '#fff', fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  secondaryBtn: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
});
