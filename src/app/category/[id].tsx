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

    const staticCategory = React.useMemo(() => {
        const found = VOCABULARY_DATA.find((c) => c.id === id);
        if (found) return found;

        if (id === 'imported') {
            return {
                id: 'imported',
                title: 'Imported Words',
                titleDutch: 'Geïmporteerde Woorden',
                description: 'Words added from CSV',
                iconName: 'Upload',
                words: []
            };
        }
        return undefined;
    }, [id]);

    if (!staticCategory) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Category not found.</Text>
            </View>
        );
    }

    const [sessionWords, setSessionWords] = React.useState<typeof VOCABULARY_DATA[0]['words'] | null>(null);

    React.useEffect(() => {
        if (staticCategory) {
            const categoryCustomWords = customWords.filter(cw => cw.categoryId === id);
            const allWords = [...staticCategory.words, ...categoryCustomWords];
            // Filter unlearned words ONCE when entering the screen
            const unlearned = allWords.filter(word => !learnedIds.includes(word.id));
            setSessionWords(unlearned);
        }
    }, [id, staticCategory]); // Intentionally omit learnedIds so we don't re-filter on every swipe

    if (!staticCategory || !sessionWords) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Optional: Add a loading spinner here */}
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ title: staticCategory.title }} />
            <SwipeDeck words={sessionWords} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
