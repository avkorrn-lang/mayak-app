import React from 'react'; import { View } from 'react-native'; import { MaterialCommunityIcons } from '@expo/vector-icons'; import { useThemeColors } from '../theme';
export default function MayakIcon() {
  const colors = useThemeColors();
  return (
    <View style={{alignItems:'center',justifyContent:'center',marginBottom:8}}>
      <MaterialCommunityIcons name="lighthouse" size={64} color={colors.accent} style={{textShadowColor:'rgba(201,168,76,0.4)',textShadowOffset:{width:0,height:0},textShadowRadius:16}} />
    </View>
  );
}
