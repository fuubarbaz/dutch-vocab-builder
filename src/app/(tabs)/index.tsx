import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Text, View } from 'react-native';
import { useFavorites } from '@/context/FavoritesContext';
import { Link, useRouter } from 'expo-router';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { LucideIcon, Hand, Hash, Utensils, Book, Home, ShoppingCart, Bus, HeartPulse, Shirt, Briefcase, Cloud, Languages, MessageCircle, Smile } from 'lucide-react-native';

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
};

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { customWords } = useFavorites();

  const mergedData = VOCABULARY_DATA.map(category => {
    const categoryCustomWords = customWords.filter(cw => cw.categoryId === category.id);
    return {
      ...category,
      words: [...category.words, ...categoryCustomWords]
    };
  });

  const renderItem = ({ item }: { item: typeof VOCABULARY_DATA[0] }) => {
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
        <Text style={[styles.count, { color: theme.text + '60' }]}>{item.words.length} words</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={mergedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
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
  count: {
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});
