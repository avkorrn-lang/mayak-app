import React, { useState } from 'react'; import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'; import { SafeAreaView } from 'react-native-safe-area-context'; import { useThemeColors, Fonts, Spacing } from '../theme'; import StyledButton from '../components/StyledButton'; import StyledInput from '../components/StyledInput'; import ProgressBar from '../components/ProgressBar'; import Background from '../components/Background';

interface Technique {
  id: string; title: string; when: string; desc: string; fields: string[]; examples: string[]; finalMessage: string; emojis?: string[];
}

const techniques: Technique[] = [
  {
    id: 'surf', title: 'Серфинг эмоций',
    when: 'Когда чувствуете сильные эмоции, тягу или провоцирующие симптомы поведения, от которых хотите избавиться. Можно использовать как регулярную тренировку осознанности.',
    desc: 'Позвольте тревожной волне пройти, не борясь и не убегая.',
    fields: ['Где в теле вы ощущаете эмоцию?', 'Опишите это ощущение (пульсация, сжатие, жар…)', 'Что происходит, когда вы просто наблюдаете за ним, не меняя?'],
    examples: ['Например: в груди, тяжесть', 'Например: горячая волна, пульсирует', 'Например: ощущение слабеет, потом возвращается, я могу просто смотреть'],
    emojis: ['🌊', '🏄', '👀'],
    finalMessage: 'Эмоции подобны волнам: у них есть начало, пик и спад. Серфинг помогает скользить по ним, не захлёбываясь, и не бороться с течением.',
  },
  {
    id: 'cba', title: 'Анализ выгод и издержек',
    when: 'Когда замечаете, что повторяете поведение, которое хотите изменить (прокрастинация, избегание), или когда не можете принять решение и стоите перед дилеммой.',
    desc: 'Взвесьте плюсы и минусы привычного поведения или варианта.',
    fields: ['Что анализируем? (поведение или дилемма)', 'Краткосрочные выгоды (списком через запятую)', 'Краткосрочные издержки', 'Долгосрочные выгоды', 'Долгосрочные издержки'],
    examples: ['Например: прокрастинация', 'Избегание дискомфорта, кажущееся облегчение', 'Чувство вины, накопление дел', 'Ничего не меняется', 'Упущенные возможности, снижение самооценки'],
    finalMessage: 'Взгляните на таблицу: что перевешивает? Помогает ли это поведение в долгосрочной перспективе?',
  },
  {
    id: 'disarm', title: 'Осада деструктивных образов (DISARM)',
    when: 'Когда вас атакуют навязчивые мысленные образы или картины (катастрофические фантазии).',
    desc: 'Противодействуйте навязчивым образам, рассматривая их как рекламу, которую не обязательно покупать.',
    fields: ['Опишите навязчивый образ.', 'Какие чувства он вызывает?', 'Представьте, что этот образ — просто реклама. Хотите ли вы её «купить»?', 'Чем заменить этот образ? Придумайте позитивную альтернативу.'],
    examples: ['Например: картинка, как я кричу на близких', 'Страх, злость', 'Это старая запись, не моя потребность', 'Я представляю, как спокойно обсуждаю проблему'],
    finalMessage: 'Вы осознали, что образ — лишь старая запись, и вы можете выбирать, чему следовать.',
  },
  {
    id: 'usa', title: 'Безусловное самопринятие',
    when: 'Когда чувствуете стыд, вину или недовольство собой.',
    desc: 'Примите себя целиком, даже если ваши действия или чувства не идеальны.',
    fields: ['За что я себя сейчас осуждаю?', 'Какие качества или поступки вызывают стыд?', 'Могу ли я отделить поступки от своей ценности как человека?', 'Сформулируйте утверждение: «Я принимаю себя полностью, даже если...»'],
    examples: ['Например: за прокрастинацию', 'Считаю себя ленивым', 'Лень — поведение, а не личность', '«Я принимаю себя полностью, даже если иногда прокрастинирую»'],
    finalMessage: 'Принятие себя не означает одобрение поступков, но даёт опору для изменений.',
  },
  {
    id: 'deads', title: 'Остановись и переключись (ТРУД)',
    when: 'Применяется при очень сильном гневе, панике, непреодолимых импульсах.',
    desc: 'Пошаговая инструкция для быстрого сброса напряжения.',
    fields: [],
    examples: [],
    finalMessage: '',
  },
];

