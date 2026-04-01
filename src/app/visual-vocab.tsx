import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Camera, ImageIcon, Eye, Volume2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import AIModule from 'dutch-vocab-ai';

type VocabItem = {
    dutch: string;
    english: string;
};

type ImageResult = {
    objects: VocabItem[];
    sentence: string;
    translation: string;
    raw: string;
};

function parseImageResult(raw: string): ImageResult {
    const objects: VocabItem[] = [];
    let sentence = '';
    let translation = '';

    const lines = raw.split('\n');
    let section = '';

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.toUpperCase().startsWith('OBJECTS:')) {
            section = 'objects';
            continue;
        } else if (trimmed.toUpperCase().startsWith('SENTENCE:')) {
            section = 'sentence';
            continue;
        } else if (trimmed.toUpperCase().startsWith('TRANSLATION:')) {
            section = 'translation';
            continue;
        } else if (trimmed.toUpperCase().startsWith('NOTE:')) {
            section = 'note';
            continue;
        }

        if (!trimmed || trimmed === '-') continue;

        if (section === 'objects' && trimmed.startsWith('-')) {
            const content = trimmed.replace(/^-\s*/, '');
            const match = content.match(/^(?:het|de|een)\s+(.+?)\s*\((.+?)\)$/i);
            if (match) {
                const articleAndWord = content.substring(0, content.indexOf('(')).trim();
                objects.push({ dutch: articleAndWord, english: match[2].trim() });
            } else {
                const parenMatch = content.match(/^(.+?)\s*\((.+?)\)$/);
                if (parenMatch) {
                    objects.push({ dutch: parenMatch[1].trim(), english: parenMatch[2].trim() });
                }
            }
        } else if (section === 'sentence') {
            sentence += (sentence ? ' ' : '') + trimmed;
        } else if (section === 'translation') {
            translation += (translation ? ' ' : '') + trimmed;
        }
    }

    return { objects, sentence, translation, raw };
}

export default function VisualVocabScreen() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [result, setResult] = useState<ImageResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const pickImage = async (useCamera: boolean) => {
        try {
            if (useCamera) {
                const permission = await ImagePicker.requestCameraPermissionsAsync();
                if (!permission.granted) {
                    Alert.alert('Permission needed', 'Camera access is required to take photos.');
                    return;
                }
            } else {
                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permission.granted) {
                    Alert.alert('Permission needed', 'Photo library access is required to pick images.');
                    return;
                }
            }

            const pickerResult = useCamera
                ? await ImagePicker.launchCameraAsync({
                    base64: true,
                    quality: 0.7,
                    allowsEditing: true,
                })
                : await ImagePicker.launchImageLibraryAsync({
                    base64: true,
                    quality: 0.7,
                    allowsEditing: true,
                });

            if (pickerResult.canceled || !pickerResult.assets[0]) return;

            const asset = pickerResult.assets[0];
            setImageUri(asset.uri);
            setResult(null);

            if (asset.base64) {
                await analyzeImage(asset.base64);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const analyzeImage = async (base64: string) => {
        setIsAnalyzing(true);
        try {
            const raw = await AIModule.describeImageAsync(base64);
            const parsed = parseImageResult(raw);
            setResult(parsed);
        } catch (error) {
            console.error('Image analysis error:', error);
            Alert.alert('Error', 'Failed to analyze image. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const speakDutch = (text: string) => {
        Speech.speak(text, { language: 'nl-NL', rate: 0.8 });
    };

    const reset = () => {
        setImageUri(null);
        setResult(null);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Visual Vocab' }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <Eye color="#f59e0b" size={24} />
                        <Text style={styles.cardTitle}>Visual Vocab</Text>
                    </View>
                    <Text style={styles.description}>
                        Take a photo or pick an image to identify objects and learn their Dutch names, powered by Apple Intelligence on-device vision.
                    </Text>
                </View>

                {/* Image Source Buttons */}
                {!imageUri && (
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity
                            style={[styles.sourceButton, styles.cameraButton]}
                            onPress={() => pickImage(true)}
                        >
                            <Camera color="white" size={28} />
                            <Text style={styles.sourceButtonText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sourceButton, styles.galleryButton]}
                            onPress={() => pickImage(false)}
                        >
                            <ImageIcon color="white" size={28} />
                            <Text style={styles.sourceButtonText}>Pick from Gallery</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Image Preview */}
                {imageUri && (
                    <View style={styles.imageCard}>
                        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

                        {isAnalyzing && (
                            <View style={styles.analyzingOverlay}>
                                <ActivityIndicator size="large" color="#f59e0b" />
                                <Text style={styles.analyzingText}>Analyzing with Apple Intelligence...</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Results */}
                {result && (
                    <>
                        {/* Vocabulary Items */}
                        {result.objects.length > 0 && (
                            <View style={styles.resultCard}>
                                <Text style={styles.sectionTitle}>Vocabulary Found</Text>
                                {result.objects.map((item, index) => (
                                    <View key={index} style={styles.vocabRow}>
                                        <View style={styles.vocabTextContainer}>
                                            <Text style={styles.dutchWord}>{item.dutch}</Text>
                                            <Text style={styles.englishWord}>{item.english}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.speakButton}
                                            onPress={() => speakDutch(item.dutch)}
                                        >
                                            <Volume2 color="#f59e0b" size={20} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Sentence */}
                        {result.sentence && (
                            <View style={styles.sentenceCard}>
                                <Text style={styles.sectionTitle}>Describe in Dutch</Text>

                                <TouchableOpacity
                                    style={styles.sentenceRow}
                                    onPress={() => speakDutch(result.sentence)}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.dutchSentence}>{result.sentence}</Text>
                                        <Text style={styles.englishSentence}>{result.translation}</Text>
                                    </View>
                                    <Volume2 color="#f59e0b" size={22} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}

                {/* Try Another */}
                {imageUri && !isAnalyzing && (
                    <View style={styles.tryAnotherContainer}>
                        <TouchableOpacity style={styles.tryAnotherButton} onPress={reset}>
                            <Text style={styles.tryAnotherText}>Try Another Image</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
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
    buttonGroup: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    sourceButton: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 32,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    cameraButton: {
        backgroundColor: '#f59e0b',
    },
    galleryButton: {
        backgroundColor: '#6366f1',
    },
    sourceButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    imageCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: '#000',
    },
    image: {
        width: '100%',
        height: 280,
    },
    analyzingOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    analyzingText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    resultCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    vocabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    vocabTextContainer: {
        flex: 1,
    },
    dutchWord: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 2,
    },
    englishWord: {
        fontSize: 14,
        color: '#6b7280',
    },
    speakButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#fffbeb',
    },
    sentenceCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fde68a',
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
    },
    sentenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dutchSentence: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1f2937',
        lineHeight: 24,
        marginBottom: 6,
    },
    englishSentence: {
        fontSize: 14,
        color: '#6b7280',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    tryAnotherContainer: {
        marginTop: 4,
    },
    tryAnotherButton: {
        backgroundColor: '#e5e7eb',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    tryAnotherText: {
        color: '#4b5563',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
