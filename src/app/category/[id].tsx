import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import { useFavorites } from '@/context/FavoritesContext';
import { useSettings } from '@/context/SettingsContext';
import SwipeDeck from '@/components/SwipeDeck';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { LucideIcon, Volume2, Heart, Book, Octagon } from 'lucide-react-native';
import { speak } from '@/utils/tts';

const iconMap: Record<string, LucideIcon> = {
    'Book': Book,
    'Octagon': Octagon,
};

export default function CategoryScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { customWords, learnedIds, toggleFavorite, isFavorite } = useFavorites();
    const { showFlashcards, speechRate } = useSettings();
    const [playingId, setPlayingId] = React.useState<string | null>(null);

    const staticCategory = React.useMemo(() => {
        let found = VOCABULARY_DATA.find((c) => c.id === id);
        if (found) return found;

        // Search in subcategories if not found at top level
        for (const category of VOCABULARY_DATA) {
            if (category.subCategories) {
                found = category.subCategories.find((sub) => sub.id === id);
                if (found) return found;
            }
        }

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

    // Hooks hoisted to top


    const playAudio = async (text: string, id: string) => {
        try {
            setPlayingId(id);
            await speak(text, speechRate);
        } catch (e) {
            console.error(e);
        } finally {
            setPlayingId(null);
        }
    };

    const renderListItem = ({ item }: { item: typeof VOCABULARY_DATA[0]['words'][0] }) => {
        const isFav = isFavorite(item.id);
        const isPlaying = playingId === item.id;

        return (
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.wordContainer}>
                        <Text style={[styles.dutchWord, { color: theme.text }]}>{item.dutch}</Text>
                        <TouchableOpacity onPress={() => playAudio(item.dutch, item.id)} style={styles.audioButton}>
                            <Volume2 size={20} color={isPlaying ? theme.primary : theme.text} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                        <Heart size={20} color={isFav ? '#FF3B30' : theme.text + '40'} fill={isFav ? '#FF3B30' : 'transparent'} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.englishWord, { color: theme.text + 'CC' }]}>{item.english}</Text>

                {(item.exampleDutch || item.exampleEnglish) && (
                    <View style={[styles.examples, { backgroundColor: theme.background }]}>
                        {item.exampleDutch ? <Text style={[styles.exampleText, { color: theme.text }]}>{item.exampleDutch}</Text> : null}
                        {item.exampleEnglish ? <Text style={[styles.exampleTranslation, { color: theme.text + '80' }]}>{item.exampleEnglish}</Text> : null}
                    </View>
                )}
            </View>
        );
    };

    const renderSubcategoryItem = ({ item }: { item: typeof VOCABULARY_DATA[0] }) => {
        const Icon = iconMap[item.iconName] || Book;

        // Recursive word count helper for subcategories
        const getAllWords = (cat: any): any[] => {
            let words = [...cat.words];
            if (cat.subCategories) {
                cat.subCategories.forEach((sub: any) => {
                    words = [...words, ...getAllWords(sub)];
                });
            }
            return words;
        };

        const allCatWords = getAllWords(item);
        const learnedCount = allCatWords.filter(word => learnedIds.includes(word.id)).length;
        const totalCount = allCatWords.length;
        const remainingCount = totalCount - learnedCount;
        const percentage = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: colorScheme === 'light' ? '#f3f4f6' : theme.cardBackground,
                        flexDirection: 'row',
                        alignItems: 'center',
                    },
                ]}
                onPress={() => router.push(`/category/${item.id}`)}
            >
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Icon size={24} color={theme.primary} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.description, { color: theme.text + '99' }]}>{item.description}</Text>
                </View>
                <View style={styles.countContainer}>
                    <Text style={[styles.count, { color: theme.text + '60' }]}>
                        {remainingCount} {remainingCount === 1 ? 'flash card' : 'flash cards'}
                    </Text>
                    {learnedCount > 0 && (
                        <Text style={[styles.learnedCount, { color: theme.primary }]}>
                            {percentage}% complete
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ title: staticCategory.title }} />

            {staticCategory.subCategories && staticCategory.subCategories.length > 0 ? (
                <FlatList
                    data={staticCategory.subCategories}
                    renderItem={renderSubcategoryItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                />
            ) : showFlashcards ? (
                <SwipeDeck words={sessionWords} />
            ) : (
                <FlatList
                    data={sessionWords}
                    renderItem={renderListItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={{ color: theme.text + '80' }}>No words to show.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    wordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    dutchWord: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    audioButton: {
        padding: 4,
    },
    englishWord: {
        fontSize: 16,
        marginBottom: 12,
    },
    examples: {
        padding: 12,
        borderRadius: 8,
    },
    exampleText: {
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    exampleTranslation: {
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
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
    }
});
