import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Background from '../components/Background';
import StyledButton from '../components/StyledButton';
import StyledInput from '../components/StyledInput';
import { useThemeColors, Fonts, Spacing } from '../theme';

const QUICK_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const SYMPTOMS = [
  'Тяжесть', 'Жар', 'Дрожь', 'Сжатие, напряжение', 'Пустота', 'Учащённое сердцебиение', 'Потливость', 'Ком в горле', 'Ничего особенного, я спокоен',
];

const EMOTIONS = [
  { label: 'Страх (тревога, паника, ужас)', icon: '😨' },
  { label: 'Гнев (раздражение, злость, ярость)', icon: '😠' },
  { label: 'Грусть (печаль, тоска, скорбь)', icon: '😢' },
  { label: 'Стыд (смущение, унижение)', icon: '😳' },
  { label: 'Вина (сожаление, раскаяние)', icon: '😞' },
  { label: 'Отвращение (неприязнь, омерзение)', icon: '🤢' },
  { label: 'Радость (удовольствие, счастье, восторг)', icon: '😊' },
  { label: 'Любовь (нежность, привязанность)', icon: '❤️' },
];

const URGES = [
  'Сжаться, спрятаться, исчезнуть', 'Убежать', 'Ударить, спорить, крушить', 'Замереть', 'Плакать', 'Ничего не хочется, я в порядке',
];

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

const TECHNIQUE_ID_MAP: Record<string, string> = {
  'Проверка фактов': 'factcheck',
  'Противоположное действие': 'opposite',
  'Радикальное принятие': 'radical',
  'Безусловное самопринятие': 'usa',
  'Серфинг эмоций': 'surf',
  'Осадда деструктивных образов (DISARM)': 'disarm',
  'Анализ выгод и издержек': 'cba',
  'Самоуспокоение через 5 чувств': 'senses',
  'Улучшение момента': 'improve',
  'Отвлечение': 'distract',
  'Полуулыбка': 'halfsmile',
  'STOP': 'stop',
  'ТРУД': 'trud',
};

function getLevel(value: number) {
  if (value <= 40) return { level: 'green', title: 'Решать', subtitle: '0–40% · Я могу мыслить', icon: 'lightbulb-on-outline' as const, desc: 'Ваш уровень дистресса невысок. Подойдут навыки когнитивной работы.', color: '#4F9F6E' };
  if (value <= 65) return { level: 'yellow', title: 'Пережить', subtitle: '40–65% · Мне нужно пережить', icon: 'shield-half-full' as const, desc: 'Эмоция мешает ясно мыслить. Лучше использовать навыки перенесения дистресса.', color: '#C9A84C' };
  return { level: 'red', title: 'Сбросить', subtitle: '65–100% · Стоп, сброс напряжения', icon: 'alert-octagon' as const, desc: 'Эмоция захлёстывает. Необходимо быстро снизить накал.', color: '#C44F4F' };
}

function getRecommendedTechniques(emotions: string[], level: number): string[] {
  let techniques: string[] = [];
  emotions.forEach(em => {
    if (TECHNIQUE_LINKS[em]) techniques = techniques.concat(TECHNIQUE_LINKS[em]);
  });
  techniques = [...new Set(techniques)];
  if (level >= 65) {
    const crisis = techniques.filter(t => ['STOP', 'ТРУД'].includes(t));
    return crisis.length > 0 ? crisis.slice(0, 2) : ['STOP', 'ТРУД'];
  } else if (level >= 40) {
    const distress = techniques.filter(t => ['Самоуспокоение через 5 чувств', 'Улучшение момента', 'Отвлечение', 'Полуулыбка'].includes(t));
    return distress.length > 0 ? distress.slice(0, 2) : ['Самоуспокоение через 5 чувств', 'Полуулыбка'];
  } else {
    const cognitive = techniques.filter(t => ['Проверка фактов', 'Противоположное действие', 'Решение проблем (ЗА и ПРОТИВ)', 'Радикальное принятие', 'Безусловное самопринятие'].includes(t));
    return cognitive.length > 0 ? cognitive.slice(0, 2) : ['Безусловное самопринятие', 'Радикальное принятие'];
  }
}

