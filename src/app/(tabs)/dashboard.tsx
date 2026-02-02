import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useFavorites } from '@/context/FavoritesContext';
import { VOCABULARY_DATA } from '@/data/vocabulary';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { learnedIds, favorites, resetProgress } = useFavorites();

    const totalWords = VOCABULARY_DATA.reduce((acc, category) => acc + category.words.length, 0);
    const learnedCount = learnedIds.length;
    // Unique words favorited? Assuming favorite words are separate logic, but let's count them too.
    // Actually, requirement is "swiped left as done and rest as todo".
    // Favorites are likely "To Review" or separate list.
    // We will calc "To Do" as Total - Learned.

    const todoCount = totalWords - learnedCount;

    const data = [
        {
            name: 'Learned',
            population: learnedCount,
            color: theme.success,
            legendFontColor: theme.text,
            legendFontSize: 15,
        },
        {
            name: 'To Do',
            population: todoCount,
            color: theme.text + '20', // Light grey relative to text
            legendFontColor: theme.text,
            legendFontSize: 15,
        },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.chartContainer}>
                <Text style={[styles.title, { color: theme.text }]}>Your Progress</Text>
                <PieChart
                    data={data}
                    width={screenWidth}
                    height={220}
                    chartConfig={{
                        backgroundColor: theme.background,
                        backgroundGradientFrom: theme.background,
                        backgroundGradientTo: theme.background,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => theme.text,
                    }}
                    accessor={'population'}
                    backgroundColor={'transparent'}
                    paddingLeft={'15'}
                    center={[10, 0]}
                    absolute
                />
            </View>

            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.statNumber, { color: theme.text }]}>{totalWords}</Text>
                    <Text style={[styles.statLabel, { color: theme.text + '80' }]}>Total Words</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.statNumber, { color: theme.success }]}>{learnedCount}</Text>
                    <Text style={[styles.statLabel, { color: theme.text + '80' }]}>Learned</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.statNumber, { color: theme.primary }]}>{favorites.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.text + '80' }]}>Favorites</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.statNumber, { color: theme.danger }]}>{todoCount < 0 ? 0 : todoCount}</Text>
                    <Text style={[styles.statLabel, { color: theme.text + '80' }]}>To Do</Text>
                </View>
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.resetButton, { borderColor: theme.danger }]}
                    onPress={() => {
                        if (Platform.OS === 'web') {
                            if (window.confirm("Are you sure you want to reset your learning progress? This cannot be undone.")) {
                                resetProgress();
                            }
                        } else {
                            Alert.alert(
                                "Reset Progress",
                                "Are you sure you want to reset your learning progress? This cannot be undone.",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Reset", style: "destructive", onPress: resetProgress }
                                ]
                            );
                        }
                    }}
                >
                    <Text style={[styles.resetButtonText, { color: theme.danger }]}>Reset Progress</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
        padding: 16,
    },
    statCard: {
        width: '45%',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
    },
    actionContainer: {
        padding: 16,
        alignItems: 'center',
        marginBottom: 30,
    },
    resetButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        borderWidth: 1,
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
