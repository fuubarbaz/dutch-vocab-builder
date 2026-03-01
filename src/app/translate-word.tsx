import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavorites } from '@/context/FavoritesContext';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronDown, X, ArrowLeftRight } from 'lucide-react-native';

export default function TranslateWordScreen() {
    const router = useRouter();
    const theme = Colors[useColorScheme() ?? 'light'];
    const { addCustomWord } = useFavorites();

    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationDirection, setTranslationDirection] = useState<'en-nl' | 'nl-en'>('en-nl');

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

    const handleTranslate = async () => {
        if (!inputText.trim()) return;

        setIsTranslating(true);
        try {
            const langpair = translationDirection === 'en-nl' ? 'en|nl' : 'nl|en';
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=${langpair}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.responseStatus === 200) {
                let text = data.responseData.translatedText;
                try {
                    text = decodeURIComponent(text);
                } catch {
                    text = text.replace(/%20/g, ' ');
                }
                setTranslatedText(text);
            } else {
                Alert.alert('Translation Error', 'Could not translate the text. Please try again.');
            }
        } catch (error) {
            console.error('Translation error:', error);
            Alert.alert('Network Error', 'Please check your internet connection and try again.');
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
                    </View>

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
    textArea: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 18,
        minHeight: 100,
        textAlignVertical: 'top',
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
});
