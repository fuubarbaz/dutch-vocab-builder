import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AudioLines, GraduationCap, PenLine, MessagesSquare,
  MessageCircle, ChevronRight, Mic2, Drama, ScanSearch,
} from 'lucide-react-native';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type Tool = {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  color: string;
  route: string;
};

const LANGUAGE_TOOLS: Tool[] = [
  {
    icon: ScanSearch,
    title: 'Wat zie ik?',
    subtitle: 'Point your camera, get it described in Dutch',
    color: '#14b8a6',
    route: '/picture-describe',
  },
  {
    icon: AudioLines,
    title: 'Pronunciation Guide',
    subtitle: 'Rules, sounds & live examples',
    color: '#6366f1',
    route: '/pronunciation-guide',
  },
  {
    icon: Mic2,
    title: 'Vowel Practice',
    subtitle: 'Listen, record & compare vowel sounds',
    color: '#0ea5e9',
    route: '/vowel-practice',
  },
  {
    icon: GraduationCap,
    title: 'Grammar Topics',
    subtitle: 'Rules & explanations',
    color: '#10b981',
    route: '/grammar',
  },
  {
    icon: MessagesSquare,
    title: 'Learn Phrases',
    subtitle: '778 phrases across 9 topics',
    color: '#0ea5e9',
    route: '/learn-phrases',
  },
  {
    icon: PenLine,
    title: 'Sentence Builder',
    subtitle: 'Construct full phrases',
    color: '#f59e0b',
    route: '/sentence-builder',
  },
];

const PRACTICE_TOOLS: Tool[] = [
  {
    icon: MessageCircle,
    title: 'Small Talk',
    subtitle: 'AI-generated Dutch conversations',
    color: '#ec4899',
    route: '/small-talk',
  },
  {
    icon: Drama,
    title: 'Roleplay',
    subtitle: 'Play out a scene, turn by turn',
    color: '#8b5cf6',
    route: '/roleplay',
  },
];


function ToolRow({ tool, onPress }: { tool: Tool; onPress: () => void }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const Icon = tool.icon;

  return (
    <TouchableOpacity
      style={[styles.toolRow, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.toolIcon, { backgroundColor: tool.color + '18' }]}>
        <Icon size={22} color={tool.color} />
      </View>
      <View style={styles.toolText}>
        <Text style={[styles.toolTitle, { color: theme.text }]}>{tool.title}</Text>
        <Text style={[styles.toolSubtitle, { color: theme.textSecondary }]}>{tool.subtitle}</Text>
      </View>
      <ChevronRight size={18} color={theme.textSecondary} />
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Language section */}
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>LANGUAGE</Text>
        <View style={styles.group}>
          {LANGUAGE_TOOLS.map((tool, i) => (
            <React.Fragment key={tool.route}>
              <ToolRow tool={tool} onPress={() => router.push(tool.route as any)} />
              {i < LANGUAGE_TOOLS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Practice section */}
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>PRACTICE</Text>
        <View style={styles.group}>
          {PRACTICE_TOOLS.map((tool, i) => (
            <React.Fragment key={tool.route}>
              <ToolRow tool={tool} onPress={() => router.push(tool.route as any)} />
              {i < PRACTICE_TOOLS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg },
  sectionHeader: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  group: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolText: { flex: 1 },
  toolTitle: { fontSize: FontSize.subhead, fontWeight: FontWeight.semibold, marginBottom: 2 },
  toolSubtitle: { fontSize: FontSize.footnote },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 44 + Spacing.md + Spacing.lg },
});
