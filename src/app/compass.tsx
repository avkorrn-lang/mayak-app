import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Background from '../components/Background';
import StyledButton from '../components/StyledButton';
import { useThemeColors, Fonts, Spacing } from '../theme';

type Mode = 'choose' | 'quick' | 'body' | 'result';

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

const URGES = [
  'Сжаться, спрятаться, исчезнуть',
  'Убежать',
  'Ударить, спорить, крушить',
  'Замереть',
  'Плакать',
  'Ничего не хочется, я в порядке',
];

function getLevel(value: number) {
  if (value <= 40) return { level: 'green', title: 'Решать', subtitle: '0–40% · Я могу мыслить', icon: 'lightbulb-on-outline' as const, desc: 'Ваш уровень дистресса невысок. Подойдут навыки когнитивной работы:\n• Проверка фактов\n• Противоположное действие\n• Решение проблем (ЗА и ПРОТИВ)\n• Радикальное принятие', color: '#4F9F6E' };
  if (value <= 65) return { level: 'yellow', title: 'Пережить', subtitle: '40–65% · Мне нужно пережить', icon: 'shield-half-full' as const, desc: 'Эмоция мешает ясно мыслить. Лучше использовать навыки перенесения дистресса:\n• Самоуспокоение через 5 чувств\n• Улучшение момента\n• Отвлечение\n• Полуулыбка и открытые ладони', color: '#C9A84C' };
  return { level: 'red', title: 'Сбросить', subtitle: '65–100% · Стоп, сброс напряжения', icon: 'alert-octagon' as const, desc: 'Эмоция захлёстывает. Необходимо быстро снизить накал:\n• STOP (Стоп, шаг назад, наблюдать)\n• ТРУД (температура, расслабление, упражнения, дыхание)', color: '#C44F4F' };
}

function getLevelFromScores(symptomCount: number, urgeCount: number): number {
  const total = symptomCount + urgeCount;
  if (total <= 1) return Math.round(total * 20); // 0–20%
  if (total <= 3) return 30 + (total - 2) * 15; // 30–50%
  if (total <= 6) return 55 + (total - 4) * 5;  // 55–75%
  return 80 + Math.min((total - 7) * 5, 20);     // 80–100%
}

