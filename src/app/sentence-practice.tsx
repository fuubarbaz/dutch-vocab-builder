import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, Dimensions, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AudioModule } from 'expo-audio';
import Voice, { SpeechResultsEvent, SpeechErrorEvent, SpeechVolumeChangeEvent } from '@react-native-voice/voice';
import stringSimilarity from 'string-similarity';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { PRACTICE_SENTENCES, Sentence } from '@/data/sentences';
import { normalizeDutchText } from '@/utils/text';

export default function SentencePracticeScreen() {
    const { sentenceId } = useLocalSearchParams<{ sentenceId: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Data State
    const [targetSentence, setTargetSentence] = useState<Sentence | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    // History State
    const [history, setHistory] = useState<Sentence[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Results State
    const [spokenText, setSpokenText] = useState('');
    const [accuracy, setAccuracy] = useState<number | null>(null);

    // Audio Metering State
    const [meterLevels, setMeterLevels] = useState<number[]>(Array(30).fill(0)); // 30 bars
    const meterUpdateInterval = useRef<NodeJS.Timeout | null>(null);

    // Animation values
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Load Sentence
    useEffect(() => {
        let foundSentence = PRACTICE_SENTENCES.find(s => s.id === sentenceId);

        // If no specifically requested sentence, pick a random one
        if (!foundSentence) {
            foundSentence = PRACTICE_SENTENCES[Math.floor(Math.random() * PRACTICE_SENTENCES.length)];
        }

        if (foundSentence) {
            setHistory([foundSentence]);
            setHistoryIndex(0);
            setTargetSentence(foundSentence);
        }
    }, [sentenceId]);

    const targetSentenceRef = useRef(targetSentence);
    useEffect(() => {
        targetSentenceRef.current = targetSentence;
    }, [targetSentence]);

    // Setup Voice API
    useEffect(() => {
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechPartialResults = onSpeechPartialResults;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

        return () => {
            // cleanup
            try { Voice.cancel() } catch (e) { }
            Voice.removeAllListeners();
            if (meterUpdateInterval.current) {
                clearInterval(meterUpdateInterval.current);
            }
        };
    }, []);

    const onSpeechStart = (e: any) => {
        // Speech started
    };

    const onSpeechEnd = (e: any) => {
        setIsRecording(false);
    };

    const onSpeechError = (e: SpeechErrorEvent) => {
        console.error("Speech Error:", e.error);
        setIsRecording(false);
        stopPulseAnimation();
    };

    const onSpeechPartialResults = (e: SpeechResultsEvent) => {
        if (e.value && e.value.length > 0) {
            const transcript = e.value[0];
            setSpokenText(transcript);
            evaluatePronunciation(transcript);
        }
    };

    const onSpeechResults = (e: SpeechResultsEvent) => {
        if (e.value && e.value.length > 0) {
            const transcript = e.value[0];
            setSpokenText(transcript);
            evaluatePronunciation(transcript);
        }
    };

    const onSpeechVolumeChanged = (e: SpeechVolumeChangeEvent) => {
        if (e.value !== undefined) {
            // SpeechVolumeChangeEvent value is platform dependent.
            // On iOS it's generally 0-10, on Android it might be different. Let's map it roughly to 0-1.
            let normalized = Math.max(0, Math.min(1, e.value / 10));
            setMeterLevels(prev => {
                const next = [...prev];
                next.shift();
                next.push(normalized);
                return next;
            });
        }
    };

    const evaluatePronunciation = (transcript: string) => {
        const currentTarget = targetSentenceRef.current;
        if (!currentTarget) return;

        // Clean up strings before compare by expanding digits to words
        const cleanTarget = normalizeDutchText(currentTarget.dutch);
        const cleanSpoken = normalizeDutchText(transcript);

        const similarity = stringSimilarity.compareTwoStrings(cleanTarget, cleanSpoken);
        setAccuracy(Math.round(similarity * 100));
    };

    const startRecording = async () => {
        try {
            setSpokenText('');
            setAccuracy(null);

            // 1. Request AV permissions for Voice
            const permission = await AudioModule.requestRecordingPermissionsAsync();
            if (!permission.granted) {
                throw new Error('Microphone permission not granted');
            }

            // Cancel any potentially hanging recognition softly, without removing event listeners
            try { await Voice.cancel(); } catch (e) { }

            // 2. Start Native Voice Recognition (Targeting Dutch)
            await Voice.start('nl-NL');

            setIsRecording(true);
            startPulseAnimation();

        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        stopPulseAnimation();

        try {
            // Stop voice plugin
            await Voice.stop();

            // Reset meter bars to zero
            setMeterLevels(Array(30).fill(0));

        } catch (error) {
            console.error('Failed to stop recording', error);
        }
    };

    const handleNext = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            setHistoryIndex(nextIndex);
            setTargetSentence(history[nextIndex]);
        } else {
            const nextSentence = PRACTICE_SENTENCES[Math.floor(Math.random() * PRACTICE_SENTENCES.length)];

            setHistory(prev => [...prev, nextSentence]);
            setHistoryIndex(prev => prev + 1);
            setTargetSentence(nextSentence);
        }

        setSpokenText('');
        setAccuracy(null);
        setMeterLevels(Array(30).fill(0));
    };

    const handleBack = () => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            setHistoryIndex(prevIndex);
            setTargetSentence(history[prevIndex]);

            setSpokenText('');
            setAccuracy(null);
            setMeterLevels(Array(30).fill(0));
        }
    };

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                })
            ])
        ).start();
    };

    const stopPulseAnimation = () => {
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);
    };

    if (!targetSentence) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="close" size={28} color={theme.text} />
                    </Pressable>
                </View>
                <View style={styles.content}>
                    <Text style={{ color: theme.text }}>Loading practice sentence...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Determine feedback coloring
    let feedbackColor = theme.text;
    let feedbackMessage = 'Hold to speak';
    if (accuracy !== null) {
        if (accuracy > 80) {
            feedbackColor = '#28a745';
            feedbackMessage = 'Excellent!';
        } else if (accuracy > 50) {
            feedbackColor = '#ffc107'; // yellow/amber
            feedbackMessage = 'Close, try again!';
        } else {
            feedbackColor = '#dc3545';
            feedbackMessage = 'Keep practicing!';
        }
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color={theme.text} />
                </Pressable>
                <Text style={[styles.titleText, { color: theme.text }]}>Sentence Practice</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.content}>

                {/* Target Sentence Display */}
                <View style={styles.wordCard}>
                    <Text style={[styles.label, { color: theme.text, opacity: 0.6 }]}>Say this sentence:</Text>
                    <Text style={[styles.targetDutch, { color: theme.text, fontSize: 24, paddingHorizontal: 20 }]}>{targetSentence.dutch}</Text>
                    <Text style={[styles.targetEnglish, { color: theme.tint, paddingHorizontal: 20, marginTop: 10 }]}>{targetSentence.english}</Text>
                </View>

                {/* Score & Feedback Area */}
                <View style={styles.feedbackContainer}>
                    {accuracy !== null && (
                        <View style={styles.scoreBadge}>
                            <Text style={[styles.scoreText, { color: feedbackColor }]}>
                                {accuracy}% Match
                            </Text>
                        </View>
                    )}

                    {spokenText ? (
                        <Text style={[styles.spokenText, { color: theme.text, opacity: 0.7 }]}>
                            Heard: "{spokenText}"
                        </Text>
                    ) : null}

                    <Text style={[styles.feedbackMessage, { color: accuracy !== null ? feedbackColor : theme.text }]}>
                        {isRecording ? 'Listening...' : feedbackMessage}
                    </Text>
                </View>

                {/* Visualizer */}
                <View style={styles.visualizerContainer}>
                    {meterLevels.map((level, i) => {
                        // Scale height based on level, minimum 4px
                        const barHeight = Math.max(4, level * 80);
                        return (
                            <Animated.View
                                key={i}
                                style={[
                                    styles.meterBar,
                                    {
                                        backgroundColor: isRecording ? theme.tint : theme.text + '20',
                                        height: barHeight,
                                    }
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Controls Area */}
                <View style={[styles.controlsContainer, { flexDirection: 'row', gap: 40 }]}>
                    <Pressable onPress={handleBack} disabled={historyIndex <= 0} style={{ opacity: historyIndex <= 0 ? 0.3 : 1 }}>
                        <Ionicons name="chevron-back-circle" size={54} color={theme.text} />
                    </Pressable>

                    <Pressable
                        onPressIn={startRecording}
                        onPressOut={stopRecording}
                    >
                        <Animated.View
                            style={[
                                styles.recordButton,
                                {
                                    backgroundColor: isRecording ? '#dc3545' : theme.tint,
                                    transform: [{ scale: pulseAnim }],
                                    shadowColor: isRecording ? '#dc3545' : theme.tint,
                                }
                            ]}
                        >
                            <Ionicons name="mic" size={48} color="#fff" />
                        </Animated.View>
                    </Pressable>

                    <Pressable onPress={handleNext}>
                        <Ionicons name="chevron-forward-circle" size={54} color={theme.text} />
                    </Pressable>
                </View>
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
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    wordCard: {
        alignItems: 'center',
        marginTop: 40,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    targetDutch: {
        fontSize: 42,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    targetEnglish: {
        fontSize: 20,
        fontWeight: '500',
        textAlign: 'center',
    },
    feedbackContainer: {
        alignItems: 'center',
        height: 120, // fixed height to prevent layout shifting
        justifyContent: 'center',
    },
    scoreBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 8,
    },
    scoreText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    spokenText: {
        fontSize: 16,
        fontStyle: 'italic',
        marginBottom: 8,
        textAlign: 'center',
    },
    feedbackMessage: {
        fontSize: 18,
        fontWeight: '600',
    },
    visualizerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
        width: '100%',
        gap: 4,
    },
    meterBar: {
        width: 6,
        borderRadius: 3,
    },
    controlsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        height: 120,
    },
    recordButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
});
