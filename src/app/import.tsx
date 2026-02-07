import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { useFavorites } from '@/context/FavoritesContext';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react-native';
import { CustomWord } from '@/types';

export default function ImportScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { importWords } = useFavorites();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleImport = async () => {
        setStatus('idle');
        setMessage('');

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            setLoading(true);
            const fileUri = result.assets[0].uri;
            const fileContent = await FileSystem.readAsStringAsync(fileUri);

            Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    if (results.errors.length > 0) {
                        setLoading(false);
                        setStatus('error');
                        setMessage(`Error parsing CSV: ${results.errors[0].message}`);
                        return;
                    }

                    const newWords: CustomWord[] = [];
                    const data = results.data as any[];
                    let successCount = 0;
                    let errorCount = 0;

                    for (const row of data) {
                        // Relaxed check: Look for keys regardless of case
                        const dutchKey = Object.keys(row).find(k => k.toLowerCase() === 'dutch');
                        const englishKey = Object.keys(row).find(k => k.toLowerCase() === 'english');
                        const exDutchKey = Object.keys(row).find(k => k.toLowerCase() === 'exampledutch');
                        const exEngKey = Object.keys(row).find(k => k.toLowerCase() === 'exampleenglish');

                        if (dutchKey && englishKey && row[dutchKey] && row[englishKey]) {
                            newWords.push({
                                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                                dutch: row[dutchKey],
                                english: row[englishKey],
                                exampleDutch: exDutchKey ? row[exDutchKey] : '',
                                exampleEnglish: exEngKey ? row[exEngKey] : '',
                                categoryId: 'imported',
                                isCustom: true
                            });
                            successCount++;
                        } else {
                            errorCount++;
                        }
                    }

                    if (newWords.length > 0) {
                        await importWords(newWords);
                        setLoading(false);
                        setStatus('success');
                        setMessage(`Success! Imported ${successCount} words.${errorCount > 0 ? ` (${errorCount} skipped)` : ''}`);
                    } else {
                        setLoading(false);
                        setStatus('error');
                        setMessage('No valid words found. Check column headers.');
                    }
                },
                error: (error: any) => {
                    setLoading(false);
                    setStatus('error');
                    setMessage(`Parsing error: ${error.message}`);
                }
            });

        } catch (error: any) {
            setLoading(false);
            setStatus('error');
            setMessage(`Import failed: ${error.message}`);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ title: 'Import Words' }} />

            <ScrollView contentContainerStyle={styles.content}>

                <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>How to Import</Text>
                    <Text style={[styles.text, { color: theme.text }]}>
                        Upload a CSV file with the following headers:
                    </Text>
                    <View style={[styles.codeBlock, { backgroundColor: theme.background, borderColor: theme.text + '20' }]}>
                        <Text style={[styles.code, { color: theme.text }]}>Dutch,English,ExampleDutch,ExampleEnglish</Text>
                    </View>
                    <Text style={[styles.subtext, { color: theme.text + '80' }]}>
                        * "Example" columns are optional.
                    </Text>
                </View>

                {status === 'success' && (
                    <View style={[styles.feedback, { backgroundColor: '#dcfce7' }]}>
                        <CheckCircle size={24} color="#166534" />
                        <Text style={[styles.feedbackText, { color: '#166534' }]}>{message}</Text>
                    </View>
                )}

                {status === 'error' && (
                    <View style={[styles.feedback, { backgroundColor: '#fee2e2' }]}>
                        <AlertCircle size={24} color="#991b1b" />
                        <Text style={[styles.feedbackText, { color: '#991b1b' }]}>{message}</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
                    onPress={handleImport}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Upload size={20} color="#fff" />
                            <Text style={styles.buttonText}>Select CSV File</Text>
                        </>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    card: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    text: {
        fontSize: 16,
        marginBottom: 12,
        lineHeight: 24,
    },
    codeBlock: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
    },
    code: {
        fontFamily: 'monospace', // Platform specific font might be better like Courier
        fontSize: 14,
    },
    subtext: {
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 8,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    feedback: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        gap: 12,
    },
    feedbackText: {
        fontSize: 16,
        flex: 1,
        fontWeight: '500',
    },
});