export default function SmartScreen() {
  const colors = useThemeColors();
  const [selected, setSelected] = useState<Technique | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const startTechnique = (tech: Technique) => {
    setSelected(tech);
    setCurrentStep(0);
    setAnswers(new Array(tech.fields.length).fill(''));
    setCompleted(false);
  };

  const handleNext = () => {
    if (selected && selected.fields.length > 0 && currentStep < selected.fields.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      setCompleted(true);
    }
  };
  const handlePrev = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };
  const handleAnswer = (text: string) => { const newAnswers = [...answers]; newAnswers[currentStep] = text; setAnswers(newAnswers); };
  const handleClose = () => { setSelected(null); setCurrentStep(0); setAnswers([]); setCompleted(false); };

  if (selected) {
    if (selected.id === 'deads') {
      return (
        <Background>
          <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scroll}>
              <Text style={[Fonts.title, { color: colors.text }]}>{selected.title}</Text>
              <Text style={[styles.when, { color: colors.accent }]}>Когда применять: {selected.when}</Text>
              <Text style={[styles.desc, { color: colors.textSecondary }]}>{selected.desc}</Text>
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Шаг 1: Стоп!</Text>
                <Text style={[styles.instruction, { color: colors.textSecondary }]}>Громко скажите себе «Стоп!» или хлопните в ладоши. Прервите автоматическую реакцию.</Text>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Шаг 2: Осознайте</Text>
                <Text style={[styles.instruction, { color: colors.textSecondary }]}>Что сейчас происходит? Какая эмоция вас захлестнула? Назовите её про себя.</Text>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Шаг 3: Сделайте паузу</Text>
                <Text style={[styles.instruction, { color: colors.textSecondary }]}>Умойтесь ледяной водой, выйдите в другую комнату или на свежий воздух. Смените обстановку на 1–2 минуты.</Text>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Шаг 4: Переключитесь</Text>
                <Text style={[styles.instruction, { color: colors.textSecondary }]}>Займите руки или голову чем‑то нейтральным: посчитайте предметы вокруг, включите музыку, сделайте 10 приседаний.</Text>
                <Text style={[styles.final, { color: colors.accent }]}>Вы справились с острым импульсом. Теперь можно вернуться к ситуации более осознанно.</Text>
                <StyledButton title="Понятно" onPress={handleClose} />
              </View>
            </ScrollView>
          </SafeAreaView>
        </Background>
      );
    }

    const total = selected.fields.length;
    return (
      <Background>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={[Fonts.title, { color: colors.text }]}>{selected.title}</Text>
            <Text style={[styles.when, { color: colors.accent }]}>Когда применять: {selected.when}</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{selected.desc}</Text>
            <ProgressBar step={completed ? total : currentStep} total={total} />
            {completed ? (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.congrats, { color: colors.positive }]}>✅ Упражнение завершено</Text>
                {selected.id === 'cba' ? (
                  <View style={styles.table}>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableHeader, { color: colors.text }]}></Text>
                      <Text style={[styles.tableHeader, { color: colors.positive }]}>Выгоды</Text>
                      <Text style={[styles.tableHeader, { color: colors.danger }]}>Издержки</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableLabel, { color: colors.text }]}>Краткосрочно</Text>
                      <Text style={[styles.tableCell, { color: colors.textSecondary }]}>{answers[1] || '—'}</Text>
                      <Text style={[styles.tableCell, { color: colors.textSecondary }]}>{answers[2] || '—'}</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableLabel, { color: colors.text }]}>Долгосрочно</Text>
                      <Text style={[styles.tableCell, { color: colors.textSecondary }]}>{answers[3] || '—'}</Text>
                      <Text style={[styles.tableCell, { color: colors.textSecondary }]}>{answers[4] || '—'}</Text>
                    </View>
                  </View>
                ) : (
                  selected.fields.map((field, i) => (
                    <View key={i} style={styles.summaryItem}>
                      <Text style={[styles.fieldLabel, { color: colors.accent }]}>{selected.emojis ? selected.emojis[i] + ' ' : ''}{field}</Text>
                      <Text style={[styles.fieldValue, { color: colors.text }]}>{answers[i] || '—'}</Text>
                    </View>
                  ))
                )}
                <Text style={[styles.reflection, { color: colors.textSecondary }]}>{selected.finalMessage}</Text>
                <StyledButton title="Понятно" onPress={handleClose} />
              </View>
            ) : (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Шаг {currentStep + 1} из {total}</Text>
                <Text style={[styles.label, { color: colors.text }]}>{selected.emojis ? selected.emojis[currentStep] + ' ' : ''}{selected.fields[currentStep]}</Text>
                <Text style={[styles.example, { color: colors.accent }]}>{selected.examples[currentStep]}</Text>
                <StyledInput value={answers[currentStep]} onChangeText={handleAnswer} placeholder="Введите ваш ответ..." multiline />
                <View style={styles.row}>
                  <StyledButton title="Назад" onPress={handlePrev} variant="secondary" disabled={currentStep === 0} />
                  <View style={{ width: 10 }} />
                  <StyledButton title={currentStep === total - 1 ? 'Завершить' : 'Дальше'} onPress={handleNext} />
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Text style={[styles.closeText, { color: colors.textSecondary }]}>Закрыть</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Background>
    );
  }

  return (
    <Background>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>СМАРТ</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg }]}>Инструменты самопомощи на основе SMART Recovery</Text>
          {techniques.map(t => (
            <TouchableOpacity key={t.id} style={[styles.techCard, { backgroundColor: colors.surface, borderLeftColor: colors.accent }]} onPress={() => startTechnique(t)} activeOpacity={0.7}>
              <Text style={[styles.techTitle, { color: colors.text }]}>{t.title}</Text>
              <Text style={[styles.techWhen, { color: colors.accent }]}>{t.when}</Text>
              <Text style={[styles.techDesc, { color: colors.textSecondary }]}>{t.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.md },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: Spacing.lg },
  when: { fontSize: 13, marginBottom: 8, fontStyle: 'italic', textAlign: 'center' },
  desc: { fontSize: 14, textAlign: 'center', marginBottom: Spacing.md },
  card: { borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1 },
  stepTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  instruction: { fontSize: 15, marginBottom: 16, lineHeight: 22 },
  label: { fontSize: 15, marginBottom: 8 },
  example: { fontSize: 12, marginBottom: 12, fontStyle: 'italic' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  closeBtn: { alignItems: 'center', marginTop: 8 },
  closeText: { fontSize: 14 },
  congrats: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  summaryItem: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  fieldValue: { fontSize: 14 },
  reflection: { fontSize: 13, marginTop: 12, fontStyle: 'italic' },
  table: { marginBottom: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc' },
  tableHeader: { flex: 1, padding: 6, fontWeight: '600', textAlign: 'center' },
  tableLabel: { flex: 1, padding: 6, fontWeight: '500', textAlign: 'center' },
  tableCell: { flex: 1, padding: 6, fontSize: 12, textAlign: 'center' },
  techCard: { borderRadius: 12, padding: Spacing.md, marginBottom: Spacing.sm, borderLeftWidth: 3 },
  techTitle: { fontWeight: '600', fontSize: 16, marginBottom: 4 },
  techWhen: { fontSize: 12, marginBottom: 4, fontStyle: 'italic' },
  techDesc: { fontSize: 13 },
  final: { fontSize: 15, fontWeight: '600', marginTop: 8, textAlign: 'center' },
});
