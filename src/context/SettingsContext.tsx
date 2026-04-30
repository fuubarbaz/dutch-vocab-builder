import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
    speechRate: number;
    setSpeechRate: (rate: number) => Promise<void>;
    showFlashcards: boolean;
    setShowFlashcards: (show: boolean) => Promise<void>;
    phrasePause: number;
    setPhrasePause: (seconds: number) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [speechRate, setSpeechRateState] = useState<number>(0.9);
    const [showFlashcards, setShowFlashcardsState] = useState<boolean>(true);
    const [phrasePause, setPhrasePauseState] = useState<number>(1);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const storedRate = await AsyncStorage.getItem('settings_speech_rate');
            if (storedRate) {
                setSpeechRateState(parseFloat(storedRate));
            }

            const storedShowFlashcards = await AsyncStorage.getItem('settings_show_flashcards');
            if (storedShowFlashcards !== null) {
                setShowFlashcardsState(JSON.parse(storedShowFlashcards));
            }

            const storedPhrasePause = await AsyncStorage.getItem('settings_phrase_pause');
            if (storedPhrasePause !== null) {
                setPhrasePauseState(parseFloat(storedPhrasePause));
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        }
    };

    const setSpeechRate = async (rate: number) => {
        try {
            setSpeechRateState(rate);
            await AsyncStorage.setItem('settings_speech_rate', rate.toString());
        } catch (e) {
            console.error('Failed to save speech rate', e);
        }
    };

    const setShowFlashcards = async (show: boolean) => {
        try {
            setShowFlashcardsState(show);
            await AsyncStorage.setItem('settings_show_flashcards', JSON.stringify(show));
        } catch (e) {
            console.error('Failed to save show flashcards setting', e);
        }
    };

    const setPhrasePause = async (seconds: number) => {
        try {
            setPhrasePauseState(seconds);
            await AsyncStorage.setItem('settings_phrase_pause', seconds.toString());
        } catch (e) {
            console.error('Failed to save phrase pause setting', e);
        }
    };

    return (
        <SettingsContext.Provider value={{
            speechRate, setSpeechRate,
            showFlashcards, setShowFlashcards,
            phrasePause, setPhrasePause,
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
