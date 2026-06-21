import React from 'react'; import { TouchableOpacity, Text, StyleSheet } from 'react-native'; import { useThemeColors } from '../theme';
interface Props { title: string; onPress: () => void; variant?: 'primary' | 'secondary'; disabled?: boolean; }
export default function StyledButton({ title, onPress, variant = 'primary', disabled = false }: Props) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity style={[styles.button, variant === 'primary' ? { backgroundColor: colors.accent } : { backgroundColor:'transparent', borderWidth:1, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.7} disabled={disabled}>
      <Text style={[styles.text, variant === 'primary' ? { color: colors.background } : { color: colors.accent }]}>{title}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({ button:{paddingVertical:14,paddingHorizontal:28,borderRadius:12,alignItems:'center',justifyContent:'center',marginVertical:6}, text:{fontSize:16,fontWeight:'600'} });
