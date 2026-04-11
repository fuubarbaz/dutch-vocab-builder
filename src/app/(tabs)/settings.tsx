import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSettings } from '@/context/SettingsContext';
import { Volume2, Check, Bell, BellOff } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
  REMINDER_HOUR_KEY,
  REMINDER_ENABLED_KEY,
} from '@/utils/notifications';

const REMINDER_HOURS = [7, 8, 9, 10, 12, 18, 19, 20, 21];

function formatHour(hour: number): string {
  const suffix = hour < 12 ? 'AM' : 'PM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}${suffix}`;
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const {
    speechRate, setSpeechRate,
    showFlashcards, setShowFlashcards,
  } = useSettings();

  const [reminderEnabled, setReminderEnabled] = React.useState(false);
  const [reminderHour, setReminderHour] = React.useState(8);

  // Load saved reminder prefs
  React.useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(REMINDER_ENABLED_KEY),
      AsyncStorage.getItem(REMINDER_HOUR_KEY),
    ]).then(([enabled, hour]) => {
      if (enabled !== null) setReminderEnabled(JSON.parse(enabled));
      if (hour !== null) setReminderHour(parseInt(hour, 10));
    }).catch(() => {});
  }, []);

  const handleToggleReminder = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Enable notifications in Settings to receive daily practice reminders.',
        );
        return;
      }
      await scheduleDailyReminder(reminderHour);
    } else {
      await cancelDailyReminder();
    }
    setReminderEnabled(value);
    await AsyncStorage.setItem(REMINDER_ENABLED_KEY, JSON.stringify(value)).catch(() => {});
  };

  const handleSelectHour = async (hour: number) => {
    setReminderHour(hour);
    await AsyncStorage.setItem(REMINDER_HOUR_KEY, hour.toString()).catch(() => {});
    if (reminderEnabled) {
      await scheduleDailyReminder(hour);
    }
  };

  const speeds = [
    { value: 0.5, label: '0.5x', description: 'Slow' },
    { value: 0.75, label: '0.75x', description: 'Relaxed' },
    { value: 0.9, label: '0.9x', description: 'Normal' },
    { value: 1.0, label: '1.0x', description: 'Natural' },
    { value: 1.25, label: '1.25x', description: 'Fast' },
  ];

  const testAudio = () => {
    Speech.speak('Hallo, dit is een test.', { language: 'nl', rate: speechRate });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Audio Speed */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>AUDIO SPEED</Text>
      <View style={[styles.groupCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.speedGrid}>
          {speeds.map((speed) => {
            const isActive = speechRate === speed.value;
            return (
              <TouchableOpacity
                key={speed.value}
                style={[
                  styles.speedOption,
                  { borderColor: theme.border },
                  isActive && { borderColor: theme.primary, backgroundColor: theme.primary + '08' },
                ]}
                onPress={() => setSpeechRate(speed.value)}
              >
                {isActive && (
                  <View style={[styles.speedCheck, { backgroundColor: theme.primary }]}>
                    <Check size={10} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
                <Text style={[
                  styles.speedValue,
                  { color: theme.text },
                  isActive && { color: theme.primary },
                ]}>
                  {speed.label}
                </Text>
                <Text style={[styles.speedDesc, { color: theme.textSecondary }]}>
                  {speed.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: theme.surfaceSecondary }]}
          onPress={testAudio}
          activeOpacity={0.7}
        >
          <Volume2 size={18} color={theme.primary} />
          <Text style={[styles.testButtonText, { color: theme.primary }]}>Test Audio</Text>
        </TouchableOpacity>
      </View>

      {/* View Mode */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>VIEW MODE</Text>
      <View style={[styles.groupCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>Flashcard Mode</Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
              Swipeable cards instead of a scrolling list
            </Text>
          </View>
          <Switch
            trackColor={{ false: theme.surfaceTertiary, true: theme.primary }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={theme.surfaceTertiary}
            onValueChange={setShowFlashcards}
            value={showFlashcards}
          />
        </View>
      </View>

      {/* Daily Reminders */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>DAILY REMINDER</Text>
      <View style={[styles.groupCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingRow}>
          <View style={[styles.reminderIconWrap, { backgroundColor: reminderEnabled ? theme.primary + '15' : theme.surfaceSecondary }]}>
            {reminderEnabled
              ? <Bell size={20} color={theme.primary} />
              : <BellOff size={20} color={theme.textSecondary} />
            }
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>Practice Reminder</Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
              {reminderEnabled ? `Daily at ${formatHour(reminderHour)}` : 'Get a nudge each day to practice'}
            </Text>
          </View>
          <Switch
            trackColor={{ false: theme.surfaceTertiary, true: theme.primary }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={theme.surfaceTertiary}
            onValueChange={handleToggleReminder}
            value={reminderEnabled}
          />
        </View>

        {reminderEnabled && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Reminder time</Text>
            <View style={styles.hourGrid}>
              {REMINDER_HOURS.map(h => {
                const active = reminderHour === h;
                return (
                  <TouchableOpacity
                    key={h}
                    onPress={() => handleSelectHour(h)}
                    style={[
                      styles.hourChip,
                      { borderColor: theme.border, backgroundColor: theme.surfaceSecondary },
                      active && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                  >
                    <Text style={[styles.hourChipText, { color: active ? '#fff' : theme.text }]}>
                      {formatHour(h)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  groupCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  speedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  speedOption: {
    flex: 1,
    minWidth: 58,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    position: 'relative',
  },
  speedCheck: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedValue: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  speedDesc: {
    fontSize: 10,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  testButtonText: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: FontSize.footnote,
    lineHeight: 18,
  },
  reminderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
  },
  timeLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.3,
    marginBottom: Spacing.md,
  },
  hourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  hourChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  hourChipText: {
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.medium,
  },
});
