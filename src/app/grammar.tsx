import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BASIC_GRAMMAR_TOPICS, ADVANCED_GRAMMAR_TOPICS, GrammarTopic } from '@/data/grammar_topics';

function TopicCard({ topic, onPress }: { topic: GrammarTopic; onPress: () => void }) {
    const levelColor = topic.level === 'basic' ? '#10b981' : '#6366f1';

    return (
        <TouchableOpacity style={styles.topicCard} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.topicIcon, { backgroundColor: levelColor + '18' }]}>
                <Ionicons name={topic.icon as any} size={22} color={levelColor} />
            </View>
            <View style={styles.topicContent}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicDescription} numberOfLines={2}>{topic.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
    );
}

export default function GrammarScreen() {
    const router = useRouter();

    const navigateToTopic = (topicId: string) => {
        router.push(`/grammar-topic/${topicId}` as any);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Grammar' }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.headerCard}>
                    <Ionicons name="book-outline" size={28} color="#10b981" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.headerTitle}>Dutch Grammar</Text>
                        <Text style={styles.headerSubtitle}>
                            Learn grammar rules with explanations, examples, and AI-powered quizzes.
                        </Text>
                    </View>
                </View>

                {/* Basic Section */}
                <View style={styles.sectionHeader}>
                    <View style={[styles.sectionBadge, { backgroundColor: '#d1fae5' }]}>
                        <Text style={[styles.sectionBadgeText, { color: '#047857' }]}>BASIC</Text>
                    </View>
                    <Text style={styles.sectionSubtext}>Sentence building & everyday communication</Text>
                </View>

                {BASIC_GRAMMAR_TOPICS.map((topic) => (
                    <TopicCard
                        key={topic.id}
                        topic={topic}
                        onPress={() => navigateToTopic(topic.id)}
                    />
                ))}

                {/* Advanced Section */}
                <View style={[styles.sectionHeader, { marginTop: 28 }]}>
                    <View style={[styles.sectionBadge, { backgroundColor: '#e0e7ff' }]}>
                        <Text style={[styles.sectionBadgeText, { color: '#3730a3' }]}>ADVANCED</Text>
                    </View>
                    <Text style={styles.sectionSubtext}>Complex sentences & advanced constructions</Text>
                </View>

                {ADVANCED_GRAMMAR_TOPICS.map((topic) => (
                    <TopicCard
                        key={topic.id}
                        topic={topic}
                        onPress={() => navigateToTopic(topic.id)}
                    />
                ))}

                <View style={{ height: 40 }} />
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
    },
    headerCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
    sectionHeader: {
        marginBottom: 12,
    },
    sectionBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 6,
    },
    sectionBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    sectionSubtext: {
        fontSize: 13,
        color: '#6b7280',
        marginLeft: 2,
    },
    topicCard: {
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    topicIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topicContent: {
        flex: 1,
        marginLeft: 14,
        marginRight: 8,
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 2,
    },
    topicDescription: {
        fontSize: 13,
        color: '#6b7280',
        lineHeight: 18,
    },
});
