import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Background from '../components/Background';
import StyledButton from '../components/StyledButton';
import { useThemeColors, Fonts, Spacing } from '../theme';

const QUICK_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const SYMPTOMS = [
  'Тяжесть',
  'Жар',
  'Дрожь',
  'Сжатие, напряжение',
  'Пустота',
  'Учащённое сердцебиение',
  'Потливость',
  'Ком в горле',
  'Ничего особенного, я спокоен',
];

const EMOTIONS = [
  { label: 'Страх', icon: '😨', color: '#7B8FA1' },
  { label: 'Гнев', icon: '😠', color: '#C44F4F' },
  { label: 'Грусть', icon: '😢', color: '#5B7FA5' },
  { label: 'Стыд', icon: '😳', color: '#B57B6B' },
  { label: 'Вина', icon: '😞', color: '#8B6B84' },
  { label: 'Отвращение', icon: '🤢', color: '#6B8B5B' },
  { label: 'Радость', icon: '😊', color: '#4F9F6E' },
  { label: 'Любовь', icon: '❤️', color: '#C44F7F' },
];

const URGES = [
  'Сжаться, спрятаться, исчезнуть',
  'Убежать',
  'Ударить, спорить, крушить',
  'Замереть',
  'Плакать',
  'Ничего не хочется, я в порядке',
];

// Связи эмоций, симптомов и техник (упрощённая модель, можно доработать с психотерапевтом)
const TECHNIQUE_LINKS: Record<string, string[]> = {
  'Страх': ['Проверка фактов', 'Радикальное принятие'],
  'Гнев': ['STOP', 'Противоположное действие'],
  'Грусть': ['Безусловное самопринятие', 'Накопление положительных эмоций'],
  'Стыд': ['Безусловное самопринятие', 'Полуулыбка'],
  'Вина': ['Проверка фактов', 'Безусловное самопринятие'],
  'Отвращение': ['Радикальное принятие', 'Противоположное действие'],
  'Радость': ['Накопление положительных эмоций'],
  'Любовь': ['Накопление положительных эмоций'],
};

const TECHNIQUE_DETAILS: Record<string, { section: string; router: string | null }> = {
  'Проверка фактов': { section: 'СМАРТ (скоро появится)', router: null },
  'Противоположное действие': { section: 'СМАРТ (скоро появится)', router: null },
  'STOP': { section: 'Бухта → Ритуалы (скоро появится)', router: null },
  'Радикальное принятие': { section: 'Бухта → Ритуалы', router: '/harbor' },
  'Безусловное самопринятие': { section: 'СМАРТ → Техника «Безусловное самопринятие»', router: '/smartscreen' },
  'Полуулыбка': { section: 'Бухта → Ритуалы', router: '/harbor' },
  'Самоуспокоение через 5 чувств': { section: 'Бухта → Ритуалы', router: '/harbor' },
  'Накопление положительных эмоций': { section: 'Бухта → Ритуалы (скоро появится)', router: null },
};

function getLevel(value: number) {
  if (value <= 40) return { level: 'green', title: 'Решать', subtitle: '0–40% · Я могу мыслить', icon: 'lightbulb-on-outline' as const, desc: 'Ваш уровень дистресса невысок. Подойдут навыки когнитивной работы.', color: '#4F9F6E' };
  if (value <= 65) return { level: 'yellow', title: 'Пережить', subtitle: '40–65% · Мне нужно пережить', icon: 'shield-half-full' as const, desc: 'Эмоция мешает ясно мыслить. Лучше использовать навыки перенесения дистресса.', color: '#C9A84C' };
  return { level: 'red', title: 'Сбросить', subtitle: '65–100% · Стоп, сброс напряжения', icon: 'alert-octagon' as const, desc: 'Эмоция захлёстывает. Необходимо быстро снизить накал.', color: '#C44F4F' };
}

