import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../theme';

export default function Background({ children }: { children: React.ReactNode }) {
  const colors = useThemeColors();
  return (
    <LinearGradient
      colors={['#0B1622', '#132E44', '#0B1622']}
      style={styles.gradient}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
