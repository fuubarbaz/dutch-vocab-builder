import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Text, View, TextInput, Platform } from 'react-native';
import { useFavorites } from '@/context/FavoritesContext';
import { useSettings } from '@/context/SettingsContext';
import { useRouter } from 'expo-router';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { LucideIcon, Hand, Hash, Utensils, Book, Home, ShoppingCart, Bus, HeartPulse, Shirt, Briefcase, Cloud, Languages, MessageCircle, Smile, Upload, Search, X, Volume2, Octagon, BrainCircuit, ChevronRight } from 'lucide-react-native';
import { speak } from '@/utils/tts';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

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
  'Upload': Upload,
  'Octagon': Octagon,
};

// Compact progress ring component
function ProgressRing({ progress, size = 40, strokeWidth = 3, color }: { progress: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color + '20'}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={{
        position: 'absolute',
        fontSize: 10,
        fontWeight: FontWeight.semibold,
        color: color,
      }}>
        {progress}%
      </Text>
    </View>
  );
}

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { customWords, learnedIds } = useFavorites();
  const { speechRate } = useSettings();
  const [searchQuery, setSearchQuery] = React.useState('');

  const playAudio = async (text: string) => {
    await speak(text, speechRate);
  };

  const mergedData = React.useMemo(() => {
    const data = VOCABULARY_DATA.map(category => {
      const categoryCustomWords = customWords.filter(cw => cw.categoryId === category.id);
      return {
        ...category,
        words: [...category.words, ...categoryCustomWords]
      };
    });

    const importedWords = customWords.filter(cw => cw.categoryId === 'imported');
    if (importedWords.length > 0) {
      data.push({
        id: 'imported',
        title: 'Imported Words',
        titleDutch: 'Geimporteerde Woorden',
        description: 'Words added from CSV',
        iconName: 'Upload',
        words: importedWords
      });
    }

    return data;
  }, [customWords]);

  const getAllWords = React.useCallback((category: typeof VOCABULARY_DATA[0]): any[] => {
    let words = [...category.words];
    if (category.subCategories) {
      category.subCategories.forEach(sub => {
        words = [...words, ...getAllWords(sub)];
      });
    }
    return words;
  }, []);

  const [allWords, setAllWords] = React.useState<any[]>([]);
  React.useEffect(() => {
    const flattened: any[] = [];
    mergedData.forEach(cat => {
      const catWords = getAllWords(cat);
      catWords.forEach(w => {
        flattened.push({ ...w, categoryTitle: cat.title });
      });
    });
    setAllWords(flattened);
  }, [mergedData, getAllWords]);

  const filteredWords = React.useMemo(() => {
    if (!searchQuery) return [];
    const lower = searchQuery.toLowerCase();
    return allWords.filter(w =>
      w.dutch.toLowerCase().includes(lower) ||
      w.english.toLowerCase().includes(lower)
    );
  }, [searchQuery, allWords]);

  const renderCategoryItem = ({ item }: { item: typeof VOCABULARY_DATA[0] }) => {
    const Icon = iconMap[item.iconName] || Book;
    const allCatWords = getAllWords(item);
    const learnedCount = allCatWords.filter(word => learnedIds.includes(word.id)).length;
    const totalCount = allCatWords.length;
    const percentage = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;
    const remainingCount = totalCount - learnedCount;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.cardBackground }]}
        onPress={() => router.push(`/category/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '10' }]}>
          <Icon size={22} color={theme.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
            {item.title}
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
        <Text style={[styles.searchResultCategory, { color: theme.primary }]}>{item.categoryTitle}</Text>
      </View>
      <Volume2 size={20} color={theme.primary} />
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <>
      {/* Import button - subtle */}
      <TouchableOpacity
        style={[styles.importRow, { borderColor: theme.border }]}
        onPress={() => router.push('/import')}
        activeOpacity={0.7}
      >
        <Upload size={16} color={theme.textSecondary} />
        <Text style={[styles.importText, { color: theme.textSecondary }]}>Import words from CSV</Text>
        <ChevronRight size={16} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Section header */}
      <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>CATEGORIES</Text>
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
      </View>

      {searchQuery ? (
        <FlatList
          data={filteredWords}
          renderItem={renderSearchItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptySearch}>
              <Text style={[styles.emptySearchText, { color: theme.textSecondary }]}>
                No words found for "{searchQuery}"
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={mergedData}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  searchInput: {
    flex: 1,
    fontSize: FontSize.body,
    height: '100%',
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  // Import row
  importRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  importText: {
    flex: 1,
    fontSize: FontSize.footnote,
  },
  // Section header
  sectionHeader: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  // Category Cards
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: FontSize.footnote,
  },
  // Search Results
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  searchResultDutch: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
  },
  searchResultEnglish: {
    fontSize: FontSize.footnote,
    marginTop: 2,
  },
  searchResultCategory: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    marginTop: 4,
  },
  emptySearch: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptySearchText: {
    fontSize: FontSize.subhead,
  },
});
