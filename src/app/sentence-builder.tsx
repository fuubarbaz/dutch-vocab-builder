import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { ArrowRight, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react-native';
import AppleIntelligenceModule from '../../modules/apple-intelligence/index';

type GrammarExercise = {
    englishPrompt: string;
    expectedDutch: string[];
};

type GrammarRule = {
    id: string;
    title: string;
    description: string;
    keyword: string;
    exercises: GrammarExercise[];
};

const RULES: GrammarRule[] = [
    {
        id: 'sv',
        title: 'Subject + Verb',
        description: 'The most basic Dutch sentence starts with a subject followed by the verb.',
        keyword: 'subject+verb',
        exercises: [
            { englishPrompt: 'Translate: "I eat"', expectedDutch: ['ik', 'eet'] },
            { englishPrompt: 'Translate: "She walks"', expectedDutch: ['zij', 'loopt'] },
            { englishPrompt: 'Translate: "We read"', expectedDutch: ['wij', 'lezen'] }
        ]
    },
    {
        id: 'svo',
        title: 'Subject + Verb + Object',
        description: 'When adding an object, it comes after the verb.',
        keyword: 'object',
        exercises: [
            { englishPrompt: 'Translate: "I eat an apple"', expectedDutch: ['een appel', 'eet'] },
            { englishPrompt: 'Translate: "He drinks water"', expectedDutch: ['drinkt', 'water'] },
            { englishPrompt: 'Translate: "They buy a car"', expectedDutch: ['kopen', 'een auto'] }
        ]
    },
    {
        id: 'articles',
        title: 'Articles (de / het / een)',
        description: 'Dutch uses "de" and "het" for "the", and "een" for "a/an".',
        keyword: 'articles',
        exercises: [
            { englishPrompt: 'Translate: "I eat a pizza and the apple"', expectedDutch: ['een pizza', 'de appel'] },
            { englishPrompt: 'Translate: "The child sees a dog"', expectedDutch: ['het kind', 'een hond'] },
            { englishPrompt: 'Translate: "A man reads the book"', expectedDutch: ['een man', 'het boek'] }
        ]
    },
    {
        id: 'prepositions',
        title: 'Prepositions',
        description: 'Using prepositions like "in", "op", "met" (with).',
        keyword: 'prepositions',
        exercises: [
            { englishPrompt: 'Translate: "I eat with a fork"', expectedDutch: ['met', 'een vork'] },
            { englishPrompt: 'Translate: "The book is on the table"', expectedDutch: ['ligt', 'op de tafel'] },
            { englishPrompt: 'Translate: "We are in the house"', expectedDutch: ['zijn', 'in het huis'] }
        ]
    },
    {
        id: 'questions',
        title: 'Questions (Inversion)',
        description: 'To ask a question, invert the subject and the verb.',
        keyword: 'question',
        exercises: [
            { englishPrompt: 'Translate: "Do I eat an apple?"', expectedDutch: ['eet ik', 'een appel'] },
            { englishPrompt: 'Translate: "Is he reading a book?"', expectedDutch: ['leest hij', 'een boek'] },
            { englishPrompt: 'Translate: "Are we going home?"', expectedDutch: ['gaan wij', 'naar huis'] }
        ]
    },
    {
        id: 'time',
        title: 'Time expressions',
        description: 'Time expressions usually come immediately after the verb in Dutch.',
        keyword: 'time',
        exercises: [
            { englishPrompt: 'Translate: "I eat an apple today"', expectedDutch: ['vandaag', 'eet', 'een appel'] },
            { englishPrompt: 'Translate: "We are traveling tomorrow"', expectedDutch: ['reizen', 'morgen'] },
            { englishPrompt: 'Translate: "He works later"', expectedDutch: ['werkt', 'later'] }
        ]
    },
    {
        id: 'modal',
        title: 'Modal verbs',
        description: 'With modal verbs (can, want, must), the second verb goes to the very end of the sentence.',
        keyword: 'modal',
        exercises: [
            { englishPrompt: 'Translate: "I want to eat an apple"', expectedDutch: ['ik wil', 'eten'] },
            { englishPrompt: 'Translate: "You must do your homework"', expectedDutch: ['moet', 'maken', 'huiswerk'] },
            { englishPrompt: 'Translate: "We can swim"', expectedDutch: ['kunnen', 'zwemmen'] }
        ]
    },
    {
        id: 'separable',
        title: 'Separable verbs',
        description: 'The prefix of a separable verb goes to the end of the sentence.',
        keyword: 'separable',
        exercises: [
            { englishPrompt: 'Translate: "I invite him" (uitnodigen)', expectedDutch: ['ik nodig', 'uit'] },
            { englishPrompt: 'Translate: "He cleans up" (opruimen)', expectedDutch: ['hij ruimt', 'op'] },
            { englishPrompt: 'Translate: "We call back" (terugbellen)', expectedDutch: ['wij bellen', 'terug'] }
        ]
    },
    {
        id: 'past',
        title: 'Past tense',
        description: 'Using past tense (e.g., heb gegeten).',
        keyword: 'past',
        exercises: [
            { englishPrompt: 'Translate: "I have eaten an apple"', expectedDutch: ['heb', 'gegeten'] },
            { englishPrompt: 'Translate: "She has read a book"', expectedDutch: ['heeft', 'gelezen'] },
            { englishPrompt: 'Translate: "We have worked"', expectedDutch: ['hebben', 'gewerkt'] }
        ]
    },
    {
        id: 'conjunctions',
        title: 'Conjunctions',
        description: 'Subordinating conjunctions (omdat, dat) push the verb to the end.',
        keyword: 'conjunctions',
        exercises: [
            { englishPrompt: 'Translate: "I eat because I am hungry. (omdat, honger)"', expectedDutch: ['omdat', 'heb'] },
            { englishPrompt: 'Translate: "I know that he is coming"', expectedDutch: ['dat', 'komt'] },
            { englishPrompt: 'Translate: "We wait until it stops raining"', expectedDutch: ['totdat', 'stopt'] }
        ]
    }
];

export default function SentenceBuilderScreen() {
    const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);

    const currentRule = RULES[currentRuleIndex];
    const currentExercise = currentRule.exercises[currentExerciseIndex];

    const evaluateSentence = async () => {
        if (!userInput.trim()) return;
        
        setIsEvaluating(true);
        setFeedback(null);
        
        try {
            // Pass expected keywords so Swift can evaluate dynamically
            const expectedWords = currentExercise.expectedDutch.join(', ');
            const prompt = `User sentence: "${userInput}". Rule practicing: ${currentRule.keyword}. Expected keywords: [${expectedWords}]`;
            const result = await AppleIntelligenceModule.generateTextAsync(prompt);
            setFeedback(result);
        } catch (error) {
            console.error('Apple Intelligence Error:', error);
            setFeedback('Sorry, Apple Intelligence is currently unavailable. Please check your connection or simulator settings.');
        } finally {
            setIsEvaluating(false);
        }
    };

    const nextExercise = () => {
        // Pick a random exercise different from current
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * currentRule.exercises.length);
        } while (nextIndex === currentExerciseIndex && currentRule.exercises.length > 1);
        
        setCurrentExerciseIndex(nextIndex);
        setUserInput('');
        setFeedback(null);
    };

    const nextRule = () => {
        if (currentRuleIndex < RULES.length - 1) {
            setCurrentRuleIndex(currentRuleIndex + 1);
            setCurrentExerciseIndex(Math.floor(Math.random() * RULES[currentRuleIndex + 1].exercises.length));
            setUserInput('');
            setFeedback(null);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Stack.Screen options={{ title: 'Sentence Builder' }} />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* Rule Selector */}
                <View style={styles.selectorContainer}>
                    <Text style={styles.selectorTitle}>Select a Level to Practice:</Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        style={styles.chipScroll}
                        contentContainerStyle={styles.chipScrollContent}
                    >
                        {RULES.map((rule, idx) => (
                            <TouchableOpacity 
                                key={rule.id} 
                                style={[styles.chip, currentRuleIndex === idx && styles.chipActive]}
                                onPress={() => {
                                    setCurrentRuleIndex(idx);
                                    setCurrentExerciseIndex(Math.floor(Math.random() * rule.exercises.length));
                                    setUserInput('');
                                    setFeedback(null);
                                }}
                            >
                                <Text style={[styles.chipText, currentRuleIndex === idx && styles.chipTextActive]}>
                                    Level {idx + 1}: {rule.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Rule Header */}
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <BrainCircuit color="#3b82f6" size={24} />
                        <Text style={styles.cardTitle}>Level {currentRuleIndex + 1}: {currentRule.title}</Text>
                    </View>
                    <Text style={styles.description}>{currentRule.description}</Text>
                </View>

                {/* Practice Area */}
                <View style={styles.practiceCard}>
                    <Text style={styles.promptLabel}>Your Turn:</Text>
                    <Text style={styles.prompt}>{currentExercise.englishPrompt}</Text>
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Type your Dutch sentence here..."
                        value={userInput}
                        onChangeText={setUserInput}
                        multiline
                        returnKeyType="done"
                        onSubmitEditing={evaluateSentence}
                    />

                    <TouchableOpacity 
                        style={[styles.button, (!userInput.trim() || isEvaluating) && styles.buttonDisabled]} 
                        onPress={evaluateSentence}
                        disabled={!userInput.trim() || isEvaluating}
                    >
                        {isEvaluating ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Evaluate with Apple Intelligence</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Feedback Area */}
                {feedback && (
                    <View style={[styles.feedbackCard, feedback.includes('Sorry') ? styles.feedbackError : styles.feedbackSuccess]}>
                        <Text style={styles.feedbackTitle}>Feedback</Text>
                        <Text style={styles.feedbackText}>{feedback}</Text>
                        
                        {/* Only show next buttons if highly supervised mocked string implies success */}
                        {!feedback.includes('Sorry') && feedback.includes('!') && (
                            <View style={styles.actionsContainer}>
                                <TouchableOpacity style={styles.secondaryButton} onPress={nextExercise}>
                                    <Text style={styles.secondaryButtonText}>Practice More</Text>
                                </TouchableOpacity>
                                
                                {currentRuleIndex < RULES.length - 1 ? (
                                    <TouchableOpacity style={styles.nextButton} onPress={nextRule}>
                                        <Text style={styles.nextButtonText}>Next Level</Text>
                                        <ArrowRight color="white" size={16} />
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.completedBadge}>
                                        <CheckCircle2 color="#10b981" size={20} />
                                        <Text style={styles.completedText}>All Rules Mastered!</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    scrollContent: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginLeft: 10,
    },
    description: {
        fontSize: 16,
        color: '#4b5563',
        lineHeight: 24,
    },
    selectorContainer: {
        marginBottom: 20,
    },
    selectorTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 10,
        marginLeft: 4,
    },
    chipScroll: {
        flexGrow: 0,
    },
    chipScrollContent: {
        gap: 8,
        paddingRight: 20,
    },
    chip: {
        backgroundColor: '#e5e7eb',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#3b82f6',
    },
    chipText: {
        color: '#4b5563',
        fontSize: 14,
        fontWeight: '500',
    },
    chipTextActive: {
        color: '#2563eb',
        fontWeight: 'bold',
    },
    practiceCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    promptLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    prompt: {
        fontSize: 18,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    feedbackCard: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    feedbackSuccess: {
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0',
    },
    feedbackError: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
    },
    feedbackTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    feedbackText: {
        fontSize: 16,
        color: '#1f2937',
        lineHeight: 24,
        marginBottom: 16,
    },
    nextButton: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        flex: 1,
        gap: 8,
    },
    nextButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: '#e5e7eb',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    secondaryButtonText: {
        color: '#4b5563',
        fontSize: 14,
        fontWeight: 'bold',
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d1fae5',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
        flex: 1,
    },
    completedText: {
        color: '#047857',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
