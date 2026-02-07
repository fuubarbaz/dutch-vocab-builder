import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomWord } from '@/types';

interface FavoritesContextType {
    favorites: string[]; // List of Word IDs
    learnedIds: string[];
    customWords: CustomWord[];
    toggleFavorite: (id: string) => Promise<void>;
    isFavorite: (id: string) => boolean;
    clearFavorites: () => Promise<void>;
    removeFavorites: (ids: string[]) => Promise<void>;
    markAsLearned: (id: string) => Promise<void>;
    isLearned: (id: string) => boolean;
    addCustomWord: (word: CustomWord) => Promise<void>;
    importWords: (words: CustomWord[]) => Promise<void>;
    resetProgress: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [learnedIds, setLearnedIds] = useState<string[]>([]);
    const [customWords, setCustomWords] = useState<CustomWord[]>([]);

    useEffect(() => {
        loadFavorites();
        loadLearned();
        loadCustomWords();
    }, []);

    const loadFavorites = async () => {
        try {
            const stored = await AsyncStorage.getItem('favorites');
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load favorites', e);
        }
    };

    const loadLearned = async () => {
        try {
            const stored = await AsyncStorage.getItem('learned_words');
            if (stored) {
                setLearnedIds(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load learned words', e);
        }
    };

    const loadCustomWords = async () => {
        try {
            const stored = await AsyncStorage.getItem('custom_words');
            if (stored) {
                setCustomWords(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load custom words', e);
        }
    };

    const addCustomWord = async (word: CustomWord) => {
        try {
            const newWords = [...customWords, word];
            setCustomWords(newWords);
            await AsyncStorage.setItem('custom_words', JSON.stringify(newWords));
        } catch (e) {
            console.error('Failed to save custom word', e);
        }
    }

    const toggleFavorite = async (id: string) => {
        try {
            let newFavorites;
            if (favorites.includes(id)) {
                newFavorites = favorites.filter((favId) => favId !== id);
            } else {
                newFavorites = [...favorites, id];
            }
            setFavorites(newFavorites);
            await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
        } catch (e) {
            console.error('Failed to save favorites', e);
        }
    };

    const clearFavorites = async () => {
        try {
            setFavorites([]);
            await AsyncStorage.setItem('favorites', JSON.stringify([]));
        } catch (e) {
            console.error('Failed to clear favorites', e);
        }
    };

    const removeFavorites = async (ids: string[]) => {
        try {
            const newFavorites = favorites.filter((favId) => !ids.includes(favId));
            setFavorites(newFavorites);
            await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
        } catch (e) {
            console.error('Failed to remove favorites', e);
        }
    };

    const markAsLearned = async (id: string) => {
        try {
            if (!learnedIds.includes(id)) {
                const newLearned = [...learnedIds, id];
                setLearnedIds(newLearned);
                await AsyncStorage.setItem('learned_words', JSON.stringify(newLearned));
            }
        } catch (e) {
            console.error('Failed to save learned word', e);
        }
    };

    const resetProgress = async () => {
        try {
            setLearnedIds([]);
            await AsyncStorage.setItem('learned_words', JSON.stringify([]));
        } catch (e) {
            console.error('Failed to reset progress', e);
        }
    };

    const importWords = async (words: CustomWord[]) => {
        try {
            const newWords = [...customWords, ...words];
            setCustomWords(newWords);
            await AsyncStorage.setItem('custom_words', JSON.stringify(newWords));
        } catch (e) {
            console.error('Failed to import words', e);
            throw e;
        }
    };

    const isFavorite = (id: string) => favorites.includes(id);
    const isLearned = (id: string) => learnedIds.includes(id);

    return (
        <FavoritesContext.Provider value={{ favorites, learnedIds, customWords, toggleFavorite, isFavorite, clearFavorites, removeFavorites, markAsLearned, isLearned, addCustomWord, importWords, resetProgress }}>
            {children}
        </FavoritesContext.Provider>
    );

};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
