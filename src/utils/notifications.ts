import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const REMINDER_HOUR_KEY = 'reminder_hour';
export const REMINDER_ENABLED_KEY = 'reminder_enabled';
const REMINDER_CHANNEL_ID = 'daily-practice';

// Configure how notifications appear when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Daily Practice Reminder',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(hour: number): Promise<void> {
  // Cancel any existing reminders before rescheduling
  await cancelDailyReminder();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to practice Dutch!',
      body: 'Keep your streak alive — a few words a day goes a long way.',
      data: { screen: 'vocab-practice' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
