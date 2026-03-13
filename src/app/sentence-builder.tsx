import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { ArrowRight, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react-native';
import AppleIntelligenceModule from '../../modules/apple-intelligence/index';

type GrammarRule = {
    id: string;
    title: string;
    description: string;
    englishPrompt: string;
    keyword: string;
};

const RULES: GrammarRule[] = [
    {
        id: 'sv',
        title: 'Subject + Verb',
        description: 'The most basic Dutch sentence starts with a subject followed by the verb.',
        englishPrompt: 'Translate: "I eat"',
        keyword: 'subject+verb'
    },
    {
        id: 'svo',
        title: 'Subject + Verb + Object',
        description: 'When adding an object, it comes after the verb.',
        englishPrompt: 'Translate: "I eat an apple"',
        keyword: 'object'
    },
    {
        id: 'svto',
        title: 'Time comes before Object',
        description: 'In Dutch, time expressions usually come before the direct object.',
        englishPrompt: 'Translate: "I eat an apple today"',
        keyword: 'time'
    },
    {
        id: 'tmp',
        title: 'Time-Manner-Place (TMP)',
        description: 'The standard order is Time, then Manner, then Place.',
        englishPrompt: 'Translate: "I eat an apple today at home"',
        keyword: 'location'
    },
    {
        id: 'question',
        title: 'Questions (Inversion)',
        description: 'To ask a question, swap the subject and the verb.',
        englishPrompt: 'Translate: "Do I eat an apple?"',
        keyword: 'question'
    }
];

export default function SentenceBuilderScreen() {
    const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);

    const currentRule = RULES[currentRuleIndex];

    const evaluateSentence = async () => {
        if (!userInput.trim()) return;
        
        setIsEvaluating(true);
        setFeedback(null);
        
        try {
            // We pass the rule keyword along with the user input so the mocked intelligence knows what to look for
            const prompt = `User sentence: "${userInput}". Rule practicing: ${currentRule.keyword}`;
            const result = await AppleIntelligenceModule.generateTextAsync(prompt);
            setFeedback(result);
        } catch (error) {
            console.error('Apple Intelligence Error:', error);
            setFeedback('Sorry, Apple Intelligence is currently unavailable. Please check your connection or simulator settings.');
        } finally {
            setIsEvaluating(false);
        }
    };

    const nextRule = () => {
        if (currentRuleIndex < RULES.length - 1) {
            setCurrentRuleIndex(currentRuleIndex + 1);
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
                    <Text style={styles.prompt}>{currentRule.englishPrompt}</Text>
                    
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
                        
                        {/* Only show next button if mostly positive (mock simple check) */}
                        {!feedback.includes('Sorry') && feedback.includes('!') && currentRuleIndex < RULES.length - 1 && (
                            <TouchableOpacity style={styles.nextButton} onPress={nextRule}>
                                <Text style={styles.nextButtonText}>Next Level</Text>
                                <ArrowRight color="white" size={16} />
                            </TouchableOpacity>
                        )}
                        {currentRuleIndex === RULES.length - 1 && feedback.includes('!') && (
                            <View style={styles.completedBadge}>
                                <CheckCircle2 color="#10b981" size={20} />
                                <Text style={styles.completedText}>All Rules Mastered!</Text>
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
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-end',
        gap: 8,
    },
    nextButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d1fae5',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    completedText: {
        color: '#047857',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
