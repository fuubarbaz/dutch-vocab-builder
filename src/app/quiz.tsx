import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, Dimensions, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import { TRAFFIC_CATEGORIES } from '@/data/traffic_categories';
import { Word } from '@/types';

type Question = {
    targetWord: Word;
    options: Word[];
    correctIndex: number;
};

export default function QuizScreen() {
    const { domain, category, count } = useLocalSearchParams<{ domain: string; category: string; count: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const targetCount = parseInt(count || '10', 10);

    // 1. Data Processing State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);

    // 2. Interaction State
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    // 1. Full Pool for distractors — strictly scoped to the domain
    const fullDomainPool = useMemo(() => {
        if (domain === 'traffic') {
            return TRAFFIC_CATEGORIES.flatMap(c => c.words);
        }
        // Exclude traffic signs from vocab/KNM distractor pool
        return VOCABULARY_DATA
            .filter(c => c.id !== 'traffic_signs_parent')
            .flatMap(c => c.words);
    }, [domain]);

    // 2. Filtered Pool for targets (specific category)
    const targetWords = useMemo(() => {
        if (domain === 'traffic') {
            if (category === 'All Categories') return fullDomainPool;
            const cat = TRAFFIC_CATEGORIES.find(c => c.title === category);
            return cat ? cat.words : [];
        }
        // Non-traffic: exclude traffic signs from target pool too
        const vocabData = VOCABULARY_DATA.filter(c => c.id !== 'traffic_signs_parent');
        if (category === 'All Categories') return fullDomainPool;
        const specificCat = vocabData.find(c => c.title === category);
        return specificCat ? specificCat.words : [];
    }, [domain, category, fullDomainPool]);

    // Generate Questions on Mount
    useEffect(() => {
        if (fullDomainPool.length < 4) {
            console.warn("Not enough words in this domain to generate a 4-option quiz.");
            setIsFinished(true);
            return;
        }

        // Shuffle and pick N target words from the category
        const shuffledTargets = [...targetWords].sort(() => 0.5 - Math.random());
        const selectedTargets = shuffledTargets.slice(0, Math.min(targetCount, shuffledTargets.length));

        const generatedQuestions = selectedTargets.map((target) => {
            // Pick 3 random wrong answers from the FULL domain
            // Criteria: 
            // 1. Not the same ID
            // 2. Different Dutch text (case insensitive)
            // 3. Different English text (case insensitive)
            const wrongAnswers = fullDomainPool
                .filter(w =>
                    w.id !== target.id &&
                    w.dutch.toLowerCase().trim() !== target.dutch.toLowerCase().trim() &&
                    w.english.toLowerCase().trim() !== target.english.toLowerCase().trim()
                )
                .sort(() => 0.5 - Math.random())
                // Ensure unique labels within the distractor set too
                .reduce((acc, current) => {
                    const isDuplicate = acc.some(a =>
                        a.dutch.toLowerCase().trim() === current.dutch.toLowerCase().trim() ||
                        a.english.toLowerCase().trim() === current.english.toLowerCase().trim()
                    );
                    if (!isDuplicate && acc.length < 3) {
                        acc.push(current);
                    }
                    return acc;
                }, [] as Word[]);

            // Combine and shuffle the options
            const options = [target, ...wrongAnswers].sort(() => 0.5 - Math.random());
            const correctIndex = options.findIndex(o => o.id === target.id);

            return { targetWord: target, options, correctIndex };
        });

        setQuestions(generatedQuestions);
    }, [targetWords, fullDomainPool, targetCount]);

    const handleSelectOption = (index: number) => {
        if (selectedOptionIndex !== null) return; // Prevent multiple clicks

        setSelectedOptionIndex(index);
        if (index === questions[currentQIndex].correctIndex) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setSelectedOptionIndex(null);
            setCurrentQIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    // --- Rendering UI ---

    if (questions.length === 0 && !isFinished) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
                <Text style={{ color: theme.text, textAlign: 'center' }}>Generating Quiz...</Text>
            </View>
        );
    }

    if (isFinished) {
        const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;
        const passed = percentage > 70;

        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.resultsContainer}>
                    <Text style={[styles.resultsTitle, { color: theme.text }]}>
                        {passed ? 'Awesome Job!' : 'Practice Makes Perfect!'}
                    </Text>
                    <Text style={[styles.scoreText, { color: theme.tint }]}>
                        {score} / {questions.length}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.text }]}>
                        ({percentage.toFixed(0)}%)
                    </Text>

                    {!passed && (
                        <Text style={[styles.feedbackText, { color: theme.text, opacity: 0.7 }]}>
                            Keep practicing to get better!
                        </Text>
                    )}

                    <Pressable
                        style={[styles.button, { backgroundColor: theme.tint, marginTop: 40 }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.buttonText}>Done</Text>
                    </Pressable>
                </View>

                {passed && (
                    <ConfettiCannon
                        count={150}
                        origin={{ x: Dimensions.get('window').width / 2, y: -20 }}
                        fallSpeed={3000}
                        fadeOut={true}
                    />
                )}
            </SafeAreaView>
        );
    }

    const currentQ = questions[currentQIndex];
    const hasAnswered = selectedOptionIndex !== null;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color={theme.text} />
                </Pressable>
                <Text style={[styles.progressText, { color: theme.text }]}>
                    Question {currentQIndex + 1} of {questions.length}
                </Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
                <View
                    style={[styles.progressBarFill, {
                        backgroundColor: theme.tint,
                        width: `${((currentQIndex) / questions.length) * 100}%`
                    }]}
                />
            </View>

            <View style={styles.quizContent}>
                {/* Image Prompt (If available) */}
                {currentQ.targetWord.imageAsset && (
                    <Image
                        source={currentQ.targetWord.imageAsset}
                        style={styles.quizImage}
                        resizeMode="contain"
                    />
                )}

                {/* Question Prompt */}
                <Text style={[styles.promptText, { color: theme.text, opacity: 0.6 }]}>
                    What is the meaning of:
                </Text>
                <Text style={[styles.targetWord, { color: theme.text }]}>
                    {currentQ.targetWord.dutch}
                </Text>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {currentQ.options.map((option, index) => {
                        let bgColor = theme.cardBackground;
                        let borderColor = 'transparent';

                        if (hasAnswered) {
                            if (index === currentQ.correctIndex) {
                                bgColor = '#d4edda'; // Green for correct
                                borderColor = '#28a745';
                            } else if (index === selectedOptionIndex) {
                                bgColor = '#f8d7da'; // Red for wrong selection
                                borderColor = '#dc3545';
                            }
                        } else if (selectedOptionIndex === index) {
                            bgColor = theme.tint; // Selected but not validated (not possible in instant mode, but good for structural readiness)
                        }

                        // For dark mode combatibility on the result colors
                        const isCorrectOption = hasAnswered && index === currentQ.correctIndex;
                        const isWrongSelection = hasAnswered && index === selectedOptionIndex && index !== currentQ.correctIndex;

                        return (
                            <Pressable
                                key={index}
                                style={[
                                    styles.optionCard,
                                    { backgroundColor: bgColor, borderColor: borderColor, borderWidth: 2 }
                                ]}
                                onPress={() => handleSelectOption(index)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    { color: isCorrectOption || isWrongSelection ? '#000' : theme.text }
                                ]}>
                                    {option.english}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Next Button */}
                {hasAnswered && (
                    <Pressable
                        style={[styles.button, { backgroundColor: theme.tint, position: 'absolute', bottom: 40, width: '100%' }]}
                        onPress={handleNext}
                    >
                        <Text style={styles.buttonText}>
                            {currentQIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
                        </Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    progressText: {
        fontSize: 16,
        fontWeight: '600',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#e0e0e0',
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
    },
    quizContent: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
    },
    quizImage: {
        width: 120,
        height: 120,
        marginBottom: 16,
    },
    promptText: {
        fontSize: 18,
        marginTop: 20,
        marginBottom: 8,
    },
    targetWord: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
    },
    optionsContainer: {
        width: '100%',
        gap: 16,
    },
    optionCard: {
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
    },
    button: {
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    resultsTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    scoreText: {
        fontSize: 64,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 24,
        marginBottom: 24,
    },
    feedbackText: {
        fontSize: 18,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
