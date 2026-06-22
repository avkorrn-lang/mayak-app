import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Background from '../components/Background';
import StyledButton from '../components/StyledButton';
import { useThemeColors, Fonts, Spacing } from '../theme';

const QUICK_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const SYMPTOMS = [ 'Тяжесть', 'Жар', 'Дрожь', 'Сжатие, напряжение', 'Пустота', 'Учащённое сердцебиение', 'Потливость', 'Ком в горле', 'Ничего особенного, я спокоен' ];
const EMOTIONS = [
  { label: 'Страх (тревога, паника, ужас)', icon: '😨' }, { label: 'Гнев (раздражение, злость, ярость)', icon: '😠' },
  { label: 'Грусть (печаль, тоска, скорбь)', icon: '😢' }, { label: 'Стыд (смущение, унижение)', icon: '😳' },
  { label: 'Вина (сожаление, раскаяние)', icon: '😞' }, { label: 'Отвращение (неприязнь, омерзение)', icon: '🤢' },
  { label: 'Радость (удовольствие, счастье, восторг)', icon: '😊' }, { label: 'Любовь (нежность, привязанность)', icon: '❤️' },
];
const URGES = [ 'Сжаться, спрятаться, исчезнуть', 'Убежать', 'Ударить, спорить, крушить', 'Замереть', 'Плакать', 'Ничего не хочется, я в порядке' ];

const SYMPTOM_LINKS: Record<string, string[]> = {
  'Тяжесть': ['Радикальное принятие','Самоуспокоение через 5 чувств','Серфинг эмоций'],
  'Жар': ['ТРУД','STOP'], 'Дрожь': ['STOP','ТРУД','Серфинг эмоций'],
  'Сжатие, напряжение': ['Полуулыбка','STOP','Серфинг эмоций'],
  'Пустота': ['Улучшение момента','Накопление положительных эмоций'],
  'Учащённое сердцебиение': ['ТРУД','Проверка фактов','Серфинг эмоций'],
  'Потливость': ['ТРУД','STOP'], 'Ком в горле': ['Проверка фактов','Радикальное принятие'],
};
const URGE_LINKS: Record<string, string[]> = {
  'Сжаться, спрятаться, исчезнуть': ['Безусловное самопринятие','Противоположное действие','Серфинг эмоций'],
  'Убежать': ['STOP','Проверка фактов','Серфинг эмоций'],
  'Ударить, спорить, крушить': ['STOP','Противоположное действие'],
  'Замереть': ['ТРУД','Противоположное действие','Серфинг эмоций'],
  'Плакать': ['Безусловное самопринятие','Самоуспокоение через 5 чувств'],
};
const EMOTION_LINKS: Record<string, string[]> = {
  'Страх': ['Проверка фактов','Радикальное принятие','Серфинг эмоций'],
  'Гнев': ['STOP','Противоположное действие','Серфинг эмоций'],
  'Грусть': ['Безусловное самопринятие','Накопление положительных эмоций','Серфинг эмоций'],
  'Стыд': ['Безусловное самопринятие','Полуулыбка','Серфинг эмоций'],
  'Вина': ['Проверка фактов','Безусловное самопринятие'],
  'Отвращение': ['Радикальное принятие','Противоположное действие','Серфинг эмоций'],
  'Радость': [], 'Любовь': [],
};
const TECHNIQUE_ID_MAP: Record<string, string> = {
  'Проверка фактов':'factcheck','Противоположное действие':'opposite','Радикальное принятие':'radical',
  'Безусловное самопринятие':'usa','Серфинг эмоций':'surf','Осадда деструктивных образов (DISARM)':'disarm',
  'Анализ выгод и издержек':'cba','Самоуспокоение через 5 чувств':'senses','Улучшение момента':'improve',
  'Отвлечение':'distract','Полуулыбка':'halfsmile','STOP':'stop','ТРУД':'trud','Накопление положительных эмоций':'positive',
};

