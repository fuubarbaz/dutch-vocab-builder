import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Text, View, Alert, Pressable, Platform } from 'react-native';
import { useFavorites } from '@/context/FavoritesContext';
import { useRouter } from 'expo-router';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Trash2, CheckCircle2, Circle, Heart, X, Zap } from 'lucide-react-native';

export default function FavoritesScreen() {
  const { favorites, toggleFavorite, clearFavorites, removeFavorites } = useFavorites();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const getAllWords = (cat: (typeof VOCABULARY_DATA)[0]): (typeof VOCABULARY_DATA)[0]['words'] => {
    const words = [...cat.words];
    if (cat.subCategories) {
      cat.subCategories.forEach(sub => words.push(...getAllWords(sub)));
    }
    return words;
  };

  const favoriteWords = VOCABULARY_DATA
    .flatMap(getAllWords)
    .filter((word) => favorites.includes(word.id));

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleLongPress = (id: string) => {
    setIsSelectionMode(true);
    toggleSelection(id);
  };

  const handlePress = (id: string) => {
    if (isSelectionMode) {
      toggleSelection(id);
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Remove ${selectedIds.length} items from saved?`)) {
        removeFavorites(selectedIds);
        exitSelectionMode();
      }
    } else {
      Alert.alert(
        'Remove Selected',
        `Remove ${selectedIds.length} items from saved?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove', style: 'destructive', onPress: async () => {
              await removeFavorites(selectedIds);
              exitSelectionMode();
            }
          },
        ]
      );
    }
  };

  const handleClearAll = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Remove all saved words?')) {
        clearFavorites();
      }
    } else {
      Alert.alert(
        'Remove All',
        'Remove all saved words?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove All', style: 'destructive', onPress: clearFavorites },
        ]
      );
    }
  };

  if (favoriteWords.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.accentLight }]}>
            <Heart size={32} color={theme.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No saved words yet</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Double-tap flashcards to save them here for quick review.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header bar */}
      <View style={[styles.headerBar, { borderBottomColor: theme.divider }]}>
        {isSelectionMode ? (
          <>
            <TouchableOpacity onPress={exitSelectionMode} style={styles.headerAction}>
              <X size={20} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerCount, { color: theme.text }]}>
              {selectedIds.length} selected
            </Text>
            <TouchableOpacity
              onPress={handleDeleteSelected}
              disabled={selectedIds.length === 0}
              style={{ opacity: selectedIds.length === 0 ? 0.3 : 1 }}
            >
              <Text style={[styles.headerActionText, { color: theme.danger }]}>Remove</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.headerInfo, { color: theme.textSecondary }]}>
              {favoriteWords.length} {favoriteWords.length === 1 ? 'word' : 'words'}
            </Text>
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={[styles.headerActionText, { color: theme.danger }]}>Clear All</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Practice saved words CTA */}
      {!isSelectionMode && (
        <TouchableOpacity
          style={[styles.practiceButton, { backgroundColor: theme.primary }]}
          onPress={() =>
            router.push({
              pathname: '/vocab-session' as any,
              params: { category: 'Saved Words', mode: 'all', count: '20' },
            })
          }
          activeOpacity={0.85}
        >
          <Zap size={18} color="#fff" />
          <Text style={styles.practiceButtonText}>Practice Saved Words</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={favoriteWords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <Pressable
              onLongPress={() => handleLongPress(item.id)}
              onPress={() => handlePress(item.id)}
              delayLongPress={300}
              style={[
                styles.card,
                { backgroundColor: theme.cardBackground },
                isSelected && { backgroundColor: theme.primary + '08' },
              ]}
            >
              {isSelectionMode && (
                <View style={styles.checkbox}>
                  {isSelected ? (
                    <CheckCircle2 size={22} color={theme.primary} />
                  ) : (
                    <Circle size={22} color={theme.border} />
                  )}
                </View>
              )}

              <View style={{ flex: 1 }}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.dutch, { color: theme.primary }]}>{item.dutch}</Text>
                  {!isSelectionMode && (
                    <TouchableOpacity
                      onPress={() => toggleFavorite(item.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Trash2 size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.english, { color: theme.text }]}>{item.english}</Text>
                {item.exampleDutch ? (
                  <View style={[styles.exampleBlock, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.example, { color: theme.text }]}>{item.exampleDutch}</Text>
                    <Text style={[styles.exampleTranslation, { color: theme.textSecondary }]}>{item.exampleEnglish}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.title3,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.subhead,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Header bar
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerAction: {
    padding: Spacing.xs,
  },
  headerCount: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
  },
  headerInfo: {
    fontSize: FontSize.footnote,
  },
  headerActionText: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.medium,
  },
  // Practice button
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  practiceButtonText: {
    color: '#fff',
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
  },
  // List
  list: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
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
  checkbox: {
    marginRight: Spacing.md,
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dutch: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
  english: {
    fontSize: FontSize.subhead,
    marginBottom: Spacing.md,
  },
  exampleBlock: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  example: {
    fontSize: FontSize.footnote,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  exampleTranslation: {
    fontSize: FontSize.footnote,
  },
});
