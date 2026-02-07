import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Word } from '@/types';
import * as Speech from 'expo-speech';
import { Volume2 } from 'lucide-react-native';

interface FlashCardProps {
    word: Word;
}

export default function FlashCard({ word }: FlashCardProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [showAnswer, setShowAnswer] = useState(false);

    const playAudio = (e: any) => {
        e.stopPropagation(); // Prevent card flip when clicking audio
        Speech.speak(word.dutch, { language: 'nl' });
    };

    return (
        <Pressable onPress={() => setShowAnswer(!showAnswer)} style={[styles.card, { backgroundColor: theme.cardBackground, shadowColor: theme.text }]}>
            <TouchableOpacity onPress={playAudio} style={styles.audioButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Volume2 size={24} color={theme.primary} />
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={[styles.dutch, { color: theme.primary }]}>{word.dutch}</Text>

                {showAnswer ? (
                    <View style={styles.answerContainer}>
                        <Text style={[styles.english, { color: theme.text }]}>{word.english}</Text>
                        <View style={styles.divider} />
                        <Text style={[styles.example, { color: theme.text + '99' }]}>{word.exampleDutch}</Text>
                        <Text style={[styles.exampleTranslation, { color: theme.text + '60' }]}>{word.exampleEnglish}</Text>
                    </View>
                ) : (
                    <Text style={[styles.hint, { color: theme.text + '60' }]}>Tap to reveal</Text>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 320,
        height: 480,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        padding: 24,
        position: 'relative', // Ensure absolute positioning works relative to card
    },
    audioButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 24,
        zIndex: 10,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    dutch: {
        fontSize: 42,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    hint: {
        fontSize: 16,
        fontStyle: 'italic',
    },
    answerContainer: {
        alignItems: 'center',
        width: '100%',
    },
    english: {
        fontSize: 28,
        marginBottom: 24,
        textAlign: 'center',
    },
    divider: {
        width: '50%',
        height: 1,
        backgroundColor: '#ccc',
        marginBottom: 24,
    },
    example: {
        fontSize: 18,
        marginBottom: 8,
        textAlign: 'center',
    },
    exampleTranslation: {
        fontSize: 16,
        textAlign: 'center',
    },
});
