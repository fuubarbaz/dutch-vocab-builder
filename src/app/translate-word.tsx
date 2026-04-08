import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavorites } from '@/context/FavoritesContext';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ArrowLeftRight, X, ChevronDown } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { AudioModule } from 'expo-audio';
import { 
  ExpoSpeechRecognitionModule, 
  useSpeechRecognitionEvent 
} from 'expo-speech-recognition';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';
import AIModule from 'dutch-vocab-ai';

export default function TranslateWordScreen() {
    const router = useRouter();
    const theme = Colors[useColorScheme() ?? 'light'];
    const { addCustomWord } = useFavorites();

    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationDirection, setTranslationDirection] = useState<'en-nl' | 'nl-en'>('en-nl');

    // Voice State
    const [isRecording, setIsRecording] = useState(false);
    const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
    const audioLevel = useSharedValue(0);
    const silenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const translateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const directionRef = useRef(translationDirection);
    React.useEffect(() => {
        directionRef.current = translationDirection;
    }, [translationDirection]);

    const resetSilenceTimeout = () => {
        if (silenceTimeout.current) {
            clearTimeout(silenceTimeout.current);
        }
        silenceTimeout.current = setTimeout(() => {
            console.log('Silence detected for 3 seconds, stopping recording automatically.');
            stopRecordingAndProcess();
        }, 3000);
    };

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
        console.error('Speech recognition error:', e);
        setIsRecording(false);
        setIsVoiceProcessing(false);
        if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
        audioLevel.value = withTiming(0);
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
            Alert.alert('Voice Error', e.message || 'Failed to process speech.');
        }
    });

    useSpeechRecognitionEvent('volumechange', (e) => {
        // -2 to 10 range adjusted for normalization
        const normalizedLevel = Math.max(0.1, Math.min(1, (e.value + 2) / 12));
        audioLevel.value = withTiming(normalizedLevel, { duration: 100 });
    });

    useSpeechRecognitionEvent('result', (e) => {
        resetSilenceTimeout();
        if (e.results && e.results.length > 0) {
            const text = e.results[0].transcript;
            setInputText(text);

            if (e.isFinal) {
                setIsVoiceProcessing(true);
                // Debounce translation so it only fires when intermediate results settle
                if (translateTimeout.current) clearTimeout(translateTimeout.current);
                translateTimeout.current = setTimeout(() => {
                    const direction = directionRef.current === 'nl-en' ? 'nl|en' : 'en|nl';
                    translateTextManually(text, direction);
                    setIsVoiceProcessing(false);
                }, 800);
            }
        }
    });

    React.useEffect(() => {
        return () => {
            if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
            if (translateTimeout.current) clearTimeout(translateTimeout.current);
            ExpoSpeechRecognitionModule.abort();
        };
    }, []);

    const categories = [
        { id: 'imported', title: 'Imported Words' },
        ...VOCABULARY_DATA
    ];

    const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
    const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);

    const toggleDirection = () => {
        setTranslationDirection(prev => prev === 'en-nl' ? 'nl-en' : 'en-nl');
        setInputText(translatedText);
        setTranslatedText(inputText);
    };

    const startRecording = async () => {
        try {
            setInputText('');
            setTranslatedText('');

            // 1. Request permissions
            const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Microphone Permission', 'Please enable microphone access to use voice translation.');
                return;
            }

            // Force UI update immediately
            setIsRecording(true);

            // 2. Start Native Voice Recognition
            const locale = translationDirection === 'nl-en' ? 'nl-NL' : 'en-US';
            ExpoSpeechRecognitionModule.start({
                lang: locale,
                interimResults: true,
                volumeChangeEventOptions: { enabled: true }
            });
        } catch (e) {
            console.error('Failed to start recording:', e);
            setIsRecording(false);
            Alert.alert('Microphone Error', 'Could not start speech recognition.');
        }
    };

    const stopRecordingAndProcess = async () => {
        // Force transitions immediately
        setIsRecording(false);
        setIsVoiceProcessing(true);
        if (silenceTimeout.current) clearTimeout(silenceTimeout.current);

        try {
            ExpoSpeechRecognitionModule.stop();
            // Safety timeout: if results never arrive, reset processing state after 5 seconds
            setTimeout(() => setIsVoiceProcessing(false), 5000);
        } catch (e) {
            console.error('Failed to stop recording:', e);
            setIsVoiceProcessing(false);
            audioLevel.value = withTiming(0);
        }
    };

    // Waveform individual bar generation
    const renderWaveform = () => {
        return (
            <View style={styles.waveformContainer}>
                {[1, 2, 3, 4, 5].map((index) => (
                    <WaveformBar key={index} index={index} audioLevel={audioLevel} theme={theme} />
                ))}
            </View>
        );
    };

    const translateTextManually = async (text: string, langpair: string) => {
        setIsTranslating(true);
        try {
            const [src, tgt] = langpair.split('|');
            const results = await AIModule.translateTextsAsync([text], src, tgt);
            if (results[0]) {
                setTranslatedText(results[0]);
            } else {
                Alert.alert('Translation Error', 'Could not translate the text.');
            }
        } catch (error) {
            console.error('Manual translation error:', error);
            Alert.alert('Translation Error', 'Could not translate the text.');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleTranslate = async () => {
        if (!inputText.trim()) return;

        setIsTranslating(true);
        try {
            const [src, tgt] = translationDirection === 'en-nl' ? ['en', 'nl'] : ['nl', 'en'];
            const results = await AIModule.translateTextsAsync([inputText], src, tgt);
            if (results[0]) {
                setTranslatedText(results[0]);
            } else {
                Alert.alert('Translation Error', 'Could not translate the text.');
            }
        } catch (error) {
            console.error('Translation error:', error);
            Alert.alert('Translation Error', 'Could not translate the text.');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleSave = async () => {
        if (!inputText || !translatedText) return;

        const english = translationDirection === 'en-nl' ? inputText : translatedText;
        const dutch = translationDirection === 'en-nl' ? translatedText : inputText;

        const newWord = {
            id: `custom_${Date.now()}`,
            dutch,
            english,
            exampleDutch: '',
            exampleEnglish: '',
            categoryId: selectedCategory,
            isCustom: true,
        };

        await addCustomWord(newWord);
        router.back();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Translate & Add</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <X size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.directionControl}>
                        <Text style={[styles.langText, { color: theme.text }]}>
                            {translationDirection === 'en-nl' ? 'English' : 'Dutch'}
                        </Text>
                        <TouchableOpacity onPress={toggleDirection} style={styles.swapButton}>
                            <ArrowLeftRight size={20} color={theme.primary} />
                        </TouchableOpacity>
                        <Text style={[styles.langText, { color: theme.text }]}>
                            {translationDirection === 'en-nl' ? 'Dutch' : 'English'}
                        </Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.textAreaContainer}>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.text + '20' }
                                ]}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Type a word or phrase..."
                                placeholderTextColor={theme.text + '60'}
                                multiline
                                numberOfLines={3}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.micButton,
                                    { backgroundColor: isRecording ? theme.danger : theme.primary + '15' }
                                ]}
                                onPress={isRecording ? stopRecordingAndProcess : startRecording}
                                disabled={isVoiceProcessing}
                            >
                                {isVoiceProcessing ? (
                                    <ActivityIndicator size="small" color={theme.primary} />
                                ) : isRecording ? (
                                    <Ionicons name="square" size={24} color="#fff" />
                                ) : (
                                    <Ionicons name="mic" size={28} color={theme.primary} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isRecording && (
                        <View style={styles.recordingIndicator}>
                            <Text style={[styles.recordingText, { color: theme.danger }]}>
                                Listening...
                            </Text>
                            {renderWaveform()}
                            <Text style={[styles.recordingSubtext, { color: theme.text + '80' }]}>
                                (Stops automatically after 3 seconds of silence)
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.translateButton,
                            { backgroundColor: inputText ? theme.primary : theme.text + '20' }
                        ]}
                        onPress={handleTranslate}
                        disabled={!inputText || isTranslating}
                    >
                        {isTranslating ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Translate</Text>
                        )}
                    </TouchableOpacity>

                    {translatedText ? (
                        <View style={[styles.resultContainer, { backgroundColor: theme.cardBackground, borderColor: theme.primary + '50' }]}>
                            <Text style={[styles.resultLabel, { color: theme.primary }]}>Translation:</Text>
                            <Text style={[styles.resultText, { color: theme.text }]}>{translatedText}</Text>
                        </View>
                    ) : null}

                    {translatedText ? (
                        <>
                            <View style={[styles.inputGroup, { zIndex: 10, marginTop: 20 }]}>
                                <Text style={[styles.label, { color: theme.text }]}>Save to Category</Text>
                                <TouchableOpacity
                                    style={[styles.pickerButton, { backgroundColor: theme.cardBackground, borderColor: theme.text + '20' }]}
                                    onPress={() => setIsCategoryPickerOpen(!isCategoryPickerOpen)}
                                >
                                    <Text style={{ color: theme.text }}>
                                        {categories.find(c => c.id === selectedCategory)?.title || 'Select Category'}
                                    </Text>
                                    <ChevronDown size={20} color={theme.text} />
                                </TouchableOpacity>

                                {isCategoryPickerOpen && (
                                    <View style={[styles.pickerList, { backgroundColor: theme.cardBackground, borderColor: theme.text + '20' }]}>
                                        <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                                            {categories.map((cat) => (
                                                <TouchableOpacity
                                                    key={cat.id}
                                                    style={styles.pickerItem}
                                                    onPress={() => {
                                                        setSelectedCategory(cat.id);
                                                        setIsCategoryPickerOpen(false);
                                                    }}
                                                >
                                                    <Text style={{ color: theme.text }}>{cat.title}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: theme.success }]}
                                onPress={handleSave}
                            >
                                <Text style={styles.buttonText}>Add to My Words</Text>
                            </TouchableOpacity>
                        </>
                    ) : null}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const WaveformBar = ({ audioLevel, theme, index }: { audioLevel: any, theme: any, index: number }) => {
    const animatedStyle = useAnimatedStyle(() => {
        const offset = 0.6 + ((index % 3) * 0.2); // Deterministic pseudo-random scale
        const heightScale = 1 + (audioLevel.value * 2 * offset);
        return {
            transform: [{ scaleY: withTiming(heightScale, { duration: 100 }) }],
            opacity: withTiming(0.3 + (audioLevel.value * 0.7), { duration: 100 })
        };
    });
    return <Animated.View style={[styles.waveformBar, { backgroundColor: theme.primary }, animatedStyle]} />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    form: {
        gap: 20,
        paddingBottom: 50,
    },
    directionControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        gap: 20,
    },
    langText: {
        fontSize: 16,
        fontWeight: '600',
        width: 80,
        textAlign: 'center',
    },
    swapButton: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    inputGroup: {
        position: 'relative',
        zIndex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    textAreaContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    textArea: {
        flex: 1,
        padding: 16,
        paddingRight: 60, // Space for mic button
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 18,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    micButton: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    translateButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultContainer: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 10,
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    resultText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    pickerList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 4,
        maxHeight: 200,
        zIndex: 1000,
        elevation: 5,
    },
    pickerItem: {
        padding: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
    },
    saveButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    recordingIndicator: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        gap: 8,
    },
    recordingText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 4,
    },
    recordingSubtext: {
        fontSize: 12,
        marginTop: 4,
    },
    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        gap: 4,
    },
    waveformBar: {
        width: 6,
        height: 12,
        borderRadius: 3,
    }
});
