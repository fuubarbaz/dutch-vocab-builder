import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { CheckCircle2, XCircle, BrainCircuit, RotateCcw, AlertCircle, Clock } from 'lucide-react-native';
import AIModule, { isFallback } from 'dutch-vocab-ai';

type AIAvailability = 'available' | 'not_enabled' | 'model_not_ready' | 'requires_ios26' | 'device_not_eligible' | 'checking';

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

function errorMessageToAvailability(msg: string): AIAvailability | null {
    if (msg.includes('not_enabled')) return 'not_enabled';
    if (msg.includes('model_not_ready')) return 'model_not_ready';
    if (msg.includes('requires_ios26')) return 'requires_ios26';
    if (msg.includes('device_not_eligible')) return 'device_not_eligible';
    return null;
}

type SetupStep = { label: string; detail?: string };

const SETUP_GUIDES: Partial<Record<AIAvailability, { icon: any; accentColor: string; bg: string; borderColor: string; title: string; subtitle: string; steps: SetupStep[]; note?: string }>> = {
    not_enabled: {
        icon: AlertCircle,
        accentColor: '#B45309',
        bg: '#FFFBEB',
        borderColor: '#FCD34D',
        title: 'Apple Intelligence Required',
        subtitle: 'Enable Apple Intelligence to check Dutch grammar using on-device AI.',
        steps: [
            { label: 'Open Settings on your iPhone' },
            { label: 'Tap Apple Intelligence & Siri' },
            { label: 'Turn on Apple Intelligence' },
            { label: 'Set device language to English (US)', detail: 'Settings → General → Language & Region → iPhone Language' },
            { label: 'Wait for the model to download', detail: 'A progress bar will appear in Apple Intelligence & Siri' },
            { label: 'Come back here and tap Check Again' },
        ],
    },
    model_not_ready: {
        icon: Clock,
        accentColor: '#1D4ED8',
        bg: '#EFF6FF',
        borderColor: '#93C5FD',
        title: 'Apple Intelligence is Setting Up',
        subtitle: 'The on-device model is downloading. This usually takes a few minutes on Wi-Fi.',
        steps: [
            { label: 'Make sure you are connected to Wi-Fi' },
            { label: 'Open Settings → Apple Intelligence & Siri', detail: 'Look for a progress bar — it shows download status' },
            { label: 'Keep the screen on and wait for it to finish' },
            { label: 'Come back here and tap Check Again' },
        ],
        note: 'Do not switch your device language away from English (US) while downloading.',
    },
    requires_ios26: {
        icon: AlertCircle,
        accentColor: '#991B1B',
        bg: '#FEF2F2',
        borderColor: '#FCA5A5',
        title: 'iOS 26 Required',
        subtitle: 'This feature uses Apple Intelligence which requires iOS 26 or later.',
        steps: [
            { label: 'Open Settings → General → Software Update' },
            { label: 'Download and install iOS 26' },
            { label: 'After updating, enable Apple Intelligence', detail: 'Settings → Apple Intelligence & Siri' },
            { label: 'Come back here and tap Check Again' },
        ],
    },
    device_not_eligible: {
        icon: AlertCircle,
        accentColor: '#6B7280',
        bg: '#F9FAFB',
        borderColor: '#D1D5DB',
        title: 'Device Not Compatible',
        subtitle: 'Apple Intelligence is not available on this device. On-device grammar checking requires a supported iPhone.',
        steps: [
            { label: 'Supported devices: iPhone 15 Pro, 15 Pro Max, or iPhone 16 series and later' },
            { label: 'Requires iOS 26 or later' },
            { label: 'Apple Intelligence must be enabled in Settings → Apple Intelligence & Siri' },
            { label: 'Device language must be set to English (US)' },
        ],
    },
};

export default function GrammarCheckScreen() {
    const [userInput, setUserInput] = useState('');
    const [result, setResult] = useState<GrammarResult | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [history, setHistory] = useState<Array<{ sentence: string; result: GrammarResult }>>([]);
    const [aiStatus, setAiStatus] = useState<AIAvailability>('checking');

    const [diagRaw, setDiagRaw] = useState<string>('');

    const checkAvailability = () => {
        setAiStatus('checking');
        AIModule.getAIAvailabilityAsync()
            .then((status) => {
                setDiagRaw(status);
                const known: AIAvailability[] = ['available', 'not_enabled', 'model_not_ready', 'requires_ios26', 'device_not_eligible'];
                setAiStatus(known.includes(status as AIAvailability) ? (status as AIAvailability) : 'device_not_eligible');
            })
            .catch((e) => {
                const msg = e instanceof Error ? e.message : String(e);
                setDiagRaw(msg);
                setAiStatus('device_not_eligible');
            });
    };

    useEffect(() => { checkAvailability(); }, []);

    const checkGrammar = async () => {
        if (!userInput.trim()) return;
        setIsEvaluating(true);
        setResult(null);
        try {
            const prompt = `[grammar-check] Check this Dutch sentence. Reply with CORRECT or INCORRECT on the first line, then a plain-text explanation. Do NOT return JSON.\n\nSentence: "${userInput}"`;
            const raw = await AIModule.generateTextAsync(prompt);
            const parsed = parseGrammarResult(raw);
            if (!parsed) {
                setResult({ isCorrect: false, explanation: `Could not parse response. Please try again.` });
                return;
            }
            setResult(parsed);
            setHistory(prev => [{ sentence: userInput, result: parsed }, ...prev]);
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            const availState = errorMessageToAvailability(msg);
            if (availState) {
                setAiStatus(availState);
            } else {
                setResult({ isCorrect: false, explanation: 'Grammar checker is temporarily unavailable. Please try again.' });
            }
        } finally {
            setIsEvaluating(false);
        }
    };

    const reset = () => {
        setUserInput('');
        setResult(null);
    };

    // ── Availability gate ────────────────────────────────────────────────────

    if (aiStatus === 'checking') {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <Stack.Screen options={{ title: 'Grammar Check' }} />
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text style={{ color: '#6b7280', marginTop: 12, fontSize: 15 }}>Checking Apple Intelligence…</Text>
            </View>
        );
    }

    const guide = aiStatus !== 'available' ? SETUP_GUIDES[aiStatus] : null;

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
                    {diagRaw ? (
                        <Text style={styles.diagText}>Debug: {diagRaw}</Text>
                    ) : null}
                    <View style={styles.guideSteps}>
                        {guide.steps.map((step, i) => (
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
                    {guide.note && <Text style={[styles.guideNote, { color: guide.accentColor }]}>{guide.note}</Text>}
                    <TouchableOpacity
                        style={[styles.checkAgainBtn, { backgroundColor: guide.accentColor }]}
                        onPress={checkAvailability}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.checkAgainText}>Check Again</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    // ── Main UI (AI available) ───────────────────────────────────────────────

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
                            Using basic JS fallback — full AI grammar check requires a native build on iOS 26+.
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
                        Type any Dutch sentence and get instant feedback powered by Apple Intelligence on-device AI.
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
