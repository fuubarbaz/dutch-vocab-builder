import React, { useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CheckCircle2, Trash2, Volume2 } from 'lucide-react-native';

import Colors, { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useMistakeJournal, MistakeEntry, MistakeSource } from '@/context/MistakeJournalContext';
import { speak as ttsspeak } from '@/utils/tts';

type Filter = 'unresolved' | 'all';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const SOURCE_LABELS: Record<MistakeSource, string> = {
  quiz: 'Quiz',
  'vocab-session': 'Vocab practice',
  roleplay: 'Roleplay',
};

export default function MistakeJournalScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { mistakes, markResolved, remove, clearAll } = useMistakeJournal();

  const [filter, setFilter] = useState<Filter>('unresolved');

  const sorted = useMemo(() => {
    const list = filter === 'unresolved' ? mistakes.filter(m => !m.resolved) : mistakes;
    return [...list].sort((a, b) => {
      // Most-wrong first, then most-recent
      if (b.wrongCount !== a.wrongCount) return b.wrongCount - a.wrongCount;
      return b.lastWrongAt.localeCompare(a.lastWrongAt);
    });
  }, [mistakes, filter]);

  const handleClearAll = () => {
    if (mistakes.length === 0) return;
    Alert.alert(
      'Clear journal?',
      'This will delete all logged mistakes. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearAll() },
      ],
    );
  };

  const speak = (entry: MistakeEntry) =>
    ttsspeak(entry.source === 'roleplay' ? entry.english : entry.dutch, 0.85);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Mistake Journal</Text>
        <Pressable onPress={handleClearAll} hitSlop={8} disabled={mistakes.length === 0}>
          <Text style={[styles.clearBtn, { color: mistakes.length === 0 ? theme.textSecondary : '#dc3545' }]}>
            Clear
          </Text>
        </Pressable>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['unresolved', 'all'] as Filter[]).map(f => {
          const active = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                { borderColor: active ? theme.primary : theme.border },
                active && { backgroundColor: theme.primary + '18' },
              ]}
            >
              <Text style={[styles.filterText, { color: active ? theme.primary : theme.text }]}>
                {f === 'unresolved' ? 'To review' : 'All'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {sorted.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {mistakes.length === 0 ? '🎉 No mistakes yet' : 'All caught up!'}
          </Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
            {mistakes.length === 0
              ? 'Words you get wrong in quiz or vocab practice will appear here.'
              : 'Switch to "All" to see resolved mistakes.'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {sorted.map(m => (
            <View
              key={m.wordId}
              style={[
                styles.card,
                { backgroundColor: theme.cardBackground, opacity: m.resolved ? 0.55 : 1 },
              ]}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.dutchRow}>
                    <Text
                      style={[
                        m.source === 'roleplay' ? styles.sentence : styles.dutch,
                        { color: theme.text },
                      ]}
                    >
                      {m.dutch}
                    </Text>
                    <Pressable onPress={() => speak(m)} hitSlop={8} style={styles.iconBtn}>
                      <Volume2 size={18} color={theme.primary} />
                    </Pressable>
                  </View>
                  <Text style={[styles.english, { color: theme.textSecondary }]}>{m.english}</Text>
                  {m.note ? (
                    <Text style={[styles.note, { color: theme.textSecondary }]}>{m.note}</Text>
                  ) : null}
                </View>
                <View style={[styles.countBadge, { backgroundColor: '#dc354520' }]}>
                  <Text style={[styles.countText, { color: '#dc3545' }]}>
                    ×{m.wrongCount}
                  </Text>
                </View>
              </View>

              <View style={styles.cardMeta}>
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {SOURCE_LABELS[m.source] ?? 'Practice'} · {timeAgo(m.lastWrongAt)}
                </Text>
                <View style={styles.actions}>
                  {!m.resolved && (
                    <Pressable onPress={() => markResolved(m.wordId)} hitSlop={6} style={styles.iconBtn}>
                      <CheckCircle2 size={20} color={theme.success} />
                    </Pressable>
                  )}
                  <Pressable onPress={() => remove(m.wordId)} hitSlop={6} style={styles.iconBtn}>
                    <Trash2 size={18} color={theme.textSecondary} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  clearBtn: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  filterChip: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  filterText: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 60 },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  dutchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dutch: { fontSize: 22, fontWeight: 'bold' },
  sentence: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, lineHeight: 21 },
  english: { fontSize: FontSize.subhead, marginTop: 2 },
  note: { fontSize: FontSize.caption, marginTop: 4, fontStyle: 'italic', lineHeight: 16 },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  countText: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  metaText: { fontSize: FontSize.caption },
  actions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  iconBtn: { padding: 4 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: FontSize.title3, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  emptySub: { fontSize: FontSize.subhead, textAlign: 'center', lineHeight: 22 },
});
