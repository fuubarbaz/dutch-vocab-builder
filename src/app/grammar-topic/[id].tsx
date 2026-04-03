import { useState, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
    KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import AIModule from 'dutch-vocab-ai';
import { GRAMMAR_TOPICS, GrammarQuizQuestion } from '@/data/grammar_topics';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseGrammarResult(raw: string): { isCorrect: boolean; explanation: string } {
    const trimmed = raw.trim();
    const isCorrect = trimmed.toUpperCase().startsWith('CORRECT');
    const explanation = trimmed.replace(/^(CORRECT|INCORRECT)\s*/i, '').trim();
    return { isCorrect, explanation };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GrammarTopicScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const topic = GRAMMAR_TOPICS.find((t) => t.id === id);

    const [tab, setTab] = useState<'learn' | 'practice'>('learn');

    // Quiz state
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
    const [score, setScore] = useState(0);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);

    if (!topic) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Grammar' }} />
                <View style={styles.center}>
                    <Text style={styles.errorText}>Topic not found.</Text>
                </View>
            </View>
        );
    }

    const questions = topic.quizQuestions;
    const currentQ = questions[currentQIndex];
    const levelColor = topic.level === 'basic' ? '#10b981' : '#6366f1';

    // -------------------------------------------------------------------
    // Quiz logic
    // -------------------------------------------------------------------

    const evaluateMultipleChoice = (optionIndex: number) => {
        if (feedback) return;
        setSelectedOption(optionIndex);
        const selected = currentQ.options![optionIndex];
        const isCorrect = selected === currentQ.correctAnswer;
        setFeedback({ isCorrect, explanation: currentQ.explanation });
        setAnsweredCount((c) => c + 1);
        if (isCorrect) setScore((s) => s + 1);
    };

    const evaluateFillBlank = () => {
        if (!userAnswer.trim() || feedback) return;
        const normalized = userAnswer.trim().toLowerCase();
        const expected = currentQ.correctAnswer.toLowerCase();
        const isCorrect = normalized === expected;
        setFeedback({ isCorrect, explanation: currentQ.explanation });
        setAnsweredCount((c) => c + 1);
        if (isCorrect) setScore((s) => s + 1);
    };

    const evaluateTranslate = async () => {
        if (!userAnswer.trim() || feedback) return;
        setIsEvaluating(true);
        try {
            const prompt = `[grammar-check] Check this Dutch sentence: "${userAnswer}" (expected translation of: "${currentQ.prompt}". Acceptable answer: "${currentQ.correctAnswer}")`;
            const raw = await AIModule.generateTextAsync(prompt);
            const result = parseGrammarResult(raw);
            setFeedback(result);
            setAnsweredCount((c) => c + 1);
            if (result.isCorrect) setScore((s) => s + 1);
        } catch {
            // Fallback: simple comparison
            const normalized = userAnswer.trim().toLowerCase().replace(/[.!?]/g, '');
            const expected = currentQ.correctAnswer.toLowerCase().replace(/[.!?]/g, '');
            const isCorrect = normalized === expected;
            setFeedback({ isCorrect, explanation: currentQ.explanation });
            setAnsweredCount((c) => c + 1);
            if (isCorrect) setScore((s) => s + 1);
        } finally {
            setIsEvaluating(false);
        }
    };

    const nextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex((i) => i + 1);
            setSelectedOption(null);
            setUserAnswer('');
            setFeedback(null);
        } else {
            setQuizFinished(true);
        }
    };

    const resetQuiz = () => {
        setCurrentQIndex(0);
        setSelectedOption(null);
        setUserAnswer('');
        setFeedback(null);
        setScore(0);
        setAnsweredCount(0);
        setQuizFinished(false);
    };

    const speakDutch = useCallback((text: string) => {
        Speech.speak(text, { language: 'nl-NL', rate: 0.8 });
    }, []);

    // -------------------------------------------------------------------
    // Render Learn Tab
    // -------------------------------------------------------------------

    const renderLearn = () => (
        <ScrollView contentContainerStyle={styles.tabContent}>
            {/* Explanation */}
            <View style={styles.card}>
                <Text style={styles.sectionLabel}>EXPLANATION</Text>
                <Text style={styles.explanationText}>{topic.explanation}</Text>
            </View>

            {/* Key Rules */}
            <View style={styles.card}>
                <Text style={styles.sectionLabel}>KEY RULES</Text>
                {topic.keyRules.map((rule, idx) => (
                    <View key={idx} style={styles.ruleRow}>
                        <View style={[styles.ruleBullet, { backgroundColor: levelColor }]} />
                        <Text style={styles.ruleText}>{rule}</Text>
                    </View>
                ))}
            </View>

            {/* Examples */}
            <View style={styles.card}>
                <Text style={styles.sectionLabel}>EXAMPLES</Text>
                {topic.examples.map((ex, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={styles.exampleRow}
                        onPress={() => speakDutch(ex.dutch)}
                        activeOpacity={0.7}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.dutchText}>{ex.dutch}</Text>
                            <Text style={styles.englishText}>{ex.english}</Text>
                        </View>
                        <Ionicons name="volume-medium-outline" size={20} color={levelColor} />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Start Quiz CTA */}
            <TouchableOpacity
                style={[styles.ctaButton, { backgroundColor: levelColor }]}
                onPress={() => { resetQuiz(); setTab('practice'); }}
            >
                <Ionicons name="school-outline" size={20} color="white" />
                <Text style={styles.ctaText}>Start Practice Quiz</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    // -------------------------------------------------------------------
    // Render Practice Tab
    // -------------------------------------------------------------------

    const renderQuizFinished = () => (
        <View style={styles.finishedCard}>
            <Ionicons
                name={score >= questions.length * 0.7 ? 'trophy' : 'refresh-circle'}
                size={48}
                color={score >= questions.length * 0.7 ? '#f59e0b' : '#6b7280'}
            />
            <Text style={styles.finishedTitle}>
                {score >= questions.length * 0.7 ? 'Great Job!' : 'Keep Practicing!'}
            </Text>
            <Text style={styles.finishedScore}>
                {score} / {questions.length} correct
            </Text>
            <View style={styles.finishedActions}>
                <TouchableOpacity style={[styles.finishedBtn, { backgroundColor: levelColor }]} onPress={resetQuiz}>
                    <Text style={styles.finishedBtnText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.finishedBtn, { backgroundColor: '#e5e7eb' }]} onPress={() => setTab('learn')}>
                    <Text style={[styles.finishedBtnText, { color: '#374151' }]}>Review Lesson</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderQuestion = (q: GrammarQuizQuestion) => {
        if (q.type === 'multiple_choice') {
            return (
                <View>
                    <Text style={styles.questionPrompt}>{q.prompt}</Text>
                    {q.options!.map((opt, idx) => {
                        let optionStyle = styles.optionDefault;
                        if (feedback && idx === selectedOption) {
                            optionStyle = feedback.isCorrect ? styles.optionCorrect : styles.optionIncorrect;
                        }
                        if (feedback && opt === q.correctAnswer && !feedback.isCorrect) {
                            optionStyle = styles.optionCorrect;
                        }
                        return (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.optionButton, optionStyle]}
                                onPress={() => evaluateMultipleChoice(idx)}
                                disabled={!!feedback}
                            >
                                <Text style={[
                                    styles.optionText,
                                    feedback && (idx === selectedOption || opt === q.correctAnswer) && { color: 'white' },
                                ]}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            );
        }

        // fill_blank and translate
        return (
            <View>
                <Text style={styles.questionPrompt}>{q.prompt}</Text>
                {q.hint && !feedback && (
                    <Text style={styles.hintText}>Hint: {q.hint}</Text>
                )}
                <TextInput
                    style={[styles.answerInput, feedback && (feedback.isCorrect ? styles.inputCorrect : styles.inputIncorrect)]}
                    placeholder={q.type === 'fill_blank' ? 'Type the missing word...' : 'Type your Dutch translation...'}
                    placeholderTextColor="#9ca3af"
                    value={userAnswer}
                    onChangeText={setUserAnswer}
                    editable={!feedback && !isEvaluating}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={() => q.type === 'translate' ? evaluateTranslate() : evaluateFillBlank()}
                />
                {!feedback && (
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: levelColor }, (!userAnswer.trim() || isEvaluating) && styles.btnDisabled]}
                        onPress={() => q.type === 'translate' ? evaluateTranslate() : evaluateFillBlank()}
                        disabled={!userAnswer.trim() || isEvaluating}
                    >
                        {isEvaluating ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitBtnText}>Check Answer</Text>
                        )}
                    </TouchableOpacity>
                )}
                {feedback && !feedback.isCorrect && (
                    <Text style={styles.correctAnswerText}>Correct answer: {q.correctAnswer}</Text>
                )}
            </View>
        );
    };

    const renderPractice = () => {
        if (quizFinished) {
            return <ScrollView contentContainerStyle={styles.tabContent}>{renderQuizFinished()}</ScrollView>;
        }

        return (
            <ScrollView contentContainerStyle={styles.tabContent} keyboardShouldPersistTaps="handled">
                {/* Progress */}
                <View style={styles.progressRow}>
                    <Text style={styles.progressText}>
                        Question {currentQIndex + 1} of {questions.length}
                    </Text>
                    <Text style={styles.scoreText}>{score} correct</Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${((currentQIndex) / questions.length) * 100}%`, backgroundColor: levelColor }]} />
                </View>

                {/* Question Type Badge */}
                <View style={styles.typeBadgeRow}>
                    <View style={[styles.typeBadge, {
                        backgroundColor: currentQ.type === 'multiple_choice' ? '#dbeafe' : currentQ.type === 'fill_blank' ? '#fef3c7' : '#ede9fe',
                    }]}>
                        <Text style={[styles.typeBadgeText, {
                            color: currentQ.type === 'multiple_choice' ? '#1e40af' : currentQ.type === 'fill_blank' ? '#92400e' : '#5b21b6',
                        }]}>
                            {currentQ.type === 'multiple_choice' ? 'MULTIPLE CHOICE' : currentQ.type === 'fill_blank' ? 'FILL IN THE BLANK' : 'TRANSLATE'}
                        </Text>
                    </View>
                </View>

                {/* Question Card */}
                <View style={styles.questionCard}>
                    {renderQuestion(currentQ)}
                </View>

                {/* Feedback */}
                {feedback && (
                    <View style={[styles.feedbackCard, feedback.isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
                        <View style={styles.feedbackHeader}>
                            <Ionicons
                                name={feedback.isCorrect ? 'checkmark-circle' : 'close-circle'}
                                size={22}
                                color={feedback.isCorrect ? '#16a34a' : '#dc2626'}
                            />
                            <Text style={[styles.feedbackTitle, { color: feedback.isCorrect ? '#16a34a' : '#dc2626' }]}>
                                {feedback.isCorrect ? 'Correct!' : 'Not quite right'}
                            </Text>
                        </View>
                        <Text style={styles.feedbackExplanation}>{feedback.explanation}</Text>

                        <TouchableOpacity
                            style={[styles.nextBtn, { backgroundColor: levelColor }]}
                            onPress={nextQuestion}
                        >
                            <Text style={styles.nextBtnText}>
                                {currentQIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                            </Text>
                            <Ionicons name="arrow-forward" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        );
    };

    // -------------------------------------------------------------------
    // Main render
    // -------------------------------------------------------------------

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Stack.Screen options={{ title: topic.title }} />

            {/* Tab Toggle */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'learn' && { backgroundColor: levelColor }]}
                    onPress={() => setTab('learn')}
                >
                    <Ionicons name="book-outline" size={18} color={tab === 'learn' ? 'white' : '#6b7280'} />
                    <Text style={[styles.tabBtnText, tab === 'learn' && { color: 'white' }]}>Learn</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'practice' && { backgroundColor: levelColor }]}
                    onPress={() => setTab('practice')}
                >
                    <Ionicons name="school-outline" size={18} color={tab === 'practice' ? 'white' : '#6b7280'} />
                    <Text style={[styles.tabBtnText, tab === 'practice' && { color: 'white' }]}>Practice</Text>
                </TouchableOpacity>
            </View>

            {tab === 'learn' ? renderLearn() : renderPractice()}
        </KeyboardAvoidingView>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorText: { fontSize: 16, color: '#6b7280' },

    // Tab bar
    tabBar: {
        flexDirection: 'row',
        padding: 16,
        paddingBottom: 8,
        gap: 10,
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#e5e7eb',
    },
    tabBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#6b7280',
    },

    // Tab content
    tabContent: {
        padding: 16,
        paddingTop: 8,
        paddingBottom: 40,
    },

    // Cards
    card: {
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 18,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#9ca3af',
        letterSpacing: 1,
        marginBottom: 10,
    },

    // Explanation
    explanationText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 24,
    },

    // Key Rules
    ruleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    ruleBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 7,
        marginRight: 10,
    },
    ruleText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        lineHeight: 21,
    },

    // Examples
    exampleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    dutchText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    englishText: {
        fontSize: 13,
        color: '#6b7280',
    },

    // CTA
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    ctaText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Quiz progress
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressText: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
    scoreText: { fontSize: 13, color: '#10b981', fontWeight: '700' },
    progressBar: {
        height: 6,
        backgroundColor: '#e5e7eb',
        borderRadius: 3,
        marginBottom: 16,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },

    // Type badge
    typeBadgeRow: { marginBottom: 12 },
    typeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    // Question card
    questionCard: {
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 18,
        marginBottom: 14,
    },
    questionPrompt: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1f2937',
        lineHeight: 25,
        marginBottom: 16,
    },
    hintText: {
        fontSize: 13,
        color: '#9ca3af',
        fontStyle: 'italic',
        marginBottom: 12,
    },

    // Multiple choice options
    optionButton: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
    },
    optionDefault: {
        backgroundColor: '#f9fafb',
        borderColor: '#e5e7eb',
    },
    optionCorrect: {
        backgroundColor: '#16a34a',
        borderColor: '#16a34a',
    },
    optionIncorrect: {
        backgroundColor: '#dc2626',
        borderColor: '#dc2626',
    },
    optionText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#374151',
    },

    // Fill blank / translate input
    answerInput: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: '#111827',
        marginBottom: 12,
    },
    inputCorrect: { borderColor: '#16a34a', borderWidth: 2 },
    inputIncorrect: { borderColor: '#dc2626', borderWidth: 2 },
    submitBtn: {
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
    },
    btnDisabled: { backgroundColor: '#9ca3af' },
    submitBtnText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
    },
    correctAnswerText: {
        fontSize: 14,
        color: '#16a34a',
        fontWeight: '600',
        marginTop: 8,
    },

    // Feedback
    feedbackCard: {
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        marginBottom: 14,
    },
    feedbackCorrect: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
    feedbackIncorrect: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
    feedbackHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    feedbackTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    feedbackExplanation: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 22,
        marginBottom: 14,
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 10,
    },
    nextBtnText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Quiz finished
    finishedCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        marginTop: 20,
    },
    finishedTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 12,
    },
    finishedScore: {
        fontSize: 18,
        color: '#6b7280',
        marginTop: 4,
        marginBottom: 24,
    },
    finishedActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    finishedBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    finishedBtnText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
