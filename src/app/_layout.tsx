import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import TrackPlayer from 'react-native-track-player';

// Register the background playback service once at app startup.
// Must be called before any TrackPlayer API calls.
TrackPlayer.registerPlaybackService(() => require('../services/PlaybackService'));

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

import { FavoritesProvider } from '@/context/FavoritesContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { SRSProvider } from '@/context/SRSContext';
import { MistakeJournalProvider } from '@/context/MistakeJournalContext';
import { AIProvider } from '@/context/AIContext';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import { AIModelGate } from '@/components/AIModelGate';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Passively check for an update when the app launches
  useVersionCheck();

  return (
    <SettingsProvider>
      <FavoritesProvider>
        <SRSProvider>
          <MistakeJournalProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {/* AIModelGate handles the first-run download flow.
                AIProvider sits inside it so the engine state machine only
                starts once the model is confirmed present on disk. */}
            <AIModelGate>
              <AIProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Back' }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                <Stack.Screen name="add-word" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="import" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="quiz" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
                <Stack.Screen name="vocab-practice" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
                <Stack.Screen name="vocab-session" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
                <Stack.Screen name="pronunciation" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
                <Stack.Screen name="sentence-practice" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
                <Stack.Screen name="pronunciation-guide" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
                <Stack.Screen name="writing-exam" options={{}} />
                <Stack.Screen name="writing-exam-exercise" options={{}} />
                <Stack.Screen name="speaking-exam" options={{}} />
                <Stack.Screen name="speaking-exam-exercise" options={{}} />
                <Stack.Screen name="speaking-cheatsheet" options={{}} />
                <Stack.Screen name="mistake-journal" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
              </Stack>
              </AIProvider>
            </AIModelGate>
          </ThemeProvider>
          </MistakeJournalProvider>
        </SRSProvider>
      </FavoritesProvider>
    </SettingsProvider>
  );
}
