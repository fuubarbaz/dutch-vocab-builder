import React from 'react';
import {
  StyleSheet, FlatList, SectionList, TouchableOpacity, Text, View,
  TextInput, Platform, Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '@/context/FavoritesContext';
import { useSettings } from '@/context/SettingsContext';
import { useSRS } from '@/context/SRSContext';
import { useRouter, useNavigation } from 'expo-router';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import { TRAFFIC_CATEGORIES } from '@/data/traffic_categories';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import {
  LucideIcon, Hand, Hash, Utensils, Book, Home, ShoppingCart, Bus,
  HeartPulse, Shirt, Briefcase, Cloud, Languages, MessageCircle, Smile,
  Search, X, Volume2, Octagon, ChevronRight, Flame, BookOpen, Clock,
  TrafficCone, Heart, PlusCircle, List,
} from 'lucide-react-native';
import { speak } from '@/utils/tts';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

const LAST_CATEGORY_KEY = 'last_category_v1';
type SearchFilter = 'all' | 'saved' | 'learned' | 'unlearned';
type ActiveTab = 'vocab' | 'traffic';

const iconMap: Record<string, LucideIcon> = {
  Hand, Hash, Utensils, Home, ShoppingCart, Bus, HeartPulse, Shirt,
  Briefcase, Cloud, Languages, MessageCircle, Smile, Octagon,
};

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ progress, size = 36, strokeWidth = 3, color }: {
  progress: number; size?: number; strokeWidth?: number; color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <SvgCircle cx={size / 2} cy={size / 2} r={radius} stroke={color + '20'} strokeWidth={strokeWidth} fill="transparent" />
        <SvgCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={{ position: 'absolute', fontSize: 9, fontWeight: FontWeight.semibold, color }}>
        {progress}%
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const navigation = useNavigation();
  const { customWords, learnedIds, favorites } = useFavorites();
  const { speechRate } = useSettings();
  const { stats } = useSRS();

  const [searchVisible, setSearchVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchFilter, setSearchFilter] = React.useState<SearchFilter>('all');
  const [lastCategory, setLastCategory] = React.useState<{ id: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('vocab');

  // Load last visited category
  React.useEffect(() => {
    AsyncStorage.getItem(LAST_CATEGORY_KEY).then(raw => {
      if (raw) setLastCategory(JSON.parse(raw));
    }).catch(() => {});
  }, []);

  // Search icon in nav header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 16 }}>
          <Pressable onPress={() => {
            setSearchVisible(v => {
              if (v) setSearchQuery('');
              return !v;
            });
          }} hitSlop={8}>
            {({ pressed }) => (
              <Search size={20} color={searchVisible ? theme.primary : theme.text} style={{ opacity: pressed ? 0.5 : 1 }} />
            )}
          </Pressable>
          <Pressable onPress={() => router.push('/vocab-list' as any)} hitSlop={8}>
            {({ pressed }) => (
              <List size={20} color={theme.text} style={{ opacity: pressed ? 0.5 : 1 }} />
            )}
          </Pressable>
          <Pressable onPress={() => router.push('/add-word')} hitSlop={8}>
            {({ pressed }) => (
              <PlusCircle size={22} color={theme.primary} style={{ opacity: pressed ? 0.5 : 1 }} />
            )}
          </Pressable>
        </View>
      ),
    });
  }, [navigation, searchVisible, theme]);

  const mergedData = React.useMemo(() => {
    const data = VOCABULARY_DATA.map(category => {
      const categoryCustomWords = customWords.filter(cw => cw.categoryId === category.id);
      return { ...category, words: [...category.words, ...categoryCustomWords] };
    });
    const importedWords = customWords.filter(cw => cw.categoryId === 'imported');
    if (importedWords.length > 0) {
      data.push({ id: 'imported', title: 'Imported Words', titleDutch: 'Geimporteerde Woorden', description: 'Words added from CSV', iconName: 'Upload', words: importedWords });
    }
    return data;
  }, [customWords]);

  const getAllWords = React.useCallback((category: typeof VOCABULARY_DATA[0]): any[] => {
    let words = [...category.words];
    if (category.subCategories) {
      category.subCategories.forEach(sub => { words = [...words, ...getAllWords(sub)]; });
    }
    return words;
  }, []);

  const allWords = React.useMemo(() => {
    const flattened: any[] = [];
    mergedData.forEach(cat => {
      getAllWords(cat).forEach(w => {
        flattened.push({ ...w, categoryTitle: cat.title, categoryId: cat.id });
      });
    });
    return flattened;
  }, [mergedData, getAllWords]);

  const vocabData = React.useMemo(() => {
    const filtered = mergedData.filter(c => c.id !== 'traffic_signs_parent');
    return [...filtered].sort((a, b) => {
      const aWords = getAllWords(a);
      const bWords = getAllWords(b);
      const aLearned = aWords.filter(w => learnedIds.includes(w.id)).length;
      const bLearned = bWords.filter(w => learnedIds.includes(w.id)).length;
      const rank = (learned: number, total: number) => {
        if (learned > 0 && learned < total) return 0;
        if (learned === 0) return 1;
        return 2;
      };
      return rank(aLearned, aWords.length) - rank(bLearned, bWords.length);
    });
  }, [mergedData, learnedIds, getAllWords]);

  const trafficData = React.useMemo(() => [...TRAFFIC_CATEGORIES], []);
  const listData = activeTab === 'vocab' ? vocabData : trafficData;

  const wordOfDay = React.useMemo(() => {
    if (allWords.length === 0) return null;
    const d = new Date();
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    return allWords[seed % allWords.length];
  }, [allWords]);

  // Search
  const filteredWords = React.useMemo(() => {
    if (!searchQuery) return [];
    const lower = searchQuery.toLowerCase();
    let results = allWords.filter(w =>
      w.dutch.toLowerCase().includes(lower) || w.english.toLowerCase().includes(lower)
    );
    if (searchFilter === 'saved') results = results.filter(w => favorites.includes(w.id));
    if (searchFilter === 'learned') results = results.filter(w => learnedIds.includes(w.id));
    if (searchFilter === 'unlearned') results = results.filter(w => !learnedIds.includes(w.id));
    return results;
  }, [searchQuery, allWords, searchFilter, favorites, learnedIds]);

  const groupedSearchResults = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredWords.forEach(w => {
      if (!groups[w.categoryTitle]) groups[w.categoryTitle] = [];
      groups[w.categoryTitle].push(w);
    });
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [filteredWords]);

  const navigateToCategory = async (item: typeof VOCABULARY_DATA[0]) => {
    const entry = { id: item.id, title: item.title };
    setLastCategory(entry);
    await AsyncStorage.setItem(LAST_CATEGORY_KEY, JSON.stringify(entry)).catch(() => {});
    router.push(`/category/${item.id}`);
  };

  const renderCategoryItem = ({ item }: { item: typeof VOCABULARY_DATA[0] }) => {
    const Icon = iconMap[item.iconName] || Book;
    const allCatWords = getAllWords(item);
    const learnedCount = allCatWords.filter(word => learnedIds.includes(word.id)).length;
    const totalCount = allCatWords.length;
    const percentage = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;
    const remainingCount = totalCount - learnedCount;
    const accentColor = activeTab === 'traffic' ? '#f59e0b' : theme.primary;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.cardBackground }]}
        onPress={() => navigateToCategory(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: accentColor + '12' }]}>
          <Icon size={22} color={accentColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
            {item.title.replace('Traffic Signs: ', '')}
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.titleDutch} · {remainingCount} left
          </Text>
        </View>
        {percentage > 0
          ? <ProgressRing progress={percentage} color={theme.success} />
          : <ChevronRight size={18} color={theme.textSecondary} />
        }
      </TouchableOpacity>
    );
  };

  const renderSearchItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.searchResultCard, { backgroundColor: theme.cardBackground }]}
      onPress={() => speak(item.dutch, speechRate)}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.searchResultDutch, { color: theme.text }]}>{item.dutch}</Text>
        <Text style={[styles.searchResultEnglish, { color: theme.textSecondary }]}>{item.english}</Text>
      </View>
      <Volume2 size={20} color={theme.primary} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <Text style={[styles.sectionLabel, { color: theme.textSecondary, backgroundColor: theme.background }]}>
      {section.title.toUpperCase()}
    </Text>
  );

  const filterLabels: { key: SearchFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'saved', label: 'Saved' },
    { key: 'learned', label: 'Learned' },
    { key: 'unlearned', label: 'Unlearned' },
  ];

  const hasDue = stats.dueToday > 0;

  const ListHeader = () => (
    <>
      {/* ── TODAY ─────────────────────────────────────── */}
      <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>TODAY</Text>

      <View style={[styles.todayCard, { backgroundColor: theme.cardBackground }]}>
        {/* Streak row */}
        {stats.streak > 0 && (
          <View style={styles.streakRow}>
            <Flame size={14} color={theme.primary} />
            <Text style={[styles.streakText, { color: theme.primary }]}>
              {stats.streak} day streak
            </Text>
          </View>
        )}

        {/* Word of the Day */}
        {wordOfDay && (
          <View style={[styles.wotdRow, { borderTopColor: theme.border, borderTopWidth: stats.streak > 0 ? 1 : 0, marginTop: stats.streak > 0 ? Spacing.md : 0, paddingTop: stats.streak > 0 ? Spacing.md : 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.wotdLabel, { color: theme.textSecondary }]}>WORD OF THE DAY</Text>
              <Text style={[styles.wotdDutch, { color: theme.text }]}>{wordOfDay.dutch}</Text>
              <Text style={[styles.wotdEnglish, { color: theme.textSecondary }]}>{wordOfDay.english}</Text>
            </View>
            <TouchableOpacity
              onPress={() => speak(wordOfDay.dutch, speechRate)}
              hitSlop={8}
              style={[styles.wotdPlay, { backgroundColor: theme.primary + '15' }]}
            >
              <Volume2 size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: theme.primary, marginTop: Spacing.md }]}
          onPress={() => router.push('/vocab-practice' as any)}
          activeOpacity={0.8}
        >
          <BookOpen size={16} color="#fff" />
          <Text style={styles.ctaText}>
            {hasDue ? `Start Practice · ${stats.dueToday} words due` : 'Practice All Words'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Continue where you left off */}
      {lastCategory && (
        <TouchableOpacity
          style={[styles.continueRow, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
          onPress={() => router.push(`/category/${lastCategory.id}`)}
          activeOpacity={0.7}
        >
          <Clock size={14} color={theme.textSecondary} />
          <Text style={[styles.continueText, { color: theme.textSecondary }]} numberOfLines={1}>
            Continue: <Text style={{ color: theme.text, fontWeight: FontWeight.semibold }}>{lastCategory.title}</Text>
          </Text>
          <ChevronRight size={14} color={theme.textSecondary} />
        </TouchableOpacity>
      )}

      {/* ── LEARN ─────────────────────────────────────── */}
      <View style={styles.learnHeader}>
        <Text style={[styles.sectionHeader, { color: theme.textSecondary, marginBottom: 0 }]}>LEARN</Text>
        <View style={[styles.tabSwitcher, { backgroundColor: theme.surfaceSecondary }]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'vocab' && { backgroundColor: theme.cardBackground, ...styles.tabBtnActive }]}
            onPress={() => setActiveTab('vocab')}
            activeOpacity={0.8}
          >
            <Book size={13} color={activeTab === 'vocab' ? theme.primary : theme.textSecondary} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'vocab' ? theme.primary : theme.textSecondary }]}>
              Vocab
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'traffic' && { backgroundColor: theme.cardBackground, ...styles.tabBtnActive }]}
            onPress={() => setActiveTab('traffic')}
            activeOpacity={0.8}
          >
            <TrafficCone size={13} color={activeTab === 'traffic' ? '#f59e0b' : theme.textSecondary} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'traffic' ? '#f59e0b' : theme.textSecondary }]}>
              Traffic
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Saved Words — pinned at top of list */}
      {favorites.length > 0 && (
        <TouchableOpacity
          style={[styles.savedRow, { backgroundColor: theme.cardBackground }]}
          onPress={() => router.push('/favorites' as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.savedIcon, { backgroundColor: '#ec4899' + '18' }]}>
            <Heart size={18} color="#ec4899" />
          </View>
          <Text style={[styles.savedText, { color: theme.text }]}>Saved Words</Text>
          <Text style={[styles.savedCount, { backgroundColor: '#ec4899' + '18', color: '#ec4899' }]}>
            {favorites.length}
          </Text>
          <ChevronRight size={16} color={theme.textSecondary} />
        </TouchableOpacity>
      )}
    </>
  );

  const ListFooter = () => null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search bar — only visible when toggled */}
      {searchVisible && (
        <View style={[styles.searchBarContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.searchBar, { backgroundColor: theme.surfaceSecondary }]}>
            <Search size={16} color={theme.textSecondary} />
            <TextInput
              placeholder="Search words..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                <X size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          {searchQuery.length > 0 && (
            <View style={styles.filterRow}>
              {filterLabels.map(({ key, label }) => {
                const active = searchFilter === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setSearchFilter(key)}
                    style={[
                      styles.filterPill,
                      active
                        ? { backgroundColor: theme.primary }
                        : { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, borderWidth: 1 },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterPillText, { color: active ? '#fff' : theme.textSecondary }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {searchQuery ? (
        <SectionList
          sections={groupedSearchResults}
          renderItem={renderSearchItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptySearch}>
              <Text style={[styles.emptySearchText, { color: theme.textSecondary }]}>
                No {searchFilter !== 'all' ? searchFilter + ' ' : ''}words found for "{searchQuery}"
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={listData}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Section headers
  sectionHeader: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  // TODAY card
  todayCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  streakText: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },
  wotdRow: { flexDirection: 'row', alignItems: 'center' },
  wotdLabel: { fontSize: 10, fontWeight: FontWeight.semibold, letterSpacing: 0.5, marginBottom: 4 },
  wotdDutch: { fontSize: FontSize.title3, fontWeight: FontWeight.bold, marginBottom: 2 },
  wotdEnglish: { fontSize: FontSize.footnote },
  wotdPlay: { width: 36, height: 36, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  ctaButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.sm,
  },
  ctaText: { color: '#fff', fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },

  // LEARN header row
  learnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  tabSwitcher: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 3,
    gap: 2,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  tabBtnActive: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  tabBtnText: { fontSize: 12, fontWeight: FontWeight.semibold },

  // Category card
  card: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.lg,
    borderRadius: BorderRadius.lg, marginBottom: Spacing.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  iconContainer: { width: 44, height: 44, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  textContainer: { flex: 1, marginRight: Spacing.sm },
  cardTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, marginBottom: 2 },
  cardSubtitle: { fontSize: FontSize.footnote },

  // Continue row
  continueRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md, marginBottom: Spacing.md, borderWidth: 1,
  },
  continueText: { flex: 1, fontSize: FontSize.footnote },

  // Saved words row
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  savedIcon: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  savedText: { flex: 1, fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  savedCount: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },

  // Search
  searchBarContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, height: 40,
    borderRadius: BorderRadius.md, gap: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: FontSize.body, height: '100%' },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  filterPill: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full },
  filterPillText: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },

  // Search results
  sectionLabel: {
    fontSize: FontSize.caption, fontWeight: FontWeight.semibold,
    letterSpacing: 0.5, marginBottom: Spacing.md, marginTop: Spacing.sm,
  },
  searchResultCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.md, marginBottom: Spacing.sm },
  searchResultDutch: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  searchResultEnglish: { fontSize: FontSize.footnote, marginTop: 2 },
  emptySearch: { alignItems: 'center', paddingTop: 60 },
  emptySearchText: { fontSize: FontSize.subhead },

  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
});
