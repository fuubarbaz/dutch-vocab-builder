import React from 'react';
import { StyleSheet, FlatList, SectionList, TouchableOpacity, Text, View, TextInput, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '@/context/FavoritesContext';
import { useSettings } from '@/context/SettingsContext';
import { useSRS } from '@/context/SRSContext';
import { useRouter } from 'expo-router';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import { TRAFFIC_CATEGORIES } from '@/data/traffic_categories';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { LucideIcon, Hand, Hash, Utensils, Book, Home, ShoppingCart, Bus, HeartPulse, Shirt, Briefcase, Cloud, Languages, MessageCircle, Smile, Search, X, Volume2, Octagon, ChevronRight, ChevronDown, Flame, BookOpen, Target, Clock, Lightbulb, AudioLines, TrafficCone, Layers, GraduationCap, PenLine } from 'lucide-react-native';
import { speak } from '@/utils/tts';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

const LAST_CATEGORY_KEY = 'last_category_v1';
type SearchFilter = 'all' | 'saved' | 'learned' | 'unlearned';
type ActiveTab = 'vocab' | 'traffic';

const iconMap: Record<string, LucideIcon> = {
  'Hand': Hand,
  'Hash': Hash,
  'Utensils': Utensils,
  'Home': Home,
  'ShoppingCart': ShoppingCart,
  'Bus': Bus,
  'HeartPulse': HeartPulse,
  'Shirt': Shirt,
  'Briefcase': Briefcase,
  'Cloud': Cloud,
  'Languages': Languages,
  'MessageCircle': MessageCircle,
  'Smile': Smile,
  'Octagon': Octagon,
};

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ progress, size = 40, strokeWidth = 3, color }: { progress: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <SvgCircle cx={size / 2} cy={size / 2} r={radius} stroke={color + '20'} strokeWidth={strokeWidth} fill="transparent" />
        <SvgCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={{ position: 'absolute', fontSize: 10, fontWeight: FontWeight.semibold, color }}>
        {progress}%
      </Text>
    </View>
  );
}

// ─── Daily Summary Card ───────────────────────────────────────────────────────

