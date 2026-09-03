import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import {
  Volume2, ChevronDown, ChevronUp, Lightbulb,
  Hourglass, MessageCircle, Image, ThumbsUp, Scale, BookMarked, LifeBuoy, Blocks,
  HelpCircle,
} from 'lucide-react-native';
import { speak as ttsSpeak, stopTTS } from '@/utils/tts';
import { SPEAKING_CHEATSHEET, CheatPhrase } from '@/data/speaking_exam';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

/** Section icons, resolved from the `icon` name in the cheat sheet data. */
const SECTION_ICONS: Record<string, React.ComponentType<any>> = {
  Hourglass, MessageCircle, Image, ThumbsUp, Scale, BookMarked, LifeBuoy, Blocks,
};

function PhraseRow({
  phrase,
  theme,
}: {
  phrase: CheatPhrase;
  theme: typeof Colors.light;
}) {
  return (
    <View style={[styles.phraseRow, { borderTopColor: theme.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.dutch, { color: theme.text }]}>{phrase.dutch}</Text>
        <Text style={[styles.english, { color: theme.textSecondary }]}>{phrase.english}</Text>
        {phrase.hint ? (
          <View style={styles.hintRow}>
            <Lightbulb size={12} color={theme.primary} />
            <Text style={[styles.hint, { color: theme.textSecondary }]}>{phrase.hint}</Text>
          </View>
        ) : null}
      </View>
      <Pressable
        onPress={() => { stopTTS(); ttsSpeak(phrase.dutch, 0.85); }}
        hitSlop={8}
        style={styles.speakBtn}
      >
        <Volume2 size={18} color={theme.primary} />
      </Pressable>
    </View>
  );
}

export default function SpeakingCheatsheetScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];
  // Open the first section so the screen never looks empty on arrival.
  const [open, setOpen] = useState<Record<string, boolean>>({
    [SPEAKING_CHEATSHEET[0].id]: true,
  });

  useEffect(() => () => { stopTTS(); }, []);

  const toggle = (id: string) => setOpen(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Spiekbriefje' }} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          Zinnen die bijna altijd passen in het examen Spreken A2. Leer er een paar uit je
          hoofd — dan hoef je tijdens het examen niet te bedenken hóe je iets zegt, alleen
          wát je wilt zeggen.
        </Text>

        {SPEAKING_CHEATSHEET.map(section => {
          const isOpen = open[section.id] ?? false;
          return (
            <View
              key={section.id}
              style={[styles.section, { backgroundColor: theme.cardBackground }]}
            >
              <Pressable style={styles.sectionHeader} onPress={() => toggle(section.id)}>
                {(() => {
                  const SectionIcon = SECTION_ICONS[section.icon] ?? HelpCircle;
                  return <SectionIcon size={22} color={theme.primary} />;
                })()}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
                  <Text style={[styles.sectionMeta, { color: theme.textSecondary }]}>
                    {section.titleEnglish} · {section.usedIn}
                  </Text>
                </View>
                <Text style={[styles.count, { color: theme.textSecondary }]}>
                  {section.phrases.length}
                </Text>
                {isOpen
                  ? <ChevronUp size={18} color={theme.textSecondary} />
                  : <ChevronDown size={18} color={theme.textSecondary} />}
              </Pressable>

              {isOpen && (
                <View>
                  {section.phrases.map((phrase, i) => (
                    <PhraseRow key={i} phrase={phrase} theme={theme} />
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.md },

  intro: { fontSize: FontSize.footnote, lineHeight: 19 },

  section: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  sectionMeta: { fontSize: FontSize.caption, marginTop: 1 },
  count: { fontSize: FontSize.caption, fontWeight: FontWeight.semibold },

  phraseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dutch: { fontSize: FontSize.subhead, fontWeight: FontWeight.medium, lineHeight: 21 },
  english: { fontSize: FontSize.footnote, marginTop: 1, lineHeight: 18 },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginTop: 4 },
  hint: { flex: 1, fontSize: FontSize.caption, fontStyle: 'italic', lineHeight: 16 },
  speakBtn: { padding: 2 },
});
