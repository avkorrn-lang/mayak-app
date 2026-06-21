import React from 'react'; import { View, StyleSheet } from 'react-native'; import { useThemeColors } from '../theme';
export default function ProgressBar({ step, total }: { step:number; total:number }) {
  const colors = useThemeColors();
  return (
    <View style={styles.container}>
      {Array.from({length:total}).map((_,i) => (
        <View key={i} style={[styles.dot, { backgroundColor: i < step ? colors.accent : colors.border }]} />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({ container:{flexDirection:'row',gap:6,marginBottom:20}, dot:{flex:1,height:4,borderRadius:2} });
