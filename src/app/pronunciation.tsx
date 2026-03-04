import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, Dimensions, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import stringSimilarity from 'string-similarity';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import { TRAFFIC_CATEGORIES } from '@/data/traffic_categories';
import { Word } from '@/types';

export default function PronunciationScreen() {
    const { wordId } = useLocalSearchParams<{ wordId: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Data State
    const [targetWord, setTargetWord] = useState<Word | null>(null);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    // Results State
    const [spokenText, setSpokenText] = useState('');
    const [accuracy, setAccuracy] = useState<number | null>(null);

    // Audio Metering State
    const [meterLevels, setMeterLevels] = useState<number[]>(Array(30).fill(0)); // 30 bars
    const meterUpdateInterval = useRef<NodeJS.Timeout | null>(null);

    // Animation values
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Load Word
    useEffect(() => {
        let foundWord: Word | undefined;
        // Search in all categories
        const allCats = [...VOCABULARY_DATA, ...TRAFFIC_CATEGORIES];
        for (const cat of allCats) {
            foundWord = cat.words.find(w => w.id === wordId);
            if (foundWord) break;
        }

        // If no specifically requested word, pick a random one for practice mode
        if (!foundWord) {
            const allWords = allCats.flatMap(c => c.words);
            foundWord = allWords[Math.floor(Math.random() * allWords.length)];
        }

        setTargetWord(foundWord);
    }, [wordId]);

    // Setup Voice API
    useEffect(() => {
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechResults = onSpeechResults;

        return () => {
            // cleanup
            Voice.destroy().then(Voice.removeAllListeners);
            if (recording) {
                recording.stopAndUnloadAsync();
            }
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

    const onSpeechResults = (e: SpeechResultsEvent) => {
        if (e.value && e.value.length > 0) {
            const transcript = e.value[0];
            setSpokenText(transcript);
            evaluatePronunciation(transcript);
        }
    };

    const evaluatePronunciation = (transcript: string) => {
        if (!targetWord) return;

        // Clean up strings before compare
        const cleanTarget = targetWord.dutch.toLowerCase().replace(/[.,!?;:]/g, '').trim();
        const cleanSpoken = transcript.toLowerCase().replace(/[.,!?;:]/g, '').trim();

        const similarity = stringSimilarity.compareTwoStrings(cleanTarget, cleanSpoken);
        setAccuracy(Math.round(similarity * 100));
    };

    const startRecording = async () => {
        try {
            setSpokenText('');
            setAccuracy(null);

            // 1. Request AV permissions for DB Metering
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // 2. Start AV meter
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY,
                (status) => {
                    if (status.metering) {
                        // Metering is returned usually between -160 and 0. Convert to a 0-1 range roughly.
                        let normalized = (status.metering + 160) / 160;
                        // Enhance lower signals 
                        normalized = Math.max(0, Math.min(1, Math.pow(normalized, 5)));

                        setMeterLevels(prev => {
                            const next = [...prev];
                            next.shift(); // remove oldest
                            next.push(normalized); // add newest
                            return next;
                        });
                    }
                },
                100 // update every 100ms
            );
            setRecording(recording);

            // 3. Start Native Voice Recognition (Targeting Dutch)
            await Voice.start('nl-NL');

            setIsRecording(true);
            startPulseAnimation();

        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        try {
            // Stop voice plugin
            await Voice.stop();

            // Stop AV Metric recorder
            if (recording) {
                await recording.stopAndUnloadAsync();
                setRecording(null);
            }

            setIsRecording(false);
            stopPulseAnimation();

            // Reset meter bars to zero
            setMeterLevels(Array(30).fill(0));

        } catch (error) {
            console.error('Failed to stop recording', error);
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
                <View style={styles.controlsContainer}>
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
