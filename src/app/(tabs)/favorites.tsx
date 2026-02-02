import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Text, View, Alert, Pressable, Platform } from 'react-native';
import { useFavorites } from '@/context/FavoritesContext';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Trash2, CheckCircle2, Circle } from 'lucide-react-native';

export default function FavoritesScreen() {
  const { favorites, toggleFavorite, clearFavorites, removeFavorites } = useFavorites();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Flatten words and filter by favorites
  const favoriteWords = VOCABULARY_DATA
    .flatMap((cat) => cat.words)
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
  }

  const handleDeleteSelected = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Remove ${selectedIds.length} items from favorites?`)) {
        removeFavorites(selectedIds);
        exitSelectionMode();
      }
    } else {
      Alert.alert(
        'Delete Selected',
        `Remove ${selectedIds.length} items from favorites?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete', style: 'destructive', onPress: async () => {
              await removeFavorites(selectedIds);
              exitSelectionMode();
            }
          },
        ]
      );
    }
  }

  const handleClearAll = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to remove all favorites?')) {
        clearFavorites();
      }
    } else {
      Alert.alert(
        'Delete All Favorites',
        'Are you sure you want to remove all favorites?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: clearFavorites },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {favoriteWords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>No favorites yet.</Text>
          <Text style={[styles.emptySubText, { color: theme.text + '99' }]}>
            Swipe right on flashcards to add them here.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.headerActions}>
            {isSelectionMode ? (
              <View style={styles.selectionHeader}>
                <TouchableOpacity onPress={exitSelectionMode} style={styles.cancelButton}>
                  <Text style={{ color: theme.text }}>Cancel</Text>
                </TouchableOpacity>

                <Text style={{ color: theme.text, fontWeight: 'bold' }}>{selectedIds.length} Selected</Text>

                <TouchableOpacity
                  onPress={handleDeleteSelected}
                  disabled={selectedIds.length === 0}
                  style={[styles.actionButton, { backgroundColor: theme.danger, opacity: selectedIds.length === 0 ? 0.5 : 1 }]}
                >
                  <Text style={styles.buttonText}>Delete Selected</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.defaultHeader}>
                <Text style={{ color: theme.text + '80', fontStyle: 'italic', fontSize: 12 }}>Long press to select items</Text>
                <TouchableOpacity
                  onPress={handleClearAll}
                  style={[styles.actionButton, { backgroundColor: theme.danger }]}
                >
                  <Text style={styles.buttonText}>Delete All</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <FlatList
            data={favoriteWords}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <Pressable
                  onLongPress={() => handleLongPress(item.id)}
                  onPress={() => handlePress(item.id)}
                  delayLongPress={300}
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.cardBackground,
                      shadowColor: theme.text,
                      borderColor: isSelected ? theme.primary : 'transparent',
                      borderWidth: 2
                    }
                  ]}
                >
                  <View style={styles.cardContent}>
                    {isSelectionMode && (
                      <View style={styles.checkboxContainer}>
                        {isSelected ?
                          <CheckCircle2 size={24} color={theme.primary} /> :
                          <Circle size={24} color={theme.text + '40'} />
                        }
                      </View>
                    )}

                    <View style={{ flex: 1 }}>
                      <View style={styles.cardHeader}>
                        <Text style={[styles.dutch, { color: theme.primary }]}>{item.dutch}</Text>
                        {!isSelectionMode && (
                          <TouchableOpacity onPress={() => toggleFavorite(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Trash2 size={20} color={theme.danger} />
                          </TouchableOpacity>
                        )}
                      </View>

                      <Text style={[styles.english, { color: theme.text }]}>{item.english}</Text>
                      <View style={styles.divider} />
                      <Text style={[styles.example, { color: theme.text + '99' }]}>{item.exampleDutch}</Text>
                      <Text style={[styles.exampleTranslation, { color: theme.text + '60' }]}>{item.exampleEnglish}</Text>
                    </View>
                  </View>
                </Pressable>
              )
            }}
          />
        </>
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
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: 'center',
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dutch: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  english: {
    fontSize: 16,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    opacity: 0.2,
    marginBottom: 12,
  },
  example: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  exampleTranslation: {
    fontSize: 14,
  },
  headerActions: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  defaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelButton: {
    padding: 8,
  }
});
