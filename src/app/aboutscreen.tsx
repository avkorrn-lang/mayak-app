import React from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity, Alert, Clipboard, BackHandler, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors, Fonts, Spacing } from '../theme';

export default function AboutScreen() {
  const colors = useThemeColors();
  const cardNumber = '2202 2080 0575 8926';
  const copyToClipboard = () => {
    Clipboard.setString(cardNumber);
    Alert.alert('Скопировано', 'Номер карты скопирован в буфер обмена.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[Fonts.title, { color: colors.text }]}>О приложении «Маяк»</Text>

        <View style={[styles.plate, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.plateTitle, { color: colors.accent }]}>Принципы работы</Text>
          <Text style={[styles.text, { color: colors.text }]}>В приложении использованы подходы:</Text>
          <Text style={[styles.bullet, { color: colors.text }]}>• КПТ: отделение фактов от интерпретаций.</Text>
          <Text style={[styles.bullet, { color: colors.text }]}>• РЭПТ: замена жёстких «должен» на «предпочитаю».</Text>
          <Text style={[styles.bullet, { color: colors.text }]}>• DBT: баланс принятия и изменения.</Text>
          <Text style={[styles.bullet, { color: colors.text }]}>• SMART Recovery: инструменты самопомощи.</Text>
          <Text style={[styles.bullet, { color: colors.text }]}>• Тайм-менеджмент: превращение проблемы в действие.</Text>
          <Text style={[styles.text, { color: colors.text, marginTop: 8 }]}>
            Общий смысл концепций — принять то, что уже есть, и предпринять бережные шаги в сфере вашего влияния.
          </Text>
        </View>

        <View style={[styles.plate, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.plateTitle, { color: colors.accent }]}>Контакты</Text>
          <Text style={[styles.text, { color: colors.text }]}>Почта для связи: a.v.korrn@gmail.com</Text>
        </View>

        <View style={[styles.plate, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.plateTitle, { color: colors.accent }]}>Поддержка</Text>
          <Text style={[styles.text, { color: colors.text }]}>
            Приложение полностью бесплатное. Если оно помогло и вы хотите поддержать автора, можете сделать перевод на карту Сбера:
          </Text>
          <TouchableOpacity onPress={copyToClipboard} activeOpacity={0.7}>
            <Text style={[styles.cardNumber, { color: colors.accent }]}>{cardNumber}</Text>
          </TouchableOpacity>
          <Text style={[styles.cardName, { color: colors.textSecondary }]}>Алексей К.</Text>
          <Text style={[styles.text, { color: colors.text, marginTop: 8 }]}>Спасибо за поддержку!</Text>
        </View>

        <TouchableOpacity style={[styles.exitButton, { borderColor: colors.border }]} onPress={() => BackHandler.exitApp()}>
          <Text style={[styles.exitText, { color: colors.textSecondary }]}>Выйти из приложения</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md },
  text: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  plate: { borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1 },
  plateTitle: { fontSize: 17, fontWeight: '600', marginBottom: 8 },
  bullet: { fontSize: 14, marginLeft: 8, marginBottom: 4 },
  cardNumber: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  cardName: { fontSize: 14, textAlign: 'center', marginBottom: 12 },
  exitButton: { borderRadius: 12, padding: 14, borderWidth: 1, alignItems: 'center', marginTop: Spacing.lg },
  exitText: { fontSize: 16, fontWeight: '600' },
});