function getRecommendedTechniques(emotions: string[], level: number): string[] {
  // Собираем техники, соответствующие выбранным эмоциям
  let techniques: string[] = [];
  emotions.forEach(em => {
    if (TECHNIQUE_LINKS[em]) {
      techniques = techniques.concat(TECHNIQUE_LINKS[em]);
    }
  });
  // Удаляем дубликаты
  techniques = [...new Set(techniques)];
  // Фильтруем по уровню: для красного приоритет STOP и ТРУД, для жёлтого – самоуспокоение, отвлечение и т.д.
  if (level >= 65) {
    // Если есть STOP или ТРУД, оставляем их, иначе берём любые из красного списка
    const crisis = techniques.filter(t => ['STOP', 'ТРУД'].includes(t));
    if (crisis.length > 0) return crisis.slice(0, 2);
    // fallback: любые техники, но покажем сообщение
    return ['STOP', 'ТРУД'];
  } else if (level >= 40) {
    // Жёлтый: навыки перенесения
    const distress = techniques.filter(t =>
      ['Самоуспокоение через 5 чувств', 'Улучшение момента', 'Отвлечение', 'Полуулыбка'].includes(t)
    );
    if (distress.length > 0) return distress.slice(0, 2);
    // Если нет подходящих, предлагаем стандартные
    return ['Самоуспокоение через 5 чувств', 'Полуулыбка'];
  } else {
    // Зелёный: когнитивные техники
    const cognitive = techniques.filter(t =>
      ['Проверка фактов', 'Противоположное действие', 'Решение проблем (ЗА и ПРОТИВ)', 'Радикальное принятие', 'Безусловное самопринятие'].includes(t)
    );
    if (cognitive.length > 0) return cognitive.slice(0, 2);
    return ['Безусловное самопринятие', 'Радикальное принятие'];
  }
}

