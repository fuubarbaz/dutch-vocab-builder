import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AudioModule } from 'expo-audio';
import { 
  ExpoSpeechRecognitionModule, 
  useSpeechRecognitionEvent 
} from 'expo-speech-recognition';
import levenshtein from 'fast-levenshtein';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import { Word } from '@/types';
import { normalizeDutchText } from '@/utils/text';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';

export default function PronunciationScreen() {
    const { wordId } = useLocalSearchParams<{ wordId: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Data State
    const [targetWord, setTargetWord] = useState<Word | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    // History State
    const [history, setHistory] = useState<Word[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Results State
    const [spokenText, setSpokenText] = useState('');
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
    const audioLevel = useSharedValue(0);
    const silenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Animation values
    const pulseScale = useSharedValue(1);

    const animatedRecordButtonStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulseScale.value }]
        };
    });

    // Load Word
    useEffect(() => {
        let foundWord: Word | undefined;
        // Search in vocabulary categories exclusively
        const allCats = [...VOCABULARY_DATA];
        for (const cat of allCats) {
            foundWord = cat.words.find(w => w.id === wordId);
            if (foundWord) break;
        }

        // If no specifically requested word, pick a random one for practice mode
        if (!foundWord) {
            const allWords = allCats.flatMap(c => c.words);
            foundWord = allWords[Math.floor(Math.random() * allWords.length)];
        }

        if (foundWord) {
            setHistory([foundWord]);
            setHistoryIndex(0);
            setTargetWord(foundWord);
        }
    }, [wordId]);

    const targetWordRef = useRef(targetWord);
    useEffect(() => {
        targetWordRef.current = targetWord;
    }, [targetWord]);

    const resetSilenceTimeout = () => {
        if (silenceTimeout.current) {
            clearTimeout(silenceTimeout.current);
        }
        silenceTimeout.current = setTimeout(() => {
            console.log('Silence detected, stopping recording automatically.');
            stopRecording();
        }, 3000);
    };

    // Setup Voice API
    useSpeechRecognitionEvent('start', () => {
        setIsRecording(true);
        resetSilenceTimeout();
    });

    useSpeechRecognitionEvent('end', () => {
        setIsRecording(false);
        if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
        audioLevel.value = withTiming(0);
    });

    useSpeechRecognitionEvent('error', (e) => {
        console.error("Speech Error:", e.error, e.message);
        setIsRecording(false);
        setIsVoiceProcessing(false);
        if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
        audioLevel.value = withTiming(0);
    });

    useSpeechRecognitionEvent('result', (e) => {
        resetSilenceTimeout();
        if (e.results && e.results.length > 0) {
            const transcript = e.results[0].transcript;
            setSpokenText(transcript);
            evaluatePronunciation(transcript);
            
            if (e.isFinal) {
                setIsVoiceProcessing(false);
            }
        }
    });

    useSpeechRecognitionEvent('volumechange', (e) => {
        const normalizedLevel = Math.max(0.1, Math.min(1, (e.value + 2) / 12)); // Adjusted for -2 to 10 range
        audioLevel.value = withTiming(normalizedLevel, { duration: 100 });
    });

    useEffect(() => {
        return () => {
            if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
            ExpoSpeechRecognitionModule.abort();
        };
    }, []);

    const evaluatePronunciation = (transcript: string) => {
        const currentTarget = targetWordRef.current;
        if (!currentTarget) return;

        // Clean up strings before compare
        const cleanTarget = normalizeDutchText(currentTarget.dutch).toLowerCase().trim();
        const cleanSpoken = normalizeDutchText(transcript).toLowerCase().trim();

        // Use Levenshtein distance for accuracy calculation
        const distance = levenshtein.get(cleanTarget, cleanSpoken);
        const maxLen = Math.max(cleanTarget.length, cleanSpoken.length);
        const accuracyScore = maxLen === 0 ? 100 : Math.round((1 - distance / maxLen) * 100);
        
        setAccuracy(Math.max(0, accuracyScore));
    };

    const startRecording = async () => {
        try {
            setSpokenText('');
            setAccuracy(null);
            setIsVoiceProcessing(false);

            // 1. Request permissions
            const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!permission.granted) {
                throw new Error('Microphone permission not granted');
            }

            // 2. Start Native Voice Recognition (Targeting Dutch)
            ExpoSpeechRecognitionModule.start({
                lang: 'nl-NL',
                interimResults: true,
                volumeChangeEventOptions: { enabled: true }
            });

            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 500 }),
                    withTiming(1, { duration: 500 })
                ),
                -1,
                true
            );

        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        setIsVoiceProcessing(true);
        pulseScale.value = withTiming(1);
        if (silenceTimeout.current) clearTimeout(silenceTimeout.current);

        try {
            ExpoSpeechRecognitionModule.stop();
            // Safety timeout
            setTimeout(() => setIsVoiceProcessing(false), 5000);
        } catch (error) {
            console.error('Failed to stop recording', error);
            setIsVoiceProcessing(false);
        }
    };

    const handleNext = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            setHistoryIndex(nextIndex);
            setTargetWord(history[nextIndex]);
        } else {
            const allCats = [...VOCABULARY_DATA];
            const allWords = allCats.flatMap(c => c.words);
            const nextWord = allWords[Math.floor(Math.random() * allWords.length)];

            setHistory(prev => [...prev, nextWord]);
            setHistoryIndex(prev => prev + 1);
            setTargetWord(nextWord);
        }

        setSpokenText('');
        setAccuracy(null);
    };

    const handleBack = () => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            setHistoryIndex(prevIndex);
            setTargetWord(history[prevIndex]);

            setSpokenText('');
            setAccuracy(null);
        }
    };


    if (!targetWord) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="close" size={28} color={theme.text} />
                    </Pressable>
                </View>
                <View style={styles.content}>
                    <Text style={{ color: theme.text }}>Loading practice word...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Determine feedback coloring
    let feedbackColor = theme.text;
    let feedbackMessage = 'Tap to speak';
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
                <Text style={[styles.titleText, { color: theme.text }]}>Pronunciation</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.content}>

                {/* Target Word Display */}
                <View style={styles.wordCard}>
                    <Text style={[styles.label, { color: theme.text, opacity: 0.6 }]}>Say this in Dutch:</Text>
                    <Text style={[styles.targetDutch, { color: theme.text }]}>{targetWord.dutch}</Text>
                    <Text style={[styles.targetEnglish, { color: theme.tint }]}>{targetWord.english}</Text>
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
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <WaveformBar key={i} index={i} audioLevel={audioLevel} theme={theme} isRecording={isRecording} />
                    ))}
                </View>

                {/* Controls Area */}
                <View style={[styles.controlsContainer, { flexDirection: 'row', gap: 40 }]}>
                    <Pressable onPress={handleBack} disabled={historyIndex <= 0} style={{ opacity: historyIndex <= 0 ? 0.3 : 1 }}>
                        <Ionicons name="chevron-back-circle" size={54} color={theme.text} />
                    </Pressable>

                    <Pressable
                        onPress={isRecording ? stopRecording : startRecording}
                        disabled={isVoiceProcessing}
                    >
                        <Animated.View
                            style={[
                                styles.recordButton,
                                {
                                    backgroundColor: isRecording ? '#dc3545' : theme.tint,
                                    shadowColor: isRecording ? '#dc3545' : theme.tint,
                                },
                                animatedRecordButtonStyle
                            ]}
                        >
                            {isVoiceProcessing ? (
                                <ActivityIndicator color="#fff" />
                            ) : isRecording ? (
                                <Ionicons name="square" size={32} color="#fff" />
                            ) : (
                                <Ionicons name="mic" size={48} color="#fff" />
                            )}
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

const WaveformBar = ({ index, audioLevel, theme, isRecording }: { index: number, audioLevel: any, theme: any, isRecording: boolean }) => {
    const animatedStyle = useAnimatedStyle(() => {
        const offset = 0.6 + ((index % 3) * 0.2);
        const heightScale = 1 + (audioLevel.value * 3 * offset);
        return {
            transform: [{ scaleY: withTiming(heightScale, { duration: 100 }) }],
            opacity: withTiming(isRecording ? 0.3 + (audioLevel.value * 0.7) : 0.1, { duration: 100 })
        };
    });
    return <Animated.View style={[styles.meterBar, { backgroundColor: theme.tint, height: 20 }, animatedStyle]} />;
};