function getLevel(value: number) {
  if (value <= 40) return { level: 'green', title: 'Решать', subtitle: '0–40% · Я могу мыслить', icon: 'lightbulb-on-outline' as const, desc: 'Ваш уровень дистресса невысок. Подойдут навыки когнитивной работы.', color: '#4F9F6E' };
  if (value <= 65) return { level: 'yellow', title: 'Пережить', subtitle: '40–65% · Мне нужно пережить', icon: 'shield-half-full' as const, desc: 'Эмоция мешает ясно мыслить. Лучше использовать навыки перенесения дистресса.', color: '#C9A84C' };
  return { level: 'red', title: 'Сбросить', subtitle: '65–100% · Стоп, сброс напряжения', icon: 'alert-octagon' as const, desc: 'Эмоция захлёстывает. Необходимо быстро снизить накал.', color: '#C44F4F' };
}
function getLevelFromScores(symptomCount: number, urgeCount: number): number {
  const total = symptomCount + urgeCount;
  if (total <= 1) return Math.round(total * 20);
  if (total <= 3) return 30 + (total - 2) * 15;
  if (total <= 6) return 55 + (total - 4) * 5;
  return 80 + Math.min((total - 7) * 5, 20);
}
function isPurePositive(emotions: string[]): boolean {
  return emotions.length > 0 && emotions.every(e => e.startsWith('Радость') || e.startsWith('Любовь'));
}
function getRecommendedTechniques(
  bodyMode: boolean,
  symptoms: string[],
  emotions: string[],
  urges: string[],
  level: number
): string[] {
  let all: string[] = [];
  if (bodyMode) {
    symptoms.forEach(s => { if (SYMPTOM_LINKS[s]) all.push(...SYMPTOM_LINKS[s]); });
    urges.forEach(u => { if (URGE_LINKS[u]) all.push(...URGE_LINKS[u]); });
    return [...new Set(all)];
  } else {
    emotions.forEach(e => { if (EMOTION_LINKS[e]) all.push(...EMOTION_LINKS[e]); });
    all = [...new Set(all)];
    if (level >= 65) {
      const crisis = all.filter(t => ['STOP','ТРУД'].includes(t));
      return crisis.length > 0 ? crisis : ['STOP','ТРУД'];
    } else if (level >= 40) {
      const distress = all.filter(t =>
        ['Самоуспокоение через 5 чувств','Улучшение момента','Отвлечение','Полуулыбка','Безусловное самопринятие','Серфинг эмоций'].includes(t)
      );
      let result = distress.length > 0 ? distress : ['Самоуспокоение через 5 чувств','Полуулыбка'];
      if (result.length < 3) {
        if (!result.includes('Серфинг эмоций')) result.push('Серфинг эмоций');
        if (result.length < 3 && !result.includes('Самоуспокоение через 5 чувств')) result.push('Самоуспокоение через 5 чувств');
      }
      return result.slice(0, 4);
    } else {
      const cognitive = all.filter(t =>
        ['Проверка фактов','Противоположное действие','Анализ выгод и издержек','Радикальное принятие','Безусловное самопринятие','Серфинг эмоций','Осадда деструктивных образов (DISARM)'].includes(t)
      );
      let result = cognitive.length > 0 ? cognitive : ['Безусловное самопринятие','Радикальное принятие'];
      if (result.length < 3) {
        if (!result.includes('Серфинг эмоций')) result.push('Серфинг эмоций');
        if (result.length < 3 && !result.includes('Безусловное самопринятие')) result.push('Безусловное самопринятие');
      }
      return result.slice(0, 4);
    }
  }
}

