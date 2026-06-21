import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Background from '../components/Background';
import ProgressBar from '../components/ProgressBar';
import StyledButton from '../components/StyledButton';
import { useThemeColors, Fonts, Spacing } from '../theme';

const questions = [
  {
    text: 'Моя картина мира расширилась, а не сузилась?',
    hint: 'Да — я вижу возможности и варианты; Нет — я зациклен только на угрозе.',
  },
  {
    text: 'Энергия растёт, а не уходит в паралич?',
    hint: 'Да — я могу действовать; Нет — я избегаю или замираю.',
  },
  {
    text: 'Я опираюсь на факты, а не на туман будущего?',
    hint: 'Да — я проверяю реальность; Нет — я верю пугающим фантазиям.',
  },
];

function getRecommendation(yesCount: number, colors: any) {
  if (yesCount === 3)
    return {
      status: 'Здоровая мобилизация',
      color: colors.positive,
      rec: 'Ваша тревога сейчас помогает вам действовать. Продолжайте опираться на факты и делать маленькие шаги.',
    };
  if (yesCount === 2)
    return {
      status: 'На грани',
      color: colors.accent,
      rec: 'Тревога скорее мобилизует, но есть риск соскользнуть в руминацию. Попробуйте пройти АБЦ анализ, чтобы чётче разделить факты и фантазии.',
    };
  if (yesCount === 1)
    return {
      status: 'Паралич / избегание',
      color: colors.danger,
      rec: 'Тревога вас парализует. Сделайте паузу: используйте Бухту или технику Серфинг эмоций в СМАРТ, чтобы вернуть ясность.',
    };
  return {
    status: 'Сильная невротическая тревога',
    color: colors.danger,
    rec: 'Похоже, вы захвачены страхом. Остановитесь: 10-минутный таймер в Бухте или упражнение Осада образов в СМАРТ помогут снизить накал.',
  };
}

export default function CompassScreen() {
  const colors = useThemeColors();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<boolean[]>(new Array(3).fill(null));

  const handleAnswer = (index: number, value: boolean) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    if (step < 3) {
      setStep(step + 1);
    } else {
      setStep(4); // завершено
    }
  };

  const yesCount = answers.filter((a) => a === true).length;
  const recommendation = getRecommendation(yesCount, colors);

  return (
    <Background>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="compass" size={64} color={colors.accent} />
          </View>
          <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>Компас</Text>
          <Text style={[Fonts.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md }]}>
            Проверьте, мобилизует ли вас тревога или парализует
          </Text>
          <ProgressBar step={step > 3 ? 3 : step} total={3} />

          {step < 4 && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.questionText, { color: colors.text }]}>{questions[step - 1].text}</Text>
              <Text style={[styles.questionHint, { color: colors.textSecondary }]}>{questions[step - 1].hint}</Text>
              <View style={styles.switchRow}>
                <StyledButton
                  title="Да"
                  onPress={() => handleAnswer(step - 1, true)}
                  variant={answers[step - 1] === true ? 'primary' : 'secondary'}
                />
                <View style={{ width: 10 }} />
                <StyledButton
                  title="Нет"
                  onPress={() => handleAnswer(step - 1, false)}
                  variant={answers[step - 1] === false ? 'primary' : 'secondary'}
                />
              </View>
              {step > 1 && (
                <TouchableOpacity onPress={() => setStep(step - 1)} style={{ marginTop: 12 }}>
                  <Text style={{ color: colors.textSecondary }}>← Вернуться к предыдущему вопросу</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {step === 4 && (
            <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.indicatorRow}>
                <View style={[styles.circle, { backgroundColor: recommendation.color }]}>
                  <MaterialCommunityIcons name="compass" size={40} color={colors.background} />
                </View>
                <Text style={[styles.statusText, { color: recommendation.color }]}>{recommendation.status}</Text>
              </View>
              <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>{recommendation.rec}</Text>
              <StyledButton title="Пройти заново" onPress={() => { setStep(1); setAnswers(new Array(3).fill(null)); }} variant="secondary" />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.md },
  iconContainer: { alignItems: 'center', marginBottom: 8 },
  card: { borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1 },
  questionText: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  questionHint: { fontSize: 12, marginBottom: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between' },
  resultCard: { borderRadius: 16, padding: Spacing.md, borderWidth: 1, marginTop: Spacing.md },
  indicatorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  circle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 },
  statusText: { fontSize: 20, fontWeight: '700', flex: 1 },
  recommendationText: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
});
