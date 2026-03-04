import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import { TRAFFIC_CATEGORIES } from '@/data/traffic_categories';

export default function PracticeScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const [selectedDomain, setSelectedDomain] = useState<'vocabulary' | 'traffic'>('vocabulary');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');

    // Dynamically update categories based on selected domain
    const currentCategories = selectedDomain === 'vocabulary' ? VOCABULARY_DATA : TRAFFIC_CATEGORIES;
    const allCategories = [
        { title: 'All Categories' },
        ...currentCategories,
    ];
    const [questionCount, setQuestionCount] = useState(10);
    const counts = [5, 10, 15, 20];

    const startQuiz = () => {
        // Pass config directly as params to the quiz screen
        router.push({
            pathname: '/quiz',
            params: {
                domain: selectedDomain,
                category: selectedCategory,
                count: questionCount.toString(),
            },
        });
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.card, { backgroundColor: theme.cardBackground, shadowColor: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                <Text style={[styles.headerText, { color: theme.text }]}>Quiz Configuration</Text>

                {/* Domain Selection */}
                <View style={styles.domainToggleContainer}>
                    <Pressable
                        style={[
                            styles.domainToggleBtn,
                            selectedDomain === 'vocabulary' ? { backgroundColor: theme.tint } : { backgroundColor: theme.background }
                        ]}
                        onPress={() => {
                            setSelectedDomain('vocabulary');
                            setSelectedCategory('All Categories');
                        }}
                    >
                        <Text style={[
                            styles.domainToggleText,
                            { color: selectedDomain === 'vocabulary' ? '#fff' : theme.text }
                        ]}>Vocabulary</Text>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.domainToggleBtn,
                            selectedDomain === 'traffic' ? { backgroundColor: theme.tint } : { backgroundColor: theme.background }
                        ]}
                        onPress={() => {
                            setSelectedDomain('traffic');
                            setSelectedCategory('All Categories');
                        }}
                    >
                        <Text style={[
                            styles.domainToggleText,
                            { color: selectedDomain === 'traffic' ? '#fff' : theme.text }
                        ]}>Traffic Signs</Text>
                    </Pressable>
                </View>

                {/* Category Selection */}
                <Text style={[styles.label, { color: theme.text, marginTop: 16 }]}>Select Category:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                    {allCategories.map((cat, index) => (
                        <Pressable
                            key={index}
                            style={[
                                styles.chip,
                                { backgroundColor: theme.background },
                                selectedCategory === cat.title && { backgroundColor: theme.tint }
                            ]}
                            onPress={() => setSelectedCategory(cat.title)}
                        >
                            <Text style={[
                                styles.chipText,
                                { color: theme.text },
                                selectedCategory === cat.title && { color: '#fff' }
                            ]}>
                                {cat.title}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* Question Count Selection */}
                <Text style={[styles.label, { color: theme.text, marginTop: 24 }]}>Number of Questions:</Text>
                <View style={styles.row}>
                    {counts.map((count) => (
                        <Pressable
                            key={count}
                            style={[
                                styles.chip,
                                { backgroundColor: theme.background, minWidth: 60, alignItems: 'center' },
                                questionCount === count && { backgroundColor: theme.tint }
                            ]}
                            onPress={() => setQuestionCount(count)}
                        >
                            <Text style={[
                                styles.chipText,
                                { color: theme.text },
                                questionCount === count && { color: '#fff' }
                            ]}>
                                {count}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Start Button */}
                <Pressable
                    style={[styles.startButton, { backgroundColor: theme.tint }]}
                    onPress={startQuiz}
                >
                    <Text style={styles.startText}>Start Quiz</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 32,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    selectorScroll: {
        flexGrow: 0,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 12,
    },
    chipText: {
        fontSize: 15,
        fontWeight: '500',
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 32,
    },
    startText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    domainToggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        padding: 4,
        marginBottom: 8,
    },
    domainToggleBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    domainToggleText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