export default function CompassScreen() {
  const colors = useThemeColors(); const router = useRouter();
  const [step, setStep] = useState<'welcome'|'body'|'emotions'|'intensity'|'result'>('welcome');
  const [bodyMode, setBodyMode] = useState<boolean | null>(null);
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
  const toggleEmotion = (index: number) => { setSelectedEmotions(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]); };
  const toggleUrge = (index: number) => {
    setSelectedUrges(prev => {
      if (index === URGES.length - 1) return prev.includes(index) ? [] : [index];
      const withoutNeutral = prev.filter(i => i !== URGES.length - 1);
      if (withoutNeutral.includes(index)) return withoutNeutral.filter(i => i !== index);
      return [...withoutNeutral, index];
    });
  };

  const canBodyContinue = selectedSymptoms.length > 0 || selectedUrges.length > 0;
  const canEmotionContinue = selectedEmotions.length > 0;
  const chosenEmotions = selectedEmotions.map(i => EMOTIONS[i].label);
  const chosenSymptoms = selectedSymptoms.filter(i => i !== SYMPTOMS.length - 1).map(i => SYMPTOMS[i]);
  const chosenUrges = selectedUrges.filter(i => i !== URGES.length - 1).map(i => URGES[i]);
  const levelInfo = !bodyMode && intensity !== null ? getLevel(intensity) : null;
  const positiveOnly = !bodyMode && isPurePositive(chosenEmotions);
  const recommended = (intensity !== null && bodyMode !== null && !positiveOnly)
    ? getRecommendedTechniques(bodyMode, chosenSymptoms, chosenEmotions, chosenUrges, intensity)
    : [];
  const reset = () => { setStep('welcome'); setBodyMode(null); setSelectedSymptoms([]); setSelectedEmotions([]); setSelectedUrges([]); setIntensity(null); };
  const handleBodyContinue = () => {
    const symptomCount = selectedSymptoms.filter(i => i !== SYMPTOMS.length - 1).length;
    const urgeCount = selectedUrges.filter(i => i !== URGES.length - 1).length;
    setIntensity(getLevelFromScores(symptomCount, urgeCount));
    setStep('result');
  };

  if (step === 'welcome') return (
    <Background><SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.iconContainer}><MaterialCommunityIcons name="lighthouse" size={80} color={colors.accent} /></View>
      <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>Маяк</Text>
      <Text style={[Fonts.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md }]}>Твой навигатор по техникам самопомощи</Text>
      <View style={styles.card}>
        <Text style={styles.welcomeTitle}>Что здесь происходит?</Text><Text style={styles.welcomeText}>«Маяк» — это безопасный инструмент, который поможет тебе понять, что ты чувствуешь прямо сейчас, и подобрать подходящую технику самопомощи.</Text>
        <Text style={styles.welcomeTitle}>Два пути:</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.methodBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => { setBodyMode(true); setStep('body'); }} activeOpacity={0.7}>
            <MaterialCommunityIcons name="human" size={32} color={colors.accent} /><Text style={[styles.methodTitle, { color: colors.text }]}>Боди-скан</Text><Text style={[styles.methodDesc, { color: colors.textSecondary }]}>Оценить ощущения в теле и позывы → получить техники</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.methodBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => { setBodyMode(false); setStep('emotions'); }} activeOpacity={0.7}>
            <MaterialCommunityIcons name="speedometer" size={32} color={colors.accent} /><Text style={[styles.methodTitle, { color: colors.text }]}>Шкала</Text><Text style={[styles.methodDesc, { color: colors.textSecondary }]}>Отметить эмоции и выбрать интенсивность → получить техники</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>После оценки вы получите список рекомендуемых техник, которые можно сразу открыть.</Text>
      </View>
    </ScrollView></SafeAreaView></Background>
  );

  return (
    <Background><SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.iconContainer}><MaterialCommunityIcons name="lighthouse" size={64} color={colors.accent} /></View>
      <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>Маяк</Text>
      <Text style={[Fonts.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md }]}>Оцените своё состояние, чтобы подобрать подходящую технику</Text>

      {step === 'body' && (<View style={styles.card}>
        <Text style={styles.invite}>Пройдите вниманием по телу. Что вы замечаете прямо сейчас?</Text>
        {SYMPTOMS.map((s, i) => { const selected = selectedSymptoms.includes(i); return (<TouchableOpacity key={i} style={[styles.checkRow, selected && styles.checkRowActive]} onPress={() => toggleSymptom(i)} activeOpacity={0.7}><MaterialCommunityIcons name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={selected ? colors.accent : colors.textSecondary} /><Text style={[styles.checkLabel, { color: selected ? colors.text : colors.textSecondary }]}>{s}</Text></TouchableOpacity>); })}
        <View style={styles.blockDivider} /><Text style={styles.invite}>💪 Что вам хочется сделать под влиянием этих чувств?</Text>
        {URGES.map((u, i) => { const selected = selectedUrges.includes(i); return (<TouchableOpacity key={i} style={[styles.checkRow, selected && styles.checkRowActive]} onPress={() => toggleUrge(i)} activeOpacity={0.7}><MaterialCommunityIcons name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={selected ? colors.accent : colors.textSecondary} /><Text style={[styles.checkLabel, { color: selected ? colors.text : colors.textSecondary }]}>{u}</Text></TouchableOpacity>); })}
        <View style={styles.buttonGroup}><StyledButton title="Получить техники" onPress={handleBodyContinue} disabled={!canBodyContinue} /><TouchableOpacity onPress={() => reset()} style={styles.skipBtn}><Text style={[styles.skipText, { color: colors.textSecondary }]}>Вернуться к выбору</Text></TouchableOpacity></View>
      </View>)}

      {step === 'emotions' && (<View style={styles.card}>
        <Text style={styles.invite}>🎭 Какие эмоции присутствуют? Можно выбрать несколько.</Text>
        {EMOTIONS.map((em, i) => { const selected = selectedEmotions.includes(i); return (<TouchableOpacity key={i} style={[styles.checkRow, selected && styles.checkRowActive]} onPress={() => toggleEmotion(i)} activeOpacity={0.7}><MaterialCommunityIcons name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={selected ? colors.accent : colors.textSecondary} /><Text style={[styles.checkLabel, { color: selected ? colors.text : colors.textSecondary }]}>{em.icon}  {em.label}</Text></TouchableOpacity>); })}
        <View style={styles.buttonGroup}><StyledButton title="Продолжить →" onPress={() => setStep('intensity')} disabled={!canEmotionContinue} /><TouchableOpacity onPress={() => reset()} style={styles.skipBtn}><Text style={[styles.skipText, { color: colors.textSecondary }]}>Вернуться к выбору</Text></TouchableOpacity></View>
      </View>)}

      {step === 'intensity' && (<View style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>📊 Насколько сильна эмоция сейчас?</Text>
        {chosenEmotions.length > 0 && <Text style={[styles.contextHint, { color: colors.textSecondary }]}>Вы отметили: {chosenEmotions.join(', ').toLowerCase()}.</Text>}
        <Text style={styles.hint}>0 — полное расслабление, 100 — максимальный уровень из вашего опыта</Text>
        <View style={styles.scaleContainer}>{QUICK_STEPS.map(val => (<TouchableOpacity key={val} style={[styles.scaleBtn, { backgroundColor: intensity === val ? colors.accent : colors.surface, borderColor: colors.border }]} onPress={() => { setIntensity(val); setStep('result'); }}><Text style={[styles.scaleBtnText, { color: intensity === val ? colors.background : colors.text }]}>{val}</Text></TouchableOpacity>))}</View>
        <StyledButton title="← Назад к эмоциям" onPress={() => setStep('emotions')} variant="secondary" />
      </View>)}

      {step === 'result' && (
        <View style={[styles.card, levelInfo ? { borderLeftColor: levelInfo.color, borderLeftWidth: 4 } : {}]}>
          {!positiveOnly && levelInfo && (
            <>
              <View style={styles.resultHeader}>
                <MaterialCommunityIcons name={levelInfo.icon} size={48} color={levelInfo.color} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.resultTitle, { color: levelInfo.color }]}>{levelInfo.title}</Text>
                  <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>{levelInfo.subtitle}</Text>
                </View>
              </View>
              <Text style={[styles.resultDesc, { color: colors.text }]}>{levelInfo.desc}</Text>
            </>
          )}
          {positiveOnly ? (
            <View style={{ marginVertical: 12 }}>
              <Text style={[styles.positiveMessage, { color: colors.accent }]}>Похоже, вы чувствуете радость или любовь — это прекрасно! Сейчас вам не нужны техники, просто наслаждайтесь. Если захотите закрепить это состояние, попробуйте «Накопление положительных эмоций».</Text>
              <TouchableOpacity style={styles.techBtn} onPress={() => router.push({ pathname: '/techniques', params: { open: 'positive' } })} activeOpacity={0.7}><Text style={[styles.techBtnText, { color: colors.text }]}>Накопление положительных эмоций</Text><MaterialCommunityIcons name="arrow-right" size={20} color={colors.textSecondary} /></TouchableOpacity>
            </View>
          ) : (
            recommended.length > 0 && (
              <View style={{ marginVertical: 12 }}>
                <Text style={[styles.recTitle, { color: colors.accent }]}>🔧 Рекомендуемые техники:</Text>
                {recommended.map((tech, i) => { const techId = TECHNIQUE_ID_MAP[tech] || ''; return (<TouchableOpacity key={i} style={styles.techBtn} onPress={() => router.push({ pathname: '/techniques', params: { open: techId } })} activeOpacity={0.7}><Text style={[styles.techBtnText, { color: colors.text }]}>{tech}</Text><MaterialCommunityIcons name="arrow-right" size={20} color={colors.textSecondary} /></TouchableOpacity>); })}
              </View>
            )
          )}
          <StyledButton title="Пройти заново" onPress={reset} variant="secondary" />
        </View>
      )}
    </ScrollView></SafeAreaView></Background>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, scroll: { padding: Spacing.md }, iconContainer: { alignItems: 'center', marginBottom: 8 },
  card: { backgroundColor: 'rgba(19,30,43,0.8)', borderRadius: 16, padding: Spacing.md, marginTop: Spacing.md, borderWidth: 1, borderColor: '#1E2D3A' },
  cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8, textAlign: 'center', color: '#D0D9E2' },
  invite: { fontSize: 15, color: '#C9A84C', marginBottom: 12, lineHeight: 22, textAlign: 'center', fontWeight: '500' },
  hint: { fontSize: 13, textAlign: 'center', marginBottom: 12, fontStyle: 'italic', color: '#7B8FA1' },
  contextHint: { fontSize: 13, textAlign: 'center', marginBottom: 8, fontStyle: 'italic', lineHeight: 18, color: '#7B8FA1' },
  blockDivider: { height: 1, backgroundColor: '#1E2D3A', marginVertical: Spacing.md },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 6, gap: 8, borderRadius: 10, marginBottom: 2 },
  checkRowActive: { backgroundColor: 'rgba(201,168,76,0.15)' }, checkLabel: { fontSize: 14, flex: 1 },
  buttonGroup: { marginTop: Spacing.md }, skipBtn: { alignItems: 'center', marginTop: 10 }, skipText: { fontSize: 14 },
  scaleContainer: { flexDirection: 'row', justifyContent: 'center', gap: 2, paddingHorizontal: 6, marginBottom: 12 },
  scaleBtn: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scaleBtnText: { fontSize: 12, fontWeight: '600' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  resultTitle: { fontSize: 22, fontWeight: '700' }, resultSubtitle: { fontSize: 14, marginTop: 2, color: '#7B8FA1' },
  resultDesc: { fontSize: 15, lineHeight: 22, marginBottom: 12, color: '#D0D9E2' },
  recTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8, color: '#C9A84C' },
  techBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#131E2B', borderRadius: 8, borderWidth: 1, borderColor: '#1E2D3A', marginBottom: 6 },
  techBtnText: { fontSize: 14, fontWeight: '500' },
  welcomeTitle: { fontSize: 20, fontWeight: '700', color: '#C9A84C', marginBottom: 8, marginTop: 16 },
  welcomeText: { fontSize: 15, lineHeight: 22, color: '#D0D9E2', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-around', gap: 12, marginBottom: 12 },
  methodBtn: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 6 },
  methodTitle: { fontSize: 15, fontWeight: '600', marginTop: 4 }, methodDesc: { fontSize: 12 },
  positiveMessage: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
});
