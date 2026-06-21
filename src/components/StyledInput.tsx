import React from 'react'; import { View, Text, TextInput, StyleSheet } from 'react-native'; import { useThemeColors } from '../theme';
interface Props { label?: string; value: string; onChangeText: (t:string) => void; placeholder?: string; multiline?: boolean; }
export default function StyledInput({ label, value, onChangeText, placeholder, multiline }: Props) {
  const colors = useThemeColors();
  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}
      <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }, multiline && styles.multiline]} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textSecondary} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} />
    </View>
  );
}
const styles = StyleSheet.create({ container:{marginBottom:16}, label:{fontSize:13,marginBottom:6,fontWeight:'500',letterSpacing:0.5}, input:{borderRadius:12,padding:14,fontSize:15,borderWidth:1}, multiline:{minHeight:80} });
