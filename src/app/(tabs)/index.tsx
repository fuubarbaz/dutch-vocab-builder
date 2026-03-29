import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Text, View, TextInput } from 'react-native';
import { useFavorites } from '@/context/FavoritesContext';
import { useSettings } from '@/context/SettingsContext';
import { Link, useRouter } from 'expo-router';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { LucideIcon, Hand, Hash, Utensils, Book, Home, ShoppingCart, Bus, HeartPulse, Shirt, Briefcase, Cloud, Languages, MessageCircle, Smile, Upload, Search, X, Volume2, Octagon, BrainCircuit } from 'lucide-react-native';
import { speak } from '@/utils/tts';

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

  // 1. Merge Data (Categories + Custom)
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
        titleDutch: 'Geïmporteerde Woorden',
        description: 'Words added from CSV',
        iconName: 'Upload', // Matches Lucide icon
        words: importedWords
      });
    }

    return data;
  }, [customWords]);

  // Helper to recursively get all words from a category and its subcategories
  const getAllWords = React.useCallback((category: typeof VOCABULARY_DATA[0]): any[] => {
    let words = [...category.words];
    if (category.subCategories) {
      category.subCategories.forEach(sub => {
        words = [...words, ...getAllWords(sub)];
      });
    }
    return words;
  }, []);

  // 2. Flatten for Search
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

  // 3. Filter Logic
  const filteredWords = React.useMemo(() => {
    if (!searchQuery) return [];
    const lower = searchQuery.toLowerCase();
    return allWords.filter(w =>
      w.dutch.toLowerCase().includes(lower) ||
      w.english.toLowerCase().includes(lower)
    );
  }, [searchQuery, allWords]);

  // Render Category Item
  const renderCategoryItem = ({ item }: { item: typeof VOCABULARY_DATA[0] }) => {
    const Icon = iconMap[item.iconName] || Book;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colorScheme === 'light' ? '#f3f4f6' : theme.cardBackground,
          },
        ]}
        onPress={() => router.push(`/category/${item.id}`)}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
          <Icon size={24} color={theme.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{item.title} / {item.titleDutch}</Text>
          <Text style={[styles.description, { color: theme.text + '99' }]}>{item.description}</Text>
        </View>
        <View style={styles.countContainer}>
          {(() => {
            const allCatWords = getAllWords(item);
            const learnedCount = allCatWords.filter(word => learnedIds.includes(word.id)).length;
            const totalCount = allCatWords.length;
            const remainingCount = totalCount - learnedCount;
            const percentage = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

            return (
              <>
                <Text style={[styles.count, { color: theme.text + '60' }]}>
                  {remainingCount} {remainingCount === 1 ? 'flash card' : 'flash cards'}
                </Text>
                {learnedCount > 0 && (
                  <Text style={[styles.learnedCount, { color: theme.primary }]}>
                    {percentage}% complete
                  </Text>
                )}
              </>
            );
          })()}
        </View>
      </TouchableOpacity>
    );
  };

  // Render Search Result Item
  const renderSearchItem = ({ item }: { item: any }) => (
    <View style={[styles.searchResultCard, { backgroundColor: theme.cardBackground }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.searchResultDutch, { color: theme.text }]}>{item.dutch}</Text>
        <Text style={[styles.searchResultEnglish, { color: theme.text + '80' }]}>{item.english}</Text>
        <Text style={[styles.searchResultCategory, { color: theme.primary }]}>{item.categoryTitle}</Text>
      </View>
      <TouchableOpacity onPress={() => playAudio(item.dutch)} style={{ padding: 8 }}>
        <Volume2 size={24} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.cardBackground }]}>
          <View style={{ marginRight: 10 }}>
            {/* Placeholder Icon */}
            <Search size={20} color={theme.text + '60'} />
          </View>
          <TextInput
            placeholder="Search words..."
            placeholderTextColor={theme.text + '60'}
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={theme.text + '60'} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={[styles.importButton, { backgroundColor: theme.primary }]} onPress={() => router.push('/import')}>
          <Upload size={16} color="#fff" />
          <Text style={styles.importButtonText}>Import CSV</Text>
        </TouchableOpacity>
      </View>

      {/* AI Sentence Builder Banner */}
      {!searchQuery && (
        <TouchableOpacity 
          style={[styles.aiBanner, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]} 
          onPress={() => router.push('/sentence-builder' as any)}
        >
          <View style={[styles.aiIconContainer, { backgroundColor: theme.primary }]}>
            <BrainCircuit size={20} color="#fff" />
          </View>
          <View style={styles.aiTextContainer}>
            <Text style={[styles.aiTitle, { color: theme.text }]}>AI Sentence Builder</Text>
            <Text style={[styles.aiDescription, { color: theme.text + '99' }]}>Learn grammar & practice creating sentences</Text>
          </View>
        </TouchableOpacity>
      )}

      {searchQuery ? (
        <FlatList
          data={filteredWords}
          renderItem={renderSearchItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: theme.text + '60' }}>No words found.</Text>
          }
        />
      ) : (
        <FlatList
          data={mergedData}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  countContainer: {
    alignItems: 'flex-end',
  },
  count: {
    fontSize: 12,
    marginTop: 4,
  },
  learnedCount: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  header: {
    padding: 16,
    paddingBottom: 0,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50, // Fixed height for better touch target
    borderRadius: 12,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%', // Fill the container height
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  searchResultDutch: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchResultEnglish: {
    fontSize: 14,
    marginTop: 2,
  },
  searchResultCategory: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-end', // Align button to the right
  },
  importButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aiDescription: {
    fontSize: 14,
  }
});
