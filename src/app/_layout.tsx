import React, { useEffect } from 'react';
import { Platform, BackHandler, Alert, ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme';

function TabIcon({ name, color, size = 24 }: { name: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: ColorValue; size?: number }) {
  return <MaterialCommunityIcons name={name} size={size} color={color as string} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const handler = () => {
      Alert.alert('Выход', 'Хотите закрыть приложение?', [
        { text: 'Нет', style: 'cancel' },
        { text: 'Да', onPress: () => BackHandler.exitApp() }
      ]);
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider value={'dark'}>
      <Tabs screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B1622' as ColorValue,
          borderTopColor: '#1E2D3A' as ColorValue,
          height: 60 + (Platform.OS === 'android' ? insets.bottom : 0),
          paddingBottom: Platform.OS === 'android' ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#C9A84C' as ColorValue,
        tabBarInactiveTintColor: '#7B8FA1' as ColorValue,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }
      }}>
        <Tabs.Screen name="index" options={{ tabBarLabel: 'Компас', tabBarIcon: ({ color }) => <TabIcon name="compass" color={color} /> }} />
        <Tabs.Screen name="techniques" options={{ tabBarLabel: 'Техники', tabBarIcon: ({ color }) => <TabIcon name="brain" color={color} /> }} />
        <Tabs.Screen name="skills" options={{ tabBarLabel: 'Навыки', tabBarIcon: ({ color }) => <TabIcon name="school" color={color} /> }} />
        <Tabs.Screen name="inventory" options={{ tabBarLabel: 'АБЦ', tabBarIcon: ({ color }) => <TabIcon name="clipboard-text" color={color} /> }} />
        <Tabs.Screen name="aboutscreen" options={{ tabBarLabel: 'О программе', tabBarIcon: ({ color }) => <TabIcon name="information" color={color} /> }} />
      </Tabs>
    </ThemeContext.Provider>
  );
}
