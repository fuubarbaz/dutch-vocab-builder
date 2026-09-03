import React from 'react';
import {
  StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity,
  Platform, Alert, Modal, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useFavorites } from '@/context/FavoritesContext';
import { useSettings } from '@/context/SettingsContext';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { speak } from '@/utils/tts';
import { Word, CustomWord } from '@/types';
import {
  Search, X, Volume2, Heart, CheckCircle2, Pencil, Trash2, ChevronDown,
} from 'lucide-react-native';

type FilterType = 'all' | 'custom' | 'learned' | 'saved';

interface EnrichedWord {
  word: Word & { categoryId?: string };
  categoryTitle: string;
  isCustom: boolean;
}

function EditModal({
  word,
  visible,
  onClose,
  onSave,
  categories,
  theme,
}: {
  word: CustomWord | null;
  visible: boolean;
  onClose: () => void;
  onSave: (updated: CustomWord) => void;
  categories: { id: string; title: string }[];
  theme: typeof Colors['light'];
}) {
  const [dutch, setDutch] = React.useState('');
  const [english, setEnglish] = React.useState('');
  const [exampleDutch, setExampleDutch] = React.useState('');
  const [exampleEnglish, setExampleEnglish] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [pickerOpen, setPickerOpen] = React.useState(false);

  React.useEffect(() => {
    if (word) {
      setDutch(word.dutch);
      setEnglish(word.english);
      setExampleDutch(word.exampleDutch ?? '');
      setExampleEnglish(word.exampleEnglish ?? '');
      setCategoryId(word.categoryId);
    }
  }, [word]);

  const handleSave = () => {
    if (!dutch.trim() || !english.trim() || !word) return;
    onSave({ ...word, dutch: dutch.trim(), english: english.trim(), exampleDutch, exampleEnglish, categoryId });
  };

  const inputStyle = [styles.modalInput, { color: theme.text, backgroundColor: theme.surfaceSecondary, borderColor: theme.border }];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Word</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category picker */}
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Category</Text>
            <View style={{ zIndex: 10, marginBottom: Spacing.md }}>
              <TouchableOpacity
                style={[styles.modalInput, styles.pickerButton, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                onPress={() => setPickerOpen(v => !v)}
              >
                <Text style={{ color: theme.text, fontSize: FontSize.subhead }}>
                  {categories.find(c => c.id === categoryId)?.title ?? 'Select'}
                </Text>
                <ChevronDown size={16} color={theme.textSecondary} />
              </TouchableOpacity>
              {pickerOpen && (
                <View style={[styles.pickerDropdown, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 160 }}>
                    {categories.map(c => (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.pickerItem, { borderBottomColor: theme.divider }]}
                        onPress={() => { setCategoryId(c.id); setPickerOpen(false); }}
                      >
                        <Text style={{ color: categoryId === c.id ? theme.primary : theme.text, fontSize: FontSize.subhead }}>
                          {c.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Dutch *</Text>
            <TextInput style={[inputStyle, { marginBottom: Spacing.md }]} value={dutch} onChangeText={setDutch} placeholder="Dutch word" placeholderTextColor={theme.textSecondary} />

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>English *</Text>
            <TextInput style={[inputStyle, { marginBottom: Spacing.md }]} value={english} onChangeText={setEnglish} placeholder="English translation" placeholderTextColor={theme.textSecondary} />

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Example (Dutch)</Text>
            <TextInput style={[inputStyle, { marginBottom: Spacing.md }]} value={exampleDutch} onChangeText={setExampleDutch} placeholder="Example sentence in Dutch" placeholderTextColor={theme.textSecondary} />

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Example (English)</Text>
            <TextInput style={[inputStyle, { marginBottom: Spacing.xl }]} value={exampleEnglish} onChangeText={setExampleEnglish} placeholder="Example sentence in English" placeholderTextColor={theme.textSecondary} />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: dutch && english ? theme.primary : theme.border }]}
              onPress={handleSave}
              disabled={!dutch || !english}
            >
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function VocabListScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { customWords, learnedIds, favorites, toggleFavorite, isFavorite, deleteCustomWord, addCustomWord } = useFavorites();
  const { speechRate } = useSettings();

  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<FilterType>('all');
  const [editWord, setEditWord] = React.useState<CustomWord | null>(null);

  const categories = React.useMemo(() => [
    { id: 'imported', title: 'Imported Words' },
    ...VOCABULARY_DATA.map(c => ({ id: c.id, title: c.title })),
  ], []);

  const allWords = React.useMemo<EnrichedWord[]>(() => {
    const result: EnrichedWord[] = [];

    function addFromCategory(words: Word[], categoryTitle: string, categoryId: string) {
      words.forEach(w => result.push({ word: { ...w, categoryId }, categoryTitle, isCustom: false }));
    }

    function walkCategory(cat: typeof VOCABULARY_DATA[0]) {
      addFromCategory(cat.words, cat.title, cat.id);
      if (cat.subCategories) cat.subCategories.forEach(walkCategory);
    }

    VOCABULARY_DATA.forEach(walkCategory);

    customWords.forEach(cw => {
      const cat = VOCABULARY_DATA.find(c => c.id === cw.categoryId);
      result.push({
        word: cw,
        categoryTitle: cat?.title ?? (cw.categoryId === 'imported' ? 'Imported Words' : 'Custom'),
        isCustom: true,
      });
    });

    return result;
  }, [customWords]);

  const filtered = React.useMemo(() => {
    let list = allWords;

    if (filter === 'custom') list = list.filter(e => e.isCustom);
    else if (filter === 'learned') list = list.filter(e => learnedIds.includes(e.word.id));
    else if (filter === 'saved') list = list.filter(e => favorites.includes(e.word.id));

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(e =>
        e.word.dutch.toLowerCase().includes(q) || e.word.english.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allWords, filter, query, learnedIds, favorites]);

  const handleDelete = (id: string, dutch: string) => {
    Alert.alert('Delete Word', `Delete "${dutch}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCustomWord(id) },
    ]);
  };

  const handleSaveEdit = async (updated: CustomWord) => {
    await deleteCustomWord(updated.id);
    await addCustomWord(updated);
    setEditWord(null);
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'custom', label: 'Custom' },
    { key: 'learned', label: 'Learned' },
    { key: 'saved', label: 'Saved' },
  ];

  const renderItem = ({ item }: { item: EnrichedWord }) => {
    const { word, categoryTitle, isCustom } = item;
    const learned = learnedIds.includes(word.id);
    const saved = favorites.includes(word.id);

    return (
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.cardMain}>
          <View style={styles.cardText}>
            <View style={styles.dutchRow}>
              <Text style={[styles.dutch, { color: theme.text }]} numberOfLines={1}>
                {word.dutch}
              </Text>
              {isCustom && (
                <View style={[styles.customBadge, { backgroundColor: theme.primary + '18' }]}>
                  <Text style={[styles.customBadgeText, { color: theme.primary }]}>custom</Text>
                </View>
              )}
            </View>
            <Text style={[styles.english, { color: theme.textSecondary }]} numberOfLines={1}>
              {word.english}
            </Text>
            <Text style={[styles.category, { color: theme.textSecondary + 'aa' }]} numberOfLines={1}>
              {categoryTitle}
            </Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => speak(word.dutch, speechRate)} hitSlop={6}>
              <Volume2 size={18} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleFavorite(word.id)} hitSlop={6}>
              <Heart size={18} color={saved ? '#ec4899' : theme.textSecondary} fill={saved ? '#ec4899' : 'none'} />
            </TouchableOpacity>
            {learned && <CheckCircle2 size={18} color={theme.success} />}
          </View>
        </View>

        {isCustom && (
          <View style={[styles.cardFooter, { borderTopColor: theme.divider }]}>
            <TouchableOpacity
              style={[styles.footerBtn, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => setEditWord(word as CustomWord)}
            >
              <Pencil size={13} color={theme.primary} />
              <Text style={[styles.footerBtnText, { color: theme.primary }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerBtn, { backgroundColor: theme.dangerLight }]}
              onPress={() => handleDelete(word.id, word.dutch)}
            >
              <Trash2 size={13} color={theme.danger} />
              <Text style={[styles.footerBtnText, { color: theme.danger }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Vocabulary List' }} />

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.surfaceSecondary }]}>
          <Search size={16} color={theme.textSecondary} />
          <TextInput
            placeholder="Search words..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <X size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll} contentContainerStyle={styles.pillsContent}>
          {filters.map(({ key, label }) => {
            const active = filter === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.pill, active ? { backgroundColor: theme.primary } : { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, borderWidth: 1 }]}
                onPress={() => setFilter(key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, { color: active ? '#fff' : theme.textSecondary }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.count, { color: theme.textSecondary }]}>
          {filtered.length} word{filtered.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={item => item.word.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No words found</Text>
          </View>
        }
      />

      <EditModal
        word={editWord}
        visible={editWord !== null}
        onClose={() => setEditWord(null)}
        onSave={handleSaveEdit}
        categories={categories}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, height: 42,
    borderRadius: BorderRadius.md, gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: FontSize.subhead, height: '100%' },
  pillsScroll: { marginBottom: Spacing.sm },
  pillsContent: { gap: Spacing.sm, paddingRight: Spacing.lg },
  pill: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  pillText: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  count: { fontSize: FontSize.footnote, marginBottom: Spacing.xs },

  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },

  card: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  cardMain: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, gap: Spacing.sm,
  },
  cardText: { flex: 1 },
  dutchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  dutch: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, flexShrink: 1 },
  customBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  customBadgeText: { fontSize: 10, fontWeight: FontWeight.semibold },
  english: { fontSize: FontSize.footnote, marginBottom: 2 },
  category: { fontSize: 11 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },

  cardFooter: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  footerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 6, borderRadius: BorderRadius.sm,
  },
  footerBtnText: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: FontSize.subhead },

  // Modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl, paddingBottom: Spacing.xxxl + 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: { fontSize: FontSize.title3, fontWeight: FontWeight.bold },
  modalLabel: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold, marginBottom: Spacing.xs, letterSpacing: 0.3 },
  modalInput: {
    padding: Spacing.md, borderRadius: BorderRadius.md,
    borderWidth: 1, fontSize: FontSize.subhead,
  },
  pickerButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  pickerDropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    borderRadius: BorderRadius.md, borderWidth: 1,
    marginTop: 4, zIndex: 100, elevation: 10,
  },
  pickerItem: { padding: Spacing.md, borderBottomWidth: 1 },
  saveBtn: {
    padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  saveBtnText: { color: '#fff', fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
});
