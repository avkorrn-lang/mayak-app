import { createContext, useContext } from 'react';
export type ThemeMode = 'light' | 'dark';
export interface ThemeColors {
  background: string; surface: string; border: string; text: string; textSecondary: string; accent: string; accentSoft: string; positive: string; danger: string;
}
const DarkColors: ThemeColors = { background:'#0B1622', surface:'#131E2B', border:'#1E2D3A', text:'#D0D9E2', textSecondary:'#7B8FA1', accent:'#C9A84C', accentSoft:'rgba(201,168,76,0.15)', positive:'#4F9F6E', danger:'#C44F4F' };
export const ThemeContext = createContext<ThemeMode>('dark');
export function useThemeColors(): ThemeColors { return DarkColors; }
export const Fonts = { title: { fontSize:30, fontWeight:'700' as const }, subtitle: { fontSize:16, fontWeight:'400' as const, lineHeight:24 }, body: { fontSize:15 } };
export const Spacing = { xs:8, sm:12, md:20, lg:28, xl:40 };
