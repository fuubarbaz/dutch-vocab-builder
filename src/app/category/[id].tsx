import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import { useFavorites } from '@/context/FavoritesContext';
import SwipeDeck from '@/components/SwipeDeck';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function CategoryScreen() {
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { customWords, learnedIds } = useFavorites();

    const staticCategory = VOCABULARY_DATA.find((c) => c.id === id);

    if (!staticCategory) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Category not found.</Text>
            </View>
        );
    }

    const categoryCustomWords = customWords.filter(cw => cw.categoryId === id);
    const allWords = [...staticCategory.words, ...categoryCustomWords];
    const unlearnedWords = allWords.filter(word => !learnedIds.includes(word.id));

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ title: staticCategory.title }} />
            <SwipeDeck words={unlearnedWords} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
