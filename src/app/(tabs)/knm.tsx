import React, { useState } from 'react';
import {
  StyleSheet, View, Text, Pressable, ScrollView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, BookOpen, Globe } from 'lucide-react-native';

import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { KNM_TOPICS, KNMLanguage } from '@/data/knm_topics';

export default function KNMScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [language, setLanguage] = useState<KNMLanguage>('en');

  const t = language === 'en'
    ? {
        title: 'KNM Exam Prep',
        subtitle: 'Kennis van de Nederlandse Maatschappij',
        description: 'Master all 11 topics for the civic integration exam.',
        topics: 'TOPICS',
        langToggle: 'NL',
      }
    : {
        title: 'KNM Examenvoorbereiding',
        subtitle: 'Kennis van de Nederlandse Maatschappij',
        description: 'Beheers alle 11 onderwerpen voor het inburgeringsexamen.',
        topics: 'ONDERWERPEN',
        langToggle: 'EN',
      };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <View style={[styles.banner, { backgroundColor: '#1d4ed8' }]}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerEmoji}>🇳🇱</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{t.title}</Text>
            <Text style={styles.bannerSubtitle}>{t.subtitle}</Text>
            <Text style={styles.bannerDescription}>{t.description}</Text>
          </View>
        </View>

        {/* Language toggle */}
        <Pressable
          style={styles.langToggle}
          onPress={() => setLanguage(language === 'en' ? 'nl' : 'en')}
        >
          <Globe size={14} color="white" />
          <Text style={styles.langToggleText}>
            {language === 'en' ? 'Switch to NL' : 'Switch to EN'}
          </Text>
        </Pressable>
      </View>

      {/* Stats bar */}
      <View style={[styles.statsBar, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#1d4ed8' }]}>{KNM_TOPICS.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {language === 'en' ? 'Topics' : 'Onderwerpen'}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#1d4ed8' }]}>
            {KNM_TOPICS.reduce((acc, t) => acc + t.quizQuestions.length, 0)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {language === 'en' ? 'Questions' : 'Vragen'}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#1d4ed8' }]}>AI</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {language === 'en' ? 'Powered' : 'Aangedreven'}
          </Text>
        </View>
      </View>

      {/* Topics list */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{t.topics}</Text>
      <View style={[styles.listCard, { backgroundColor: theme.cardBackground }]}>
        {KNM_TOPICS.map((topic, index) => {
          const isLast = index === KNM_TOPICS.length - 1;
          return (
            <Pressable
              key={topic.id}
              style={[
                styles.topicRow,
                !isLast && { borderBottomColor: theme.divider, borderBottomWidth: StyleSheet.hairlineWidth },
              ]}
              onPress={() =>
                router.push({
                  pathname: '/knm-topic/[id]',
                  params: { id: topic.id, lang: language },
                } as any)
              }
            >
              <View style={[styles.topicEmoji, { backgroundColor: topic.color + '18' }]}>
                <Text style={styles.emojiText}>{topic.emoji}</Text>
              </View>
              <View style={styles.topicContent}>
                <Text style={[styles.topicTitle, { color: theme.text }]}>
                  {topic.title[language]}
                </Text>
                <Text style={[styles.topicSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                  {topic.description[language]}
                </Text>
              </View>
              <View style={styles.topicMeta}>
                <Text style={[styles.topicCount, { color: topic.color }]}>
                  {topic.quizQuestions.length}Q
                </Text>
                <ChevronRight size={16} color={theme.textSecondary} />
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Tips card */}
      <View style={[styles.tipsCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
        <View style={styles.tipsHeader}>
          <BookOpen size={16} color="#1d4ed8" />
          <Text style={[styles.tipsTitle, { color: '#1d4ed8' }]}>
            {language === 'en' ? 'Exam Tips' : 'Examentips'}
          </Text>
        </View>
        {(language === 'en'
          ? [
              'Read each lesson carefully before attempting the quiz.',
              'Culture & Norms (Topic 10) is heavily tested — memorise the examples.',
              'Use AI-generated questions for extra practice.',
              'Switch to Dutch mode to practise reading in the language of the exam.',
            ]
          : [
              'Lees elke les zorgvuldig door voordat je de quiz probeert.',
              'Cultuur en normen (Onderwerp 10) wordt zwaar getoetst — onthoud de voorbeelden.',
              'Gebruik AI-gegenereerde vragen voor extra oefening.',
              'Schakel over naar de Nederlandse modus om te oefenen met lezen in de examentaal.',
            ]
        ).map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={[styles.tipBullet, { color: '#1d4ed8' }]}>•</Text>
            <Text style={[styles.tipText, { color: '#1e3a8a' }]}>{tip}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  banner: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  bannerEmoji: { fontSize: 36 },
  bannerTitle: { fontSize: FontSize.title3, fontWeight: FontWeight.bold, color: 'white', marginBottom: 2 },
  bannerSubtitle: { fontSize: FontSize.caption, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  bannerDescription: { fontSize: FontSize.footnote, color: 'rgba(255,255,255,0.9)', lineHeight: 18 },

  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  langToggleText: { fontSize: FontSize.caption, fontWeight: FontWeight.semibold, color: 'white' },

  statsBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: FontSize.title3, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.caption, marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, marginVertical: 4 },

  sectionLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },

  listCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  topicEmoji: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  emojiText: { fontSize: 20 },
  topicContent: { flex: 1, marginRight: Spacing.sm },
  topicTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, marginBottom: 2 },
  topicSubtitle: { fontSize: FontSize.caption },
  topicMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topicCount: { fontSize: FontSize.caption, fontWeight: FontWeight.bold },

  tipsCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  tipsTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.bold },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipBullet: { fontSize: 14, fontWeight: 'bold', marginTop: 1 },
  tipText: { flex: 1, fontSize: FontSize.footnote, lineHeight: 20 },
});
