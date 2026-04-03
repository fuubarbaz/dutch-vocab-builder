import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { CheckCircle2, XCircle, BrainCircuit, RotateCcw } from 'lucide-react-native';
import AIModule from 'dutch-vocab-ai';

type GrammarResult = {
    isCorrect: boolean;
    explanation: string;
};

function parseGrammarResult(raw: string): GrammarResult {
    const trimmed = raw.trim();
    const isCorrect = trimmed.toUpperCase().startsWith('CORRECT');
    // Remove the CORRECT/INCORRECT prefix and any leading whitespace/newlines
    const explanation = trimmed
        .replace(/^(CORRECT|INCORRECT)\s*/i, '')
        .trim();
    return { isCorrect, explanation };
}

export default function GrammarCheckScreen() {
    const [userInput, setUserInput] = useState('');
    const [result, setResult] = useState<GrammarResult | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [history, setHistory] = useState<Array<{ sentence: string; result: GrammarResult }>>([]);

    const checkGrammar = async () => {
        if (!userInput.trim()) return;

        setIsEvaluating(true);
        setResult(null);

        try {
            const prompt = `[grammar-check] Check this Dutch sentence: "${userInput}"`;
            const raw = await AIModule.generateTextAsync(prompt);
            const parsed = parseGrammarResult(raw);
            setResult(parsed);
            setHistory(prev => [{ sentence: userInput, result: parsed }, ...prev]);
        } catch (error) {
            console.error('Grammar check error:', error);
            setResult({
                isCorrect: false,
                explanation: 'Sorry, the grammar checker is currently unavailable. Please try again later.',
            });
        } finally {
            setIsEvaluating(false);
        }
    };

    const reset = () => {
        setUserInput('');
        setResult(null);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Stack.Screen options={{ title: 'Grammar Check' }} />

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                {/* Header Card */}
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <BrainCircuit color="#8b5cf6" size={24} />
                        <Text style={styles.cardTitle}>Dutch Grammar Check</Text>
                    </View>
                    <Text style={styles.description}>
                        Type any Dutch sentence and get instant feedback on whether it's grammatically correct, powered by Apple Intelligence.
                    </Text>
                </View>

                {/* Input Area */}
                <View style={styles.inputCard}>
                    <Text style={styles.inputLabel}>Your Dutch Sentence:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a Dutch sentence here..."
                        placeholderTextColor="#9ca3af"
                        value={userInput}
                        onChangeText={(text) => {
                            setUserInput(text);
                            if (result) setResult(null);
                        }}
                        multiline
                        returnKeyType="done"
                        onSubmitEditing={checkGrammar}
                        autoCapitalize="sentences"
                        autoCorrect={false}
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.checkButton, (!userInput.trim() || isEvaluating) && styles.buttonDisabled]}
                            onPress={checkGrammar}
                            disabled={!userInput.trim() || isEvaluating}
                        >
                            {isEvaluating ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <BrainCircuit color="white" size={18} />
                                    <Text style={styles.checkButtonText}>Check Grammar</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {(userInput.length > 0 || result) && (
                            <TouchableOpacity style={styles.resetButton} onPress={reset}>
                                <RotateCcw color="#6b7280" size={18} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Result Area */}
                {result && (
                    <View style={[
                        styles.resultCard,
                        result.isCorrect ? styles.resultCorrect : styles.resultIncorrect,
                    ]}>
                        <View style={styles.resultHeader}>
                            {result.isCorrect ? (
                                <CheckCircle2 color="#16a34a" size={24} />
                            ) : (
                                <XCircle color="#dc2626" size={24} />
                            )}
                            <Text style={[
                                styles.resultTitle,
                                { color: result.isCorrect ? '#16a34a' : '#dc2626' },
                            ]}>
                                {result.isCorrect ? 'Grammatically Correct' : 'Needs Correction'}
                            </Text>
                        </View>

                        <Text style={styles.resultSentence}>"{userInput}"</Text>
                        <Text style={styles.resultExplanation}>{result.explanation}</Text>
                    </View>
                )}

                {/* Example Sentences */}
                {!result && !isEvaluating && (
                    <View style={styles.examplesCard}>
                        <Text style={styles.examplesTitle}>Try these examples:</Text>
                        {[
                            'Ik heb een boek gelezen',
                            'Hij gaat naar de winkel',
                            'Wij hebben gisteren gewerkt',
                            'De kat zit op de mat',
                        ].map((example) => (
                            <TouchableOpacity
                                key={example}
                                style={styles.exampleChip}
                                onPress={() => setUserInput(example)}
                            >
                                <Text style={styles.exampleText}>{example}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* History */}
                {history.length > 0 && (
                    <View style={styles.historySection}>
                        <Text style={styles.historyTitle}>Recent Checks</Text>
                        {history.slice(0, 5).map((entry, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.historyItem}
                                onPress={() => setUserInput(entry.sentence)}
                            >
                                {entry.result.isCorrect ? (
                                    <CheckCircle2 color="#16a34a" size={16} />
                                ) : (
                                    <XCircle color="#dc2626" size={16} />
                                )}
                                <Text style={styles.historyText} numberOfLines={1}>
                                    {entry.sentence}
                                </Text>
                            </TouchableOpacity>
                        ))}
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
        paddingBottom: 40,
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
        fontSize: 15,
        color: '#4b5563',
        lineHeight: 22,
    },
    inputCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 16,
        fontSize: 17,
        minHeight: 120,
        textAlignVertical: 'top',
        marginBottom: 16,
        color: '#111827',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    checkButton: {
        flex: 1,
        backgroundColor: '#8b5cf6',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    checkButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resetButton: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    resultCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
    },
    resultCorrect: {
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0',
    },
    resultIncorrect: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultSentence: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#374151',
        marginBottom: 12,
        paddingLeft: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#d1d5db',
    },
    resultExplanation: {
        fontSize: 15,
        color: '#1f2937',
        lineHeight: 24,
    },
    examplesCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    examplesTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 12,
    },
    exampleChip: {
        backgroundColor: '#f3f4f6',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    exampleText: {
        fontSize: 15,
        color: '#4b5563',
    },
    historySection: {
        marginTop: 4,
    },
    historyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 12,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    historyText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
});