function DailySummaryCard({ theme, onPress }: { theme: typeof Colors.light; onPress: () => void }) {
  const { stats } = useSRS();
  const hasDue = stats.dueToday > 0;

  return (
    <View style={[summaryStyles.card, { backgroundColor: theme.cardBackground }]}>
      <View style={summaryStyles.statsRow}>
        <View style={summaryStyles.stat}>
          <View style={[summaryStyles.statIcon, { backgroundColor: theme.accentLight }]}>
            <Flame size={16} color={theme.primary} />
          </View>
          <Text style={[summaryStyles.statValue, { color: theme.text }]}>{stats.streak}</Text>
          <Text style={[summaryStyles.statLabel, { color: theme.textSecondary }]}>day streak</Text>
        </View>
        <View style={[summaryStyles.divider, { backgroundColor: theme.border }]} />
        <View style={summaryStyles.stat}>
          <View style={[summaryStyles.statIcon, { backgroundColor: hasDue ? theme.accentLight : theme.successLight }]}>
            <BookOpen size={16} color={hasDue ? theme.primary : theme.success} />
          </View>
          <Text style={[summaryStyles.statValue, { color: theme.text }]}>{stats.dueToday}</Text>
          <Text style={[summaryStyles.statLabel, { color: theme.textSecondary }]}>due today</Text>
        </View>
        <View style={[summaryStyles.divider, { backgroundColor: theme.border }]} />
        <View style={summaryStyles.stat}>
          <View style={[summaryStyles.statIcon, { backgroundColor: theme.successLight }]}>
            <Target size={16} color={theme.success} />
          </View>
          <Text style={[summaryStyles.statValue, { color: theme.text }]}>{stats.weeklyAccuracy}%</Text>
          <Text style={[summaryStyles.statLabel, { color: theme.textSecondary }]}>accuracy</Text>
        </View>
      </View>
      <TouchableOpacity style={[summaryStyles.ctaButton, { backgroundColor: theme.primary }]} onPress={onPress} activeOpacity={0.8}>
        <Text style={summaryStyles.ctaText}>
          {hasDue ? `Start Practice · ${stats.dueToday} words` : 'Practice All Words'}
        </Text>
        <ChevronRight size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statIcon: { width: 32, height: 32, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  statValue: { fontSize: FontSize.subhead, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.caption },
  divider: { width: 1, height: 44, marginHorizontal: Spacing.sm },
  ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.xs },
  ctaText: { color: '#fff', fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { customWords, learnedIds, favorites } = useFavorites();
  const { speechRate } = useSettings();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchFilter, setSearchFilter] = React.useState<SearchFilter>('all');
  const [lastCategory, setLastCategory] = React.useState<{ id: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('vocab');
  const [decksExpanded, setDecksExpanded] = React.useState(false);

  // Load last visited category
  React.useEffect(() => {
    AsyncStorage.getItem(LAST_CATEGORY_KEY).then(raw => {
      if (raw) setLastCategory(JSON.parse(raw));
    }).catch(() => {});
  }, []);

  const playAudio = async (text: string) => { await speak(text, speechRate); };

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

  // Vocab tab: all categories except traffic_signs_parent, sorted by progress
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

  // Traffic tab: all TRAFFIC_CATEGORIES subcategories
  const trafficData = React.useMemo(() => [...TRAFFIC_CATEGORIES], []);

  // Active list data — empty when Decks accordion is collapsed
  const listData = decksExpanded ? (activeTab === 'vocab' ? vocabData : trafficData) : [];

  // Word of the Day
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
        {percentage > 0 ? (
          <ProgressRing progress={percentage} color={theme.success} />
        ) : (
          <ChevronRight size={18} color={theme.textSecondary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderSearchItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.searchResultCard, { backgroundColor: theme.cardBackground }]}
      onPress={() => playAudio(item.dutch)}
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

  const ListHeader = () => (
    <>
      <DailySummaryCard theme={theme} onPress={() => router.push('/vocab-practice' as any)} />

      {/* Word of the Day */}
      {wordOfDay && (
        <View style={[styles.wotdCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.wotdHeader}>
            <Lightbulb size={14} color={theme.primary} />
            <Text style={[styles.wotdLabel, { color: theme.primary }]}>WORD OF THE DAY</Text>
          </View>
          <View style={styles.wotdBody}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.wotdDutch, { color: theme.text }]}>{wordOfDay.dutch}</Text>
              <Text style={[styles.wotdEnglish, { color: theme.textSecondary }]}>{wordOfDay.english}</Text>
              <Text style={[styles.wotdCategory, { color: theme.primary }]}>{wordOfDay.categoryTitle}</Text>
            </View>
            <TouchableOpacity onPress={() => playAudio(wordOfDay.dutch)} hitSlop={8} style={[styles.wotdPlay, { backgroundColor: theme.primary + '15' }]}>
              <Volume2 size={18} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Decks accordion */}
      <TouchableOpacity
        style={[styles.decksRow, { backgroundColor: theme.cardBackground }]}
        onPress={() => setDecksExpanded(e => !e)}
        activeOpacity={0.7}
      >
        <View style={[styles.decksIcon, { backgroundColor: theme.primary + '15' }]}>
          <Layers size={18} color={theme.primary} />
        </View>
        <View style={styles.decksTextBlock}>
          <Text style={[styles.decksTitle, { color: theme.text }]}>Decks</Text>
        </View>
        {decksExpanded
          ? <ChevronDown size={18} color={theme.textSecondary} />
          : <ChevronRight size={18} color={theme.textSecondary} />
        }
      </TouchableOpacity>

      {decksExpanded && (
        <View style={[styles.tabSwitcher, { backgroundColor: theme.surfaceSecondary }]}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'vocab' && { backgroundColor: theme.cardBackground, ...styles.tabButtonActive }]}
            onPress={() => setActiveTab('vocab')}
            activeOpacity={0.8}
          >
            <Book size={15} color={activeTab === 'vocab' ? theme.primary : theme.textSecondary} />
            <Text style={[styles.tabButtonText, { color: activeTab === 'vocab' ? theme.primary : theme.textSecondary }]}>
              Vocab
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'traffic' && { backgroundColor: theme.cardBackground, ...styles.tabButtonActive }]}
            onPress={() => setActiveTab('traffic')}
            activeOpacity={0.8}
          >
            <TrafficCone size={15} color={activeTab === 'traffic' ? '#f59e0b' : theme.textSecondary} />
            <Text style={[styles.tabButtonText, { color: activeTab === 'traffic' ? '#f59e0b' : theme.textSecondary }]}>
              Traffic Signs
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Continue where you left off */}
      {lastCategory && (
        <TouchableOpacity
          style={[styles.continueRow, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
          onPress={() => router.push(`/category/${lastCategory.id}`)}
          activeOpacity={0.7}
        >
          <Clock size={15} color={theme.textSecondary} />
          <Text style={[styles.continueText, { color: theme.textSecondary }]} numberOfLines={1}>
            Continue: <Text style={{ color: theme.text, fontWeight: FontWeight.semibold }}>{lastCategory.title}</Text>
          </Text>
          <ChevronRight size={15} color={theme.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Pronunciation Guide */}
      <TouchableOpacity
        style={[styles.pronGuideCard, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/pronunciation-guide' as any)}
        activeOpacity={0.85}
      >
        <View style={[styles.pronGuideIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <AudioLines size={20} color="#fff" />
        </View>
        <View style={styles.pronGuideText}>
          <Text style={styles.pronGuideTitle}>Pronunciation Guide</Text>
          <Text style={styles.pronGuideSubtitle}>Rules, sounds & live examples</Text>
        </View>
        <ChevronRight size={18} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      {/* Grammar Topics */}
      <TouchableOpacity
        style={[styles.grammarCard, { backgroundColor: theme.cardBackground }]}
        onPress={() => router.push('/grammar' as any)}
        activeOpacity={0.8}
      >
        <View style={[styles.grammarIcon, { backgroundColor: theme.success + '18' }]}>
          <GraduationCap size={20} color={theme.success} />
        </View>
        <View style={styles.pronGuideText}>
          <Text style={[styles.grammarTitle, { color: theme.text }]}>Grammar Topics</Text>
          <Text style={[styles.grammarSubtitle, { color: theme.textSecondary }]}>Rules & explanations</Text>
        </View>
        <ChevronRight size={18} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Sentence Builder */}
      <TouchableOpacity
        style={[styles.grammarCard, { backgroundColor: theme.cardBackground }]}
        onPress={() => router.push('/sentence-builder' as any)}
        activeOpacity={0.8}
      >
        <View style={[styles.grammarIcon, { backgroundColor: theme.accent + '18' }]}>
          <PenLine size={20} color={theme.accent} />
        </View>
        <View style={styles.pronGuideText}>
          <Text style={[styles.grammarTitle, { color: theme.text }]}>Sentence Builder</Text>
          <Text style={[styles.grammarSubtitle, { color: theme.textSecondary }]}>Construct full phrases</Text>
        </View>
        <ChevronRight size={18} color={theme.textSecondary} />
      </TouchableOpacity>

    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchBarContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.surfaceSecondary }]}>
          <Search size={18} color={theme.textSecondary} />
          <TextInput
            placeholder="Search words..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter pills — visible when search is active */}
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
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Search bar
  searchBarContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: FontSize.body, height: '100%' },

  // Filter pills
  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  filterPill: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full },
  filterPillText: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },

  // Decks accordion row
  decksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  decksIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decksTextBlock: { flex: 1 },
  decksTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, marginBottom: 1 },
  decksSub: { fontSize: FontSize.caption },

  // Tab switcher (shown inside accordion)
  tabSwitcher: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: 3,
    gap: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  tabButtonActive: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  tabButtonText: { fontSize: FontSize.footnote, fontWeight: FontWeight.semibold },

  // List
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },

  // Word of the Day
  wotdCard: {
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  wotdHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm },
  wotdLabel: { fontSize: FontSize.caption, fontWeight: FontWeight.semibold, letterSpacing: 0.5 },
  wotdBody: { flexDirection: 'row', alignItems: 'center' },
  wotdDutch: { fontSize: FontSize.title3, fontWeight: FontWeight.bold, marginBottom: 2 },
  wotdEnglish: { fontSize: FontSize.footnote, marginBottom: 4 },
  wotdCategory: { fontSize: FontSize.caption, fontWeight: FontWeight.medium },
  wotdPlay: { width: 40, height: 40, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },

  // Continue row
  continueRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md, marginBottom: Spacing.sm, borderWidth: 1,
  },
  continueText: { flex: 1, fontSize: FontSize.footnote },

  // Pronunciation guide
  pronGuideCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  pronGuideIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  pronGuideText: { flex: 1 },
  pronGuideTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, color: '#fff', marginBottom: 1 },
  pronGuideSubtitle: { fontSize: FontSize.caption, color: 'rgba(255,255,255,0.8)' },

  // Grammar card
  grammarCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  grammarIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  grammarTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, marginBottom: 1 },
  grammarSubtitle: { fontSize: FontSize.caption },

  // Section label
  sectionLabel: {
    fontSize: FontSize.caption, fontWeight: FontWeight.semibold,
    letterSpacing: 0.5, marginBottom: Spacing.md, marginTop: Spacing.sm,
  },

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

  // Search results
  searchResultCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.md, marginBottom: Spacing.sm },
  searchResultDutch: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold },
  searchResultEnglish: { fontSize: FontSize.footnote, marginTop: 2 },
  emptySearch: { alignItems: 'center', paddingTop: 60 },
  emptySearchText: { fontSize: FontSize.subhead },
});
