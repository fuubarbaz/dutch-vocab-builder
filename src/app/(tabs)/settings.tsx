import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSettings } from '@/context/SettingsContext';
import { Settings, Volume2, Gauge } from 'lucide-react-native';
import * as Speech from 'expo-speech';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { speechRate, setSpeechRate, showFlashcards, setShowFlashcards } = useSettings();

    const speeds = [0.5, 0.75, 0.9, 1.0, 1.25];

    const testAudio = () => {
        Speech.speak('Hallo, dit is een test.', { language: 'nl', rate: speechRate });
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Gauge size={20} color={theme.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Audio Speed</Text>
                </View>

                <Text style={[styles.description, { color: theme.text + '80' }]}>
                    Adjust how fast the Dutch words are spoken.
                </Text>

                <View style={styles.speedOptions}>
                    {speeds.map((rate) => (
                        <TouchableOpacity
                            key={rate}
                            style={[
                                styles.speedButton,
                                {
                                    backgroundColor: speechRate === rate ? theme.primary : theme.cardBackground,
                                    borderColor: theme.primary
                                }
                            ]}
                            onPress={() => setSpeechRate(rate)}
                        >
                            <Text style={[
                                styles.speedText,
                                { color: speechRate === rate ? '#fff' : theme.text }
                            ]}>
                                {rate}x
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.testButton, { backgroundColor: theme.cardBackground, borderColor: theme.primary }]}
                    onPress={testAudio}
                >
                    <Volume2 size={20} color={theme.primary} />
                    <Text style={[styles.testButtonText, { color: theme.primary }]}>Test Audio Speed</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Settings size={20} color={theme.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>View Mode</Text>
                </View>

                <Text style={[styles.description, { color: theme.text + '80' }]}>
                    Toggle between Flashcards and a scrolling List View.
                </Text>

                <View style={[styles.settingRow, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>Enable Flashcards</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: theme.primary }}
                        thumbColor={showFlashcards ? "#fff" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={setShowFlashcards}
                        value={showFlashcards}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
        marginBottom: 20,
        lineHeight: 22,
    },
    speedOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    speedButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        minWidth: 50,
    },
    speedText: {
        fontWeight: '600',
        fontSize: 16,
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        gap: 10,
    },
    testButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
    }
});
