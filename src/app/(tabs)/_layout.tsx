import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, View, Platform } from 'react-native';
import { PlusCircle, Languages } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabIcon({ name, color, size = 24 }: { name: keyof typeof Ionicons.glyphMap; color: string; size?: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.border,
          borderTopWidth: 0.5,
          paddingTop: 4,
          height: Platform.OS === 'ios' ? 88 : 64,
          ...Platform.select({
            ios: {
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: -1 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: theme.background,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
        },
        headerShadowVisible: false,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Learn',
          headerTitle: 'Dutchify',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.primary,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'book' : 'book-outline'} color={color} />
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 16 }}>
              <Pressable
                onPress={() => router.push('/translate-word' as any)}
                hitSlop={8}
              >
                {({ pressed }) => (
                  <Languages
                    size={22}
                    color={theme.primary}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
              <Pressable
                onPress={() => router.push('/add-word')}
                hitSlop={8}
              >
                {({ pressed }) => (
                  <PlusCircle
                    size={22}
                    color={theme.primary}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'heart' : 'heart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'flash' : 'flash-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'settings' : 'settings-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