export default function CompassScreen() {
  const colors = useThemeColors();
  const [step, setStep] = useState<'body' | 'intensity' | 'result'>('body');
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<number[]>([]);
  const [selectedUrges, setSelectedUrges] = useState<number[]>([]);
  const [intensity, setIntensity] = useState<number | null>(null);

  const toggleSymptom = (index: number) => {
    setSelectedSymptoms(prev => {
      if (index === SYMPTOMS.length - 1) {
        return prev.includes(index) ? [] : [index];
      }
      const withoutNeutral = prev.filter(i => i !== SYMPTOMS.length - 1);
      if (withoutNeutral.includes(index)) return withoutNeutral.filter(i => i !== index);
      return [...withoutNeutral, index];
    });
  };

  const toggleEmotion = (index: number) => {
    setSelectedEmotions(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index);
      return [...prev, index];
    });
  };

  const toggleUrge = (index: number) => {
    setSelectedUrges(prev => {
      if (index === URGES.length - 1) {
        return prev.includes(index) ? [] : [index];
      }
      const withoutNeutral = prev.filter(i => i !== URGES.length - 1);
      if (withoutNeutral.includes(index)) return withoutNeutral.filter(i => i !== index);
      return [...withoutNeutral, index];
    });
  };

  const handleContinueToIntensity = () => {
    setStep('intensity');
  };

  const handleIntensitySelect = (value: number) => {
    setIntensity(value);
    setStep('result');
  };

  const reset = () => {
    setStep('body');
    setSelectedSymptoms([]);
    setSelectedEmotions([]);
    setSelectedUrges([]);
    setIntensity(null);
  };

  const levelInfo = intensity !== null ? getLevel(intensity) : null;
  const chosenEmotions = selectedEmotions.map(i => EMOTIONS[i].label);
  const recommended = intensity !== null ? getRecommendedTechniques(chosenEmotions, intensity) : [];

  return (
    <Background>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="compass" size={64} color={colors.accent} />
          </View>
          <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>Компас</Text>
          <Text style={[Fonts.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md }]}>
            Оцените своё состояние, чтобы подобрать подходящую технику
          </Text>

          {step === 'body' && (
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Боди-скан</Text>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Ощущения в теле</Text>
              {SYMPTOMS.map((s, i) => {
                const selected = selectedSymptoms.includes(i);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.checkRow, selected && styles.checkRowActive]}
                    onPress={() => toggleSymptom(i)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={24}
                      color={selected ? colors.accent : colors.textSecondary}
                    />
                    <Text style={[styles.checkLabel, { color: selected ? colors.text : colors.textSecondary }]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}

              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.md }]}>Какие эмоции вы испытываете?</Text>
              {EMOTIONS.map((em, i) => {
                const selected = selectedEmotions.includes(i);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.checkRow, selected && styles.checkRowActive]}
                    onPress={() => toggleEmotion(i)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={24}
                      color={selected ? colors.accent : colors.textSecondary}
                    />
                    <Text style={[styles.checkLabel, { color: selected ? colors.text : colors.textSecondary }]}>
                      {em.icon}  {em.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.md }]}>Что хочется сделать?</Text>
              {URGES.map((u, i) => {
                const selected = selectedUrges.includes(i);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.checkRow, selected && styles.checkRowActive]}
                    onPress={() => toggleUrge(i)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={24}
                      color={selected ? colors.accent : colors.textSecondary}
                    />
                    <Text style={[styles.checkLabel, { color: selected ? colors.text : colors.textSecondary }]}>{u}</Text>
                  </TouchableOpacity>
                );
              })}

              <View style={{ marginTop: Spacing.md }}>
                <StyledButton
                  title="Продолжить →"
                  onPress={handleContinueToIntensity}
                  disabled={selectedSymptoms.length === 0 && selectedEmotions.length === 0 && selectedUrges.length === 0}
                />
                <TouchableOpacity onPress={() => setStep('intensity')} style={styles.skipBtn}>
                  <Text style={[styles.skipText, { color: colors.textSecondary }]}>Пропустить — быстрая шкала</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 'intensity' && (
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Насколько сильна эмоция?</Text>
              {chosenEmotions.length > 0 && (
                <Text style={[styles.contextHint, { color: colors.textSecondary }]}>
                  Вы отметили: {chosenEmotions.join(', ').toLowerCase()}
                  {selectedSymptoms.filter(i => i !== SYMPTOMS.length - 1).length > 0 ? ', телесное напряжение' : ''}.
                </Text>
              )}
              <Text style={[styles.hint, { color: colors.textSecondary }]}>0 — полное расслабление, 100 — максимальный уровень из вашего опыта</Text>
              <View style={styles.scaleContainer}>
                {QUICK_STEPS.map(val => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.scaleBtn, { backgroundColor: intensity === val ? colors.accent : colors.surface, borderColor: colors.border }]}
                    onPress={() => handleIntensitySelect(val)}
                  >
                    <Text style={[styles.scaleBtnText, { color: intensity === val ? colors.background : colors.text }]}>{val}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <StyledButton title="Назад" onPress={() => setStep('body')} variant="secondary" />
            </View>
          )}

          {step === 'result' && levelInfo && (
            <View style={[styles.card, { borderLeftColor: levelInfo.color, borderLeftWidth: 4 }]}>
              <View style={styles.resultHeader}>
                <MaterialCommunityIcons name={levelInfo.icon} size={48} color={levelInfo.color} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.resultTitle, { color: levelInfo.color }]}>{levelInfo.title}</Text>
                  <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>{levelInfo.subtitle}</Text>
                </View>
              </View>
              <Text style={[styles.resultDesc, { color: colors.text }]}>{levelInfo.desc}</Text>

              {recommended.length > 0 && (
                <View style={{ marginTop: 8, marginBottom: 12 }}>
                  <Text style={[styles.recTitle, { color: colors.accent }]}>Рекомендуемые техники:</Text>
                  {recommended.map((tech, i) => {
                    const details = TECHNIQUE_DETAILS[tech] || { section: 'Скоро появится', router: null };
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[styles.techBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => {
                          if (details.router) {
                            // В будущем заменим на router.push(details.router)
                            Alert.alert(
                              tech,
                              `Техника находится в разделе «${details.section}». Перейдите туда, чтобы выполнить упражнение.`
                            );
                          } else {
                            Alert.alert(tech, 'Эта техника появится в ближайшем обновлении.');
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.techBtnText, { color: colors.text }]}>{tech}</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <StyledButton title="Пройти заново" onPress={reset} variant="secondary" />
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
  card: {
    backgroundColor: 'rgba(19,30,43,0.8)',
    borderRadius: 16,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#1E2D3A',
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 13, textAlign: 'center', marginBottom: 12, fontStyle: 'italic' },
  contextHint: { fontSize: 13, textAlign: 'center', marginBottom: 8, fontStyle: 'italic', lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 8,
    borderRadius: 8,
  },
  checkRowActive: {
    backgroundColor: 'rgba(201,168,76,0.15)',
  },
  checkLabel: { fontSize: 14, flex: 1 },
  scaleContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 12 },
  scaleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleBtnText: { fontSize: 14, fontWeight: '600' },
  skipBtn: { alignItems: 'center', marginTop: 12 },
  skipText: { fontSize: 14 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  resultTitle: { fontSize: 22, fontWeight: '700' },
  resultSubtitle: { fontSize: 14, marginTop: 2 },
  resultDesc: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  recTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  techBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  techBtnText: { fontSize: 14, fontWeight: '500' },
});