export default function CompassScreen() {
  const colors = useThemeColors();
  const [mode, setMode] = useState<Mode>('choose');
  const [quickValue, setQuickValue] = useState<number | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
  const [selectedUrges, setSelectedUrges] = useState<number[]>([]);
  const [resultValue, setResultValue] = useState<number | null>(null);

  const toggleSymptom = (index: number) => {
    setSelectedSymptoms(prev => {
      if (index === SYMPTOMS.length - 1) {
        // Нажат "ничего особенного" – снимаем остальные
        return prev.includes(index) ? [] : [index];
      }
      // Иначе снимаем "ничего особенного" и переключаем выбранный
      const withoutNeutral = prev.filter(i => i !== SYMPTOMS.length - 1);
      if (withoutNeutral.includes(index)) {
        return withoutNeutral.filter(i => i !== index);
      }
      return [...withoutNeutral, index];
    });
  };

  const toggleUrge = (index: number) => {
    setSelectedUrges(prev => {
      if (index === URGES.length - 1) {
        return prev.includes(index) ? [] : [index];
      }
      const withoutNeutral = prev.filter(i => i !== URGES.length - 1);
      if (withoutNeutral.includes(index)) {
        return withoutNeutral.filter(i => i !== index);
      }
      return [...withoutNeutral, index];
    });
  };

  const handleBodyEvaluate = () => {
    const symptomCount = selectedSymptoms.filter(i => i !== SYMPTOMS.length - 1).length;
    const urgeCount = selectedUrges.filter(i => i !== URGES.length - 1).length;
    // Если выбраны только нейтральные варианты (ничего особенного + ничего не хочется), даём 0%
    if (symptomCount === 0 && urgeCount === 0) {
      setResultValue(0);
    } else {
      const percent = getLevelFromScores(symptomCount, urgeCount);
      setResultValue(Math.min(100, Math.max(0, percent)));
    }
    setMode('result');
  };

  const isBodyValid = () => {
    const symptomCount = selectedSymptoms.filter(i => i !== SYMPTOMS.length - 1).length;
    const urgeCount = selectedUrges.filter(i => i !== URGES.length - 1).length;
    // Можно оценить, если выбрано хотя бы что-то (даже нейтральное)
    return selectedSymptoms.length > 0 || selectedUrges.length > 0;
  };

  const handleQuickSelect = (value: number) => {
    setQuickValue(value);
    setResultValue(value);
    setMode('result');
  };

  const reset = () => {
    setMode('choose');
    setQuickValue(null);
    setSelectedSymptoms([]);
    setSelectedUrges([]);
    setResultValue(null);
  };

  const result = resultValue !== null ? getLevel(resultValue) : null;

  return (
    <Background>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="compass" size={64} color={colors.accent} />
          </View>
          <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>Компас</Text>
          <Text style={[Fonts.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md }]}>
            Оцените своё состояние, чтобы подобрать подходящий навык
          </Text>

          {mode === 'choose' && (
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Как будем оценивать?</Text>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.methodBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setMode('quick')} activeOpacity={0.7}>
                  <MaterialCommunityIcons name="speedometer" size={32} color={colors.accent} />
                  <Text style={[styles.methodTitle, { color: colors.text }]}>Быстрая шкала</Text>
                  <Text style={[styles.methodDesc, { color: colors.textSecondary }]}>0–100% за пару секунд</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.methodBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setMode('body')} activeOpacity={0.7}>
                  <MaterialCommunityIcons name="human" size={32} color={colors.accent} />
                  <Text style={[styles.methodTitle, { color: colors.text }]}>Боди-скан</Text>
                  <Text style={[styles.methodDesc, { color: colors.textSecondary }]}>Через ощущения в теле</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {mode === 'quick' && (
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Насколько сильна эмоция?</Text>
              <Text style={[styles.hint, { color: colors.textSecondary }]}>0 — полное расслабление, 100 — максимальный уровень из вашего опыта</Text>
              <View style={styles.scaleContainer}>
                {QUICK_STEPS.map(val => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.scaleBtn, { backgroundColor: quickValue === val ? colors.accent : colors.surface, borderColor: colors.border }]}
                    onPress={() => handleQuickSelect(val)}
                  >
                    <Text style={[styles.scaleBtnText, { color: quickValue === val ? colors.background : colors.text }]}>{val}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <StyledButton title="Назад к выбору" onPress={() => setMode('choose')} variant="secondary" />
            </View>
          )}

          {mode === 'body' && (
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
                  title="Оценить"
                  onPress={handleBodyEvaluate}
                  disabled={!isBodyValid()}
                />
                <StyledButton title="Назад" onPress={() => setMode('choose')} variant="secondary" />
              </View>
            </View>
          )}

          {mode === 'result' && result && (
            <View style={[styles.card, { borderLeftColor: result.color, borderLeftWidth: 4 }]}>
              <View style={styles.resultHeader}>
                <MaterialCommunityIcons name={result.icon} size={48} color={result.color} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.resultTitle, { color: result.color }]}>{result.title}</Text>
                  <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>{result.subtitle}</Text>
                </View>
              </View>
              <Text style={[styles.resultDesc, { color: colors.text }]}>{result.desc}</Text>
              <Text style={[styles.resultHint, { color: colors.textSecondary }]}>Выберите подходящую технику в разделе «Техники» или вернитесь к сканеру позже.</Text>
              <StyledButton title="Пройти заново" onPress={reset} variant="secondary" />
              <StyledButton title="Быстрая шкала" onPress={() => { setMode('quick'); setQuickValue(null); setResultValue(null); }} variant="secondary" />
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
  row: { flexDirection: 'row', justifyContent: 'space-around', gap: 12 },
  methodBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  methodTitle: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  methodDesc: { fontSize: 12 },
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
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  resultTitle: { fontSize: 22, fontWeight: '700' },
  resultSubtitle: { fontSize: 14, marginTop: 2 },
  resultDesc: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  resultHint: { fontSize: 13, marginBottom: 12, fontStyle: 'italic' },
});
