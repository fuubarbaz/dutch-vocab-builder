import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Volume2, ChevronDown, ChevronUp } from 'lucide-react-native';

import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { speak } from '@/utils/tts';
import { useSettings } from '@/context/SettingsContext';
import { PRONUNCIATION_CATEGORIES, PronunciationRule, PronunciationExample } from '@/data/pronunciationRules';

// ─── Example Row ─────────────────────────────────────────────────────────────

function ExampleRow({
  example,
  color,
  speechRate,
}: {
  example: PronunciationExample;
  color: string;
  speechRate: number;
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [playing, setPlaying] = useState(false);

  const handlePlay = useCallback(async () => {
    if (playing) return;
    setPlaying(true);
    await speak(example.dutch, speechRate);
    setPlaying(false);
  }, [example.dutch, speechRate, playing]);

  return (
    <View style={[styles.exampleRow, { borderTopColor: theme.divider }]}>
      <View style={styles.exampleLeft}>
        <Text style={[styles.exampleDutch, { color: theme.text }]}>{example.dutch}</Text>
        <Text style={[styles.examplePhonetic, { color: theme.textSecondary }]}>/{example.phonetic}/</Text>
        <Text style={[styles.exampleMeaning, { color: theme.textSecondary }]}>{example.meaning}</Text>
      </View>
      <TouchableOpacity
        onPress={handlePlay}
        hitSlop={10}
        style={[
          styles.speakButton,
          { backgroundColor: playing ? color : color + '18' },
        ]}
      >
        <Volume2 size={16} color={playing ? '#fff' : color} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Rule Card ────────────────────────────────────────────────────────────────

function RuleCard({
  rule,
  speechRate,
}: {
  rule: PronunciationRule;
  speechRate: number;
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [expanded, setExpanded] = useState(false);
  const [playingBadge, setPlayingBadge] = useState(false);

  // Speak the sound badge itself (first example word)
  const handleBadgePlay = useCallback(async () => {
    if (playingBadge || rule.examples.length === 0) return;
    setPlayingBadge(true);
    await speak(rule.examples[0].dutch, speechRate);
    setPlayingBadge(false);
  }, [rule.examples, speechRate, playingBadge]);

  return (
    <View
      style={[
        styles.ruleCard,
        { backgroundColor: theme.cardBackground, borderLeftColor: rule.color },
      ]}
    >
      {/* Card header — always visible */}
      <Pressable
        style={styles.ruleHeader}
        onPress={() => setExpanded(e => !e)}
        android_ripple={{ color: rule.color + '15' }}
      >
        {/* Sound badge + play */}
        <View style={styles.ruleHeaderLeft}>
          <TouchableOpacity
            onPress={handleBadgePlay}
            activeOpacity={0.75}
            style={[
              styles.soundBadge,
              { backgroundColor: playingBadge ? rule.color : rule.color + '18' },
            ]}
          >
            <Text
              style={[
                styles.soundBadgeText,
                { color: playingBadge ? '#fff' : rule.color },
              ]}
            >
              {rule.sound}
            </Text>
            <Volume2
              size={10}
              color={playingBadge ? '#fff' : rule.color}
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>

          <View style={styles.ruleTitleBlock}>
            <Text style={[styles.ruleTitle, { color: theme.text }]}>{rule.title}</Text>
            <Text
              style={[styles.ruleDescription, { color: theme.textSecondary }]}
              numberOfLines={expanded ? undefined : 2}
            >
              {rule.description}
            </Text>
          </View>
        </View>

        {/* Chevron */}
        {expanded ? (
          <ChevronUp size={18} color={theme.textSecondary} />
        ) : (
          <ChevronDown size={18} color={theme.textSecondary} />
        )}
      </Pressable>

      {/* Expanded content */}
      {expanded && (
        <>
          {/* Tip */}
          <View style={[styles.tipBox, { backgroundColor: rule.color + '12' }]}>
            <Text style={[styles.tipLabel, { color: rule.color }]}>💡 TIP</Text>
            <Text style={[styles.tipText, { color: theme.text }]}>{rule.tip}</Text>
          </View>

          {/* Examples */}
          <View style={styles.examplesBlock}>
            <Text style={[styles.examplesLabel, { color: theme.textSecondary }]}>
              EXAMPLES — tap <Volume2 size={11} color={theme.textSecondary} /> to hear
            </Text>
            {rule.examples.map((ex, i) => (
              <ExampleRow
                key={i}
                example={ex}
                color={rule.color}
                speechRate={speechRate}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PronunciationGuideScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { speechRate } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={26} color={theme.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Pronunciation Guide</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Tap any card to expand · <Volume2 size={11} color={theme.textSecondary} /> to hear
          </Text>
        </View>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Intro banner */}
        <View style={[styles.introBanner, { backgroundColor: theme.primary + '12', borderColor: theme.primary + '30' }]}>
          <Text style={[styles.introText, { color: theme.text }]}>
            Dutch pronunciation is very regular — once you learn these patterns, you can read almost any Dutch word correctly.{' '}
            <Text style={{ fontWeight: FontWeight.semibold, color: theme.primary }}>
              Tap the sound badge
            </Text>{' '}
            on any card to hear a live example immediately.
          </Text>
        </View>

        {/* Rule categories */}
        {PRONUNCIATION_CATEGORIES.map(category => (
          <View key={category.id}>
            <Text style={[styles.categoryLabel, { color: theme.textSecondary }]}>
              {category.label}
            </Text>
            {category.rules.map(rule => (
              <RuleCard key={rule.id} rule={rule} speechRate={speechRate} />
            ))}
          </View>
        ))}

        {/* Footer tip */}
        <View style={[styles.footerCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.footerTitle, { color: theme.text }]}>🎧 Practice tip</Text>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            The best way to lock in these sounds is to shadow a native speaker. After tapping to hear a word, say it out loud immediately — don't wait. Repeat until your mouth finds the shape automatically.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
  headerSubtitle: {
    fontSize: FontSize.caption,
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },

  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },

  // Intro
  introBanner: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  introText: {
    fontSize: FontSize.subhead,
    lineHeight: 22,
  },

  // Category
  categoryLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.6,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },

  // Rule card
  ruleCard: {
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  ruleHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },

  // Sound badge
  soundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    minWidth: 48,
    justifyContent: 'center',
    marginTop: 1,
  },
  soundBadgeText: {
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.heavy,
    letterSpacing: 0.5,
  },

  ruleTitleBlock: { flex: 1 },
  ruleTitle: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
    marginBottom: 3,
  },
  ruleDescription: {
    fontSize: FontSize.footnote,
    lineHeight: 18,
  },

  // Tip
  tipBox: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  tipLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  tipText: {
    fontSize: FontSize.footnote,
    lineHeight: 18,
  },

  // Examples
  examplesBlock: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  examplesLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.4,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  exampleLeft: { flex: 1 },
  exampleDutch: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
    marginBottom: 1,
  },
  examplePhonetic: {
    fontSize: FontSize.caption,
    fontStyle: 'italic',
    marginBottom: 1,
  },
  exampleMeaning: {
    fontSize: FontSize.caption,
  },
  speakButton: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },

  // Footer
  footerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  footerTitle: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  footerText: {
    fontSize: FontSize.footnote,
    lineHeight: 20,
  },
});