export default function CompassScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [step, setStep] = useState<'welcome' | 'quick' | 'body' | 'intensity' | 'result'>('welcome');
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<number[]>([]);
  const [selectedUrges, setSelectedUrges] = useState<number[]>([]);
  const [intensity, setIntensity] = useState<number | null>(null);

  const toggleSymptom = (index: number) => {
    setSelectedSymptoms(prev => {
      if (index === SYMPTOMS.length - 1) return prev.includes(index) ? [] : [index];
      const withoutNeutral = prev.filter(i => i !== SYMPTOMS.length - 1);
      if (withoutNeutral.includes(index)) return withoutNeutral.filter(i => i !== index);
      return [...withoutNeutral, index];
    });
  };
  const toggleEmotion = (index: number) => {
    setSelectedEmotions(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };
  const toggleUrge = (index: number) => {
    setSelectedUrges(prev => {
      if (index === URGES.length - 1) return prev.includes(index) ? [] : [index];
      const withoutNeutral = prev.filter(i => i !== URGES.length - 1);
      if (withoutNeutral.includes(index)) return withoutNeutral.filter(i => i !== index);
      return [...withoutNeutral, index];
    });
  };

  const canContinue = selectedSymptoms.length > 0 || selectedEmotions.length > 0 || selectedUrges.length > 0;
  const chosenEmotions = selectedEmotions.map(i => EMOTIONS[i].label);
  const levelInfo = intensity !== null ? getLevel(intensity) : null;
  const recommended = intensity !== null ? getRecommendedTechniques(chosenEmotions, intensity) : [];

  const reset = () => {
    setStep('welcome');
    setSelectedSymptoms([]);
    setSelectedEmotions([]);
    setSelectedUrges([]);
    setIntensity(null);
  };

  if (step === 'welcome') {
    return (
      <Background>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="compass" size={80} color={colors.accent} />
            </View>
            <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>Компас</Text>
            <Text style={[Fonts.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md }]}>
              Твой навигатор в мире эмоций
            </Text>
            <View style={styles.card}>
              <Text style={styles.welcomeTitle}>Что здесь происходит?</Text>
              <Text style={styles.welcomeText}>
                «Компас» — это безопасный инструмент, который поможет тебе понять, что ты чувствуешь прямо сейчас, и подобрать подходящую технику самопомощи.{'\n\n'}
                Мы не ставим диагнозов и не даём оценок. Всё основано на навыках диалектической поведенческой терапии (DBT), которые учат справляться с сильными эмоциями.
              </Text>
              <Text style={styles.welcomeTitle}>Как пользоваться?</Text>
              <Text style={styles.welcomeText}>
                1. Оцени своё состояние: выбери телесные ощущения, эмоции и желания.{'\n'}
                2. Отметь уровень интенсивности по шкале от 0 (полное расслабление) до 100% (максимальный накал).{'\n'}
                3. Получи рекомендацию с конкретными техниками, которые помогут именно сейчас.
              </Text>
              <Text style={styles.welcomeTitle}>Что означают уровни?</Text>
              <View style={styles.levelExample}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#4F9F6E" />
                <Text style={[styles.levelText, { color: '#4F9F6E' }]}>🟢 0–40% – Решать</Text>
              </View>
              <Text style={styles.levelDesc}>Эмоция не мешает мыслить, можно спокойно разбираться.</Text>
              <View style={styles.levelExample}>
                <MaterialCommunityIcons name="shield-half-full" size={24} color="#C9A84C" />
                <Text style={[styles.levelText, { color: '#C9A84C' }]}>🟡 40–65% – Пережить</Text>
              </View>
              <Text style={styles.levelDesc}>Эмоция уже мешает ясно мыслить, лучше отвлечься и успокоиться.</Text>
              <View style={styles.levelExample}>
                <MaterialCommunityIcons name="alert-octagon" size={24} color="#C44F4F" />
                <Text style={[styles.levelText, { color: '#C44F4F' }]}>🔴 65–100% – Сбросить</Text>
              </View>
              <Text style={styles.levelDesc}>Эмоция захлёстывает, нужно быстро снизить накал через тело.</Text>
            </View>
            <StyledButton title="Оценить состояние" onPress={() => setStep('body')} />
            <TouchableOpacity onPress={() => setStep('body')} style={styles.skipBtn}>
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>Пропустить объяснение</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Background>
    );
  }

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


          {step === 'quick' && (
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>📊 Насколько сильна эмоция сейчас?</Text>
              <Text style={styles.hint}>0 — полное расслабление, 100 — максимальный уровень из вашего опыта</Text>
              <View style={styles.scaleContainer}>
                {QUICK_STEPS.map(val => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.scaleBtn, { backgroundColor: intensity === val ? colors.accent : colors.surface, borderColor: colors.border }]}
                    onPress={() => { setIntensity(val); setStep('result'); }}
                  >
                    <Text style={[styles.scaleBtnText, { color: intensity === val ? colors.background : colors.text }]}>{val}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <StyledButton title="← Назад" onPress={() => setStep('body')} variant="secondary" />
            </View>
          )}

          {step === 'body' && (
            <View style={styles.card}>
              <Text style={styles.invite}>Пройдите вниманием по телу. Что вы замечаете прямо сейчас?</Text>
              {SYMPTOMS.map((s, i) => {
                const selected = selectedSymptoms.includes(i);
                return (
                  <TouchableOpacity key={i} style={[styles.checkRow, selected && styles.checkRowActive]} onPress={() => toggleSymptom(i)} activeOpacity={0.7}>
                    <MaterialCommunityIcons name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={selected ? colors.accent : colors.textSecondary} />
                    <Text style={[styles.checkLabel, { color: selected ? colors.text : colors.textSecondary }]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.blockDivider} />
              <Text style={styles.invite}>🎭 Какие эмоции присутствуют? Можно выбрать несколько.</Text>
              {EMOTIONS.map((em, i) => {
                const selected = selectedEmotions.includes(i);
                return (
                  <TouchableOpacity key={i} style={[styles.checkRow, selected && styles.checkRowActive]} onPress={() => toggleEmotion(i)} activeOpacity={0.7}>
                    <MaterialCommunityIcons name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={selected ? colors.accent : colors.textSecondary} />
                    <Text style={[styles.checkLabel, { color: selected ? colors.text : colors.textSecondary }]}>{em.icon}  {em.label}</Text>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.blockDivider} />
              <Text style={styles.invite}>💪 Что вам хочется сделать под влиянием этих чувств?</Text>
              {URGES.map((u, i) => {
                const selected = selectedUrges.includes(i);
                return (
                  <TouchableOpacity key={i} style={[styles.checkRow, selected && styles.checkRowActive]} onPress={() => toggleUrge(i)} activeOpacity={0.7}>
                    <MaterialCommunityIcons name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={selected ? colors.accent : colors.textSecondary} />
                    <Text style={[styles.checkLabel, { color: selected ? colors.text : colors.textSecondary }]}>{u}</Text>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.buttonGroup}>
                <StyledButton title="Продолжить →" onPress={() => setStep('intensity')} disabled={!canContinue} />
                <TouchableOpacity onPress={() => setStep('intensity')} style={styles.skipBtn}>
                  <Text style={[styles.skipText, { color: colors.textSecondary }]}>Пропустить — быстрая шкала</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 'intensity' && (
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>📊 Насколько сильна эмоция сейчас?</Text>
              {chosenEmotions.length > 0 && (
                <Text style={[styles.contextHint, { color: colors.textSecondary }]}>
                  Вы отметили: {chosenEmotions.join(', ').toLowerCase()}
                  {selectedSymptoms.filter(i => i !== SYMPTOMS.length - 1).length > 0 ? ', телесное напряжение' : ''}.
                </Text>
              )}
              <Text style={styles.hint}>0 — полное расслабление, 100 — максимальный уровень из вашего опыта</Text>
              <View style={styles.scaleContainer}>
                {QUICK_STEPS.map(val => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.scaleBtn, { backgroundColor: intensity === val ? colors.accent : colors.surface, borderColor: colors.border }]}
                    onPress={() => { setIntensity(val); setStep('result'); }}
                  >
                    <Text style={[styles.scaleBtnText, { color: intensity === val ? colors.background : colors.text }]}>{val}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <StyledButton title="← Назад к боди-скану" onPress={() => setStep('body')} variant="secondary" />
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
                <View style={{ marginVertical: 12 }}>
                  <Text style={[styles.recTitle, { color: colors.accent }]}>🔧 Рекомендуемые техники:</Text>
                  {recommended.map((tech, i) => {
                    const techId = TECHNIQUE_ID_MAP[tech] || '';
                    return (
                      <TouchableOpacity
                        key={i}
                        style={styles.techBtn}
                        onPress={() => router.push({ pathname: '/techniques', params: { open: techId } })}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.techBtnText, { color: colors.text }]}>{tech}</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <StyledButton title="🔧 Перейти к техникам" onPress={() => router.push('/techniques')} />
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
  cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8, textAlign: 'center', color: '#D0D9E2' },
  invite: { fontSize: 15, color: '#C9A84C', marginBottom: 12, lineHeight: 22, textAlign: 'center', fontWeight: '500' },
  hint: { fontSize: 13, textAlign: 'center', marginBottom: 12, fontStyle: 'italic', color: '#7B8FA1' },
  contextHint: { fontSize: 13, textAlign: 'center', marginBottom: 8, fontStyle: 'italic', lineHeight: 18, color: '#7B8FA1' },
  blockDivider: { height: 1, backgroundColor: '#1E2D3A', marginVertical: Spacing.md },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, gap: 10, borderRadius: 10, marginBottom: 4,
  },
  checkRowActive: { backgroundColor: 'rgba(201,168,76,0.15)' },
  checkLabel: { fontSize: 15, flex: 1 },
  buttonGroup: { marginTop: Spacing.md },
  skipBtn: { alignItems: 'center', marginTop: 10 },
  skipText: { fontSize: 14 },
  scaleContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 12 },
  scaleBtn: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  scaleBtnText: { fontSize: 14, fontWeight: '600' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  resultTitle: { fontSize: 22, fontWeight: '700' },
  resultSubtitle: { fontSize: 14, marginTop: 2, color: '#7B8FA1' },
  resultDesc: { fontSize: 15, lineHeight: 22, marginBottom: 12, color: '#D0D9E2' },
  recTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8, color: '#C9A84C' },
  techItem: { paddingVertical: 6, paddingLeft: 8 },
  techName: { fontSize: 14, fontWeight: '500' },
  techBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: '#131E2B', borderRadius: 8, borderWidth: 1, borderColor: '#1E2D3A', marginBottom: 6,
  },
  techBtnText: { fontSize: 14, fontWeight: '500' },
  welcomeTitle: { fontSize: 20, fontWeight: '700', color: '#C9A84C', marginBottom: 8, marginTop: 16 },
  welcomeText: { fontSize: 15, lineHeight: 22, color: '#D0D9E2', marginBottom: 12 },
  levelExample: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  levelText: { fontSize: 16, fontWeight: '600' },
  levelDesc: { fontSize: 14, color: '#7B8FA1', marginLeft: 32, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-around', gap: 12 },
  methodBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  methodTitle: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  methodDesc: { fontSize: 12 },
});
