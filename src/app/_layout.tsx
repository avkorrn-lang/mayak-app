import React, { useEffect } from 'react'; import { Platform, BackHandler, Alert } from 'react-native'; import { Tabs } from 'expo-router'; import { MaterialCommunityIcons } from '@expo/vector-icons'; import { useSafeAreaInsets } from 'react-native-safe-area-context'; import { ThemeContext, ThemeMode } from '../theme';

function TabIcon({ name, color, size = 24 }: { name: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string; size?: number }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  useEffect(() => {
    const onBack = () => { Alert.alert('Выход', 'Хотите закрыть приложение?', [{ text: 'Нет', style: 'cancel' }, { text: 'Да', onPress: () => BackHandler.exitApp() }]); return true; };
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBack);
  }, []);

  return (
    <ThemeContext.Provider value={'dark'}>
      <Tabs screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0B1622', borderTopColor: '#1E2D3A', height: 60 + (Platform.OS === 'android' ? insets.bottom : 0), paddingBottom: Platform.OS === 'android' ? insets.bottom : 8, paddingTop: 8 },
        tabBarActiveTintColor: '#C9A84C',
        tabBarInactiveTintColor: '#7B8FA1',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }
      }}>
        <Tabs.Screen name="index" options={{ tabBarLabel: 'Маяк', tabBarIcon: ({ color }) => <TabIcon name="lighthouse" color={color} /> }} />
        <Tabs.Screen name="compass" options={{ tabBarLabel: 'Компас', tabBarIcon: ({ color }) => <TabIcon name="compass" color={color} /> }} />
        <Tabs.Screen name="inventory" options={{ tabBarLabel: 'АБЦ', tabBarIcon: ({ color }) => <TabIcon name="clipboard-text" color={color} /> }} />
        <Tabs.Screen name="harbor" options={{ tabBarLabel: 'Бухта', tabBarIcon: ({ color }) => <TabIcon name="anchor" color={color} /> }} />
        <Tabs.Screen name="smartscreen" options={{ tabBarLabel: 'СМАРТ', tabBarIcon: ({ color }) => <TabIcon name="brain" color={color} /> }} />
        <Tabs.Screen name="aboutscreen" options={{ tabBarLabel: 'О программе', tabBarIcon: ({ color }) => <TabIcon name="information" color={color} /> }} />
      </Tabs>
    </ThemeContext.Provider>
  );
}
