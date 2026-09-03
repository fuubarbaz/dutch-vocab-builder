import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { CheckCircle2, XCircle, BrainCircuit, RotateCcw, AlertCircle } from 'lucide-react-native';
import { useAI, AIErrorBanner } from '@/context/AIContext';

type GrammarResult = {
    isCorrect: boolean;
    explanation: string;
};

function parseGrammarResult(raw: string): GrammarResult | null {
    const trimmed = raw.trim();
    const match = trimmed.match(/^(CORRECT|INCORRECT)[.:!\s]*/im);
    if (!match) return null;
    const isCorrect = match[1].toUpperCase() === 'CORRECT';
    // Strip any JSON blocks the AI may have appended (e.g. evaluation JSON)
    const explanation = trimmed
        .replace(/^(CORRECT|INCORRECT)[.:!\s]*/i, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\{[\s\S]*\}/g, '')
        .trim();
    return { isCorrect, explanation };
}

function _removed() {
    // availability boilerplate removed — handled by AIContext
    // keeping this stub so git diff is clear
    return null;
}

const SETUP_GUIDES: any = {
    not_downloaded: {
        icon: AlertCircle,
        accentColor: '#B45309',
        bg: '#FFFBEB',
        borderColor: '#FCD34D',
        title: 'AI Model Not Downloaded',
        subtitle: 'The on-device AI model (Gemma 4) needs to be downloaded before grammar checking can work.',
        steps: [
            { label: 'Open the Settings tab' },
            { label: 'Under "On-device AI", tap "Download model" (~2.6 GB)' },
            { label: 'Make sure you are connected to Wi-Fi' },
            { label: 'Come back here after the download completes' },
        ],
    },
    load_error: {
        icon: AlertCircle,
        accentColor: '#991B1B',
        bg: '#FEF2F2',
        borderColor: '#FCA5A5',
        title: 'AI Model Failed to Load',
        subtitle: 'The on-device AI model could not be loaded. This may be due to insufficient memory or a corrupted download.',
        steps: [
            { label: 'Close other apps to free up memory' },
            { label: 'Restart the app and try again' },
            { label: 'If the issue persists, close and reopen the app to re-download the model' },
        ],
    },
};

export default function GrammarCheckScreen() {
    const { generate, engineState, error: aiError, isFallback, retryLoad } = useAI();
    const [userInput, setUserInput] = useState('');
    const [result, setResult] = useState<GrammarResult | null>(null);
    const [history, setHistory] = useState<Array<{ sentence: string; result: GrammarResult }>>([]);

    const isEvaluating = engineState === 'generating' || engineState === 'loading_model';

    const checkGrammar = async () => {
        if (!userInput.trim() || isEvaluating) return;
        setResult(null);
        try {
            const prompt = `[grammar-check] Check this Dutch sentence. Reply with CORRECT or INCORRECT on the first line, then a plain-text explanation. Do NOT return JSON.\n\nSentence: "${userInput}"`;
            const raw = await generate(prompt);
            const parsed = parseGrammarResult(raw);
            if (!parsed) {
                setResult({ isCorrect: false, explanation: 'Could not parse response. Please try again.' });
                return;
            }
            setResult(parsed);
            setHistory(prev => [{ sentence: userInput, result: parsed }, ...prev]);
        } catch {
            // AIContext already shows a toast and sets engineState → error
        }
    };

    const reset = () => {
        setUserInput('');
        setResult(null);
    };

    // ── AI error state ────────────────────────────────────────────────────────

    if (engineState === 'error' && aiError && !aiError.recoverable) {
        const guide = SETUP_GUIDES[aiError.kind === 'not_downloaded' ? 'not_downloaded' : 'load_error'];
        if (guide) {
            const Icon = guide.icon;
            return (
                <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                    <Stack.Screen options={{ title: 'Grammar Check' }} />
                    <View style={[styles.guideCard, { backgroundColor: guide.bg, borderColor: guide.borderColor }]}>
                        <View style={styles.guideHeader}>
                            <Icon size={24} color={guide.accentColor} />
                            <Text style={[styles.guideTitle, { color: guide.accentColor }]}>{guide.title}</Text>
                        </View>
                        <Text style={styles.guideSubtitle}>{guide.subtitle}</Text>
                        {__DEV__ && aiError.detail ? (
                            <Text style={styles.diagText}>Debug: {aiError.detail}</Text>
                        ) : null}
                        <View style={styles.guideSteps}>
                            {guide.steps.map((step: any, i: number) => (
                                <View key={i} style={styles.guideStep}>
                                    <View style={[styles.guideStepNum, { backgroundColor: guide.accentColor }]}>
                                        <Text style={styles.guideStepNumText}>{i + 1}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.guideStepLabel}>{step.label}</Text>
                                        {step.detail && <Text style={styles.guideStepDetail}>{step.detail}</Text>}
                                    </View>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={[styles.checkAgainBtn, { backgroundColor: guide.accentColor }]}
                            onPress={retryLoad}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.checkAgainText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            );
        }
    }

    // ── Main UI ───────────────────────────────────────────────────────────────

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Stack.Screen options={{ title: 'Grammar Check' }} />

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                {isFallback && (
                    <View style={styles.fallbackBanner}>
                        <AlertCircle size={14} color="#92400E" />
                        <Text style={styles.fallbackBannerText}>
                            Using basic JS fallback — full AI grammar check requires a native build with the Gemma 4 model.
                        </Text>
                    </View>
                )}

                {/* Header Card */}
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <BrainCircuit color="#8b5cf6" size={24} />
                        <Text style={styles.cardTitle}>Dutch Grammar Check</Text>
                    </View>
                    <Text style={styles.description}>
                        Type any Dutch sentence and get instant feedback powered by on-device AI.
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

    fallbackBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#FEF3C7',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FCD34D',
    },
    fallbackBannerText: {
        flex: 1,
        fontSize: 13,
        color: '#92400E',
        lineHeight: 18,
    },

    // Setup guide
    guideCard: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    guideHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    guideTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    guideSubtitle: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 16,
    },
    diagText: {
        fontSize: 11,
        color: '#6b7280',
        fontFamily: 'monospace',
        marginBottom: 12,
        backgroundColor: '#f3f4f6',
        padding: 8,
        borderRadius: 6,
    },
    guideSteps: { gap: 12 },
    guideStep: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    guideStepNum: {
        width: 22, height: 22, borderRadius: 11,
        alignItems: 'center', justifyContent: 'center', marginTop: 1,
    },
    guideStepNumText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    guideStepLabel: { fontSize: 14, color: '#1f2937', lineHeight: 20 },
    guideStepDetail: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    guideNote: { fontSize: 13, fontStyle: 'italic', marginTop: 14 },
    checkAgainBtn: {
        marginTop: 20,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    checkAgainText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

    // Main UI
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
