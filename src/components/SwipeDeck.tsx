import React, { useState } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, interpolate, Extrapolate, withTiming } from 'react-native-reanimated';
import { Word } from '@/types';
import FlashCard from './FlashCard';
import { useFavorites } from '@/context/FavoritesContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Check, X, Heart, Trash2 } from 'lucide-react-native';

interface SwipeDeckProps {
    words: Word[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function SwipeDeck({ words }: SwipeDeckProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { toggleFavorite, markAsLearned, deleteCustomWord } = useFavorites();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const contextX = useSharedValue(0);
    const contextY = useSharedValue(0);

    const handleNext = (direction: 'left' | 'right') => {
        const word = words[currentIndex];
        if (direction === 'right') {
            if (currentIndex < words.length) {
                toggleFavorite(word.id);
                // Also mark as learned when favorited? Usually yes, user has seen it. 
                // Requirement says "swiped left as done and rest as to do". 
                // I will ONLY mark as learned on LEFT swipe as specifically requested.
            }
        } else if (direction === 'left') {
            if (currentIndex < words.length) {
                markAsLearned(word.id);
            }
        }
        setCurrentIndex((prev) => prev + 1);
        translateX.value = 0;
        translateY.value = 0;
    };

    const gesture = Gesture.Pan()
        .onStart(() => {
            contextX.value = translateX.value;
            contextY.value = translateY.value;
        })
        .onUpdate((event) => {
            translateX.value = contextX.value + event.translationX;
            translateY.value = contextY.value + event.translationY;
        })
        .onEnd(() => {
            if (translateX.value > SWIPE_THRESHOLD) {
                // Swipe Right (Favorite)
                translateX.value = withTiming(SCREEN_WIDTH + 100, {}, () => {
                    runOnJS(handleNext)('right');
                });
            } else if (translateX.value < -SWIPE_THRESHOLD) {
                // Swipe Left (Next/Skip)
                translateX.value = withTiming(-SCREEN_WIDTH - 100, {}, () => {
                    runOnJS(handleNext)('left');
                });
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            translateX.value,
            [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            [-10, 0, 10],
            Extrapolate.CLAMP
        );

        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${rotate}deg` },
            ],
        };
    });

    const nextStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            Math.abs(translateX.value),
            [0, SCREEN_WIDTH],
            [0.9, 1],
            Extrapolate.CLAMP
        );
        return {
            transform: [{ scale }]
        }
    });

    // Overlay opacity for feedback
    const rightOpacity = useAnimatedStyle(() => {
        return {
            opacity: interpolate(translateX.value, [0, SCREEN_WIDTH / 4], [0, 1])
        }
    })

    const leftOpacity = useAnimatedStyle(() => {
        return {
            opacity: interpolate(translateX.value, [0, -SCREEN_WIDTH / 4], [0, 1])
        }
    })


    if (currentIndex >= words.length) {
        return (
            <View style={styles.container}>
                <Text style={[styles.finishedText, { color: theme.text }]}>Category Completed! 🎉</Text>
            </View>
        );
    }

    const currentWord = words[currentIndex];
    const nextWord = words[currentIndex + 1];

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.cardContainer}>
                {/* Background Card (Next) */}
                {nextWord && (
                    <Animated.View style={[styles.cardWrapper, styles.backgroundCard, nextStyle]}>
                        <FlashCard word={nextWord} />
                    </Animated.View>
                )}

                {/* Foreground Card (Current) */}
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[styles.cardWrapper, animatedStyle]}>
                        <FlashCard word={currentWord} />

                        {/* Overlays */}
                        <Animated.View style={[styles.overlay, styles.choiceLike, rightOpacity]}>
                            <Heart size={50} color="#fff" fill="#fff" />
                            <Text style={styles.overlayText}>FAVORITE</Text>
                        </Animated.View>

                        <Animated.View style={[styles.overlay, styles.choiceNope, leftOpacity]}>
                            <X size={50} color="#fff" />
                            <Text style={styles.overlayText}>NEXT</Text>
                        </Animated.View>

                        {/* Delete Button for Custom Words */}
                        {currentWord.isCustom && (
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => {
                                    deleteCustomWord(currentWord.id);
                                    handleNext('left'); // Skip to next card after deleting
                                }}
                            >
                                <Trash2 size={24} color="#ef4444" />
                            </TouchableOpacity>
                        )}

                    </Animated.View>
                </GestureDetector>
            </View>

            <View style={styles.instructions}>
                <Text style={{ color: theme.text + '80' }}>Swipe Right to Favorite • Swipe Left to Skip</Text>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    cardWrapper: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backgroundCard: {
        zIndex: -1,
    },
    finishedText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    instructions: {
        paddingBottom: 40,
    },
    overlay: {
        position: 'absolute',
        top: 40,
        padding: 10,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    choiceLike: {
        left: 40,
        borderColor: '#10b981',
        backgroundColor: '#10b981cc',
        transform: [{ rotate: '-30deg' }]
    },
    choiceNope: {
        right: 40,
        borderColor: '#ef4444',
        backgroundColor: '#ef4444cc',
        transform: [{ rotate: '30deg' }]
    },
    overlayText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 4
    },
    deleteButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#fee2e2',
        padding: 12,
        borderRadius: 30,
        zIndex: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    }
});
