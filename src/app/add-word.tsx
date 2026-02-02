import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavorites } from '@/context/FavoritesContext';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronDown, X } from 'lucide-react-native';

export default function AddWordScreen() {
    const router = useRouter();
    const theme = Colors[useColorScheme() ?? 'light'];
    const { addCustomWord } = useFavorites();

    const [dutch, setDutch] = useState('');
    const [english, setEnglish] = useState('');
    const [exampleDutch, setExampleDutch] = useState('');
    const [exampleEnglish, setExampleEnglish] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(VOCABULARY_DATA[0].id);
    const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);

    const handleSave = async () => {
        if (!dutch || !english) return;

        const newWord = {
            id: `custom_${Date.now()}`,
            dutch,
            english,
            exampleDutch,
            exampleEnglish,
            categoryId: selectedCategory,
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
                    <Text style={[styles.title, { color: theme.text }]}>Add New Word</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <X size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={[styles.inputGroup, { zIndex: 10 }]}>
                        <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                        <TouchableOpacity
                            style={[styles.pickerButton, { backgroundColor: theme.cardBackground, borderColor: theme.text + '20' }]}
                            onPress={() => setIsCategoryPickerOpen(!isCategoryPickerOpen)}
                        >
                            <Text style={{ color: theme.text }}>
                                {VOCABULARY_DATA.find(c => c.id === selectedCategory)?.title || 'Select Category'}
                            </Text>
                            <ChevronDown size={20} color={theme.text} />
                        </TouchableOpacity>

                        {isCategoryPickerOpen && (
                            <View style={[styles.pickerList, { backgroundColor: theme.cardBackground, borderColor: theme.text + '20' }]}>
                                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                                    {VOCABULARY_DATA.map((cat) => (
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

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Dutch Word *</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.text + '20' }]}
                            value={dutch}
                            onChangeText={setDutch}
                            placeholder="e.g. De fiets"
                            placeholderTextColor={theme.text + '60'}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>English Translation *</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.text + '20' }]}
                            value={english}
                            onChangeText={setEnglish}
                            placeholder="e.g. The bicycle"
                            placeholderTextColor={theme.text + '60'}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Example Sentence (Dutch)</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.text + '20' }]}
                            value={exampleDutch}
                            onChangeText={setExampleDutch}
                            placeholder="e.g. Ik ga met de fiets."
                            placeholderTextColor={theme.text + '60'}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Example Translation (English)</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.text + '20' }]}
                            value={exampleEnglish}
                            onChangeText={setExampleEnglish}
                            placeholder="e.g. I go by bike."
                            placeholderTextColor={theme.text + '60'}
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: dutch && english ? theme.primary : theme.text + '20' }
                        ]}
                        onPress={handleSave}
                        disabled={!dutch || !english}
                    >
                        <Text style={styles.saveButtonText}>Save Card</Text>
                    </TouchableOpacity>
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
    inputGroup: {
        gap: 8,
        position: 'relative',
        zIndex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 16,
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
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
