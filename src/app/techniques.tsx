import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import Background from '../components/Background';
import StyledButton from '../components/StyledButton';
import StyledInput from '../components/StyledInput';
import ProgressBar from '../components/ProgressBar';
import { useThemeColors, Fonts, Spacing } from '../theme';

interface Technique {
  id: string;
  title: string;
  when: string;
  desc: string;
  fields: string[];
  examples: string[];
  finalMessage: string;
  emojis?: string[];
  type?: 'input' | 'instruction';
}

const techniques: Technique[] = [
  // Зелёный уровень
  {
    id: 'surf', title: '🌊 Серфинг эмоций',
    when: 'Сильные эмоции, тяга, провоцирующие симптомы.',
    desc: 'Позвольте тревожной волне пройти, не борясь и не убегая.',
    fields: ['Где в теле вы ощущаете эмоцию?', 'Опишите это ощущение (пульсация, сжатие, жар…)', 'Что происходит, когда вы просто наблюдаете за ним, не меняя?'],
    examples: ['Например: в груди, тяжесть', 'Например: горячая волна, пульсирует', 'Например: ощущение слабеет, потом возвращается, я могу просто смотреть'],
    emojis: ['🌊', '🏄', '👀'],
    finalMessage: 'Эмоции подобны волнам: у них есть начало, пик и спад. Серфинг помогает скользить по ним, не захлёбываясь.',
    type: 'input',
  },
  {
    id: 'cba', title: '⚖️ Анализ выгод и издержек',
    when: 'Повторяющееся поведение, которое хотите изменить, или дилемма.',
    desc: 'Взвесьте плюсы и минусы привычного поведения или варианта.',
    fields: ['Что анализируем?', 'Краткосрочные выгоды', 'Краткосрочные издержки', 'Долгосрочные выгоды', 'Долгосрочные издержки'],
    examples: ['Например: прокрастинация', 'Избегание дискомфорта, кажущееся облегчение', 'Чувство вины, накопление дел', 'Ничего не меняется', 'Упущенные возможности, снижение самооценки'],
    finalMessage: 'Взгляните на таблицу: что перевешивает? Помогает ли это поведение в долгосрочной перспективе?',
    type: 'input',
  },
  {
    id: 'disarm', title: '🛡️ Осадда деструктивных образов (DISARM)',
    when: 'Навязчивые мысленные образы, катастрофические фантазии.',
    desc: 'Противодействуйте образам как рекламе, которую не обязательно покупать.',
    fields: ['Опишите навязчивый образ.', 'Какие чувства он вызывает?', 'Представьте, что это просто реклама. Хотите ли вы её «купить»?', 'Чем заменить этот образ? Придумайте позитивную альтернативу.'],
    examples: ['Например: картинка, как я кричу на близких', 'Страх, злость', 'Это старая запись, не моя потребность', 'Я представляю, как спокойно обсуждаю проблему'],
    finalMessage: 'Вы осознали, что образ — лишь старая запись, и вы можете выбирать, чему следовать.',
    type: 'input',
  },
  {
    id: 'usa', title: '💖 Безусловное самопринятие',
    when: 'Стыд, вина или недовольство собой.',
    desc: 'Примите себя целиком, даже если ваши действия или чувства не идеальны.',
    fields: ['За что я себя сейчас осуждаю?', 'Какие качества или поступки вызывают стыд?', 'Могу ли я отделить поступки от своей ценности как человека?', 'Сформулируйте утверждение: «Я принимаю себя полностью, даже если...»'],
    examples: ['Например: за прокрастинацию', 'Считаю себя ленивым', 'Лень — поведение, а не личность', '«Я принимаю себя полностью, даже если иногда прокрастинирую»'],
    finalMessage: 'Принятие себя не означает одобрение поступков, но даёт опору для изменений.',
    type: 'input',
  },
  {
    id: 'factcheck', title: '🔍 Проверка фактов',
    when: 'Эмоция кажется несоразмерной ситуации.',
    desc: 'Шесть вопросов, чтобы соотнести эмоции с реальностью.',
    fields: [
      'Какую эмоцию я хочу изменить?',
      'Какое событие вызвало эмоцию? (только факты)',
      'Мои интерпретации и предположения?',
      'Воспринимаю ли я это как угрозу? Оцените вероятность.',
      'Что самое худшее может произойти? Как я справлюсь?',
      'Соответствует ли моя эмоция и её сила фактам?'
    ],
    examples: [
      'Например: тревога', 'Например: начальник не ответил на письмо',
      'Например: он считает меня некомпетентным', 'Например: угроза увольнения, вероятность 20%',
      'Например: уволят — обновлю резюме, буду искать новую работу', 'Например: тревога завышена, факты не подтверждают катастрофу'
    ],
    finalMessage: 'Сравнив эмоцию с фактами, вы можете увидеть ситуацию более ясно.',
    type: 'input',
  },
  {
    id: 'opposite', title: '↔️ Противоположное действие',
    when: 'Эмоция не соответствует фактам или неэффективна.',
    desc: 'Семь шагов, чтобы изменить эмоцию через действие.',
    fields: [
      'Назовите эмоцию, которую хотите изменить.',
      'Проверьте факты (соответствует ли эмоция?).',
      'Опишите побуждение к действию.',
      'Обратитесь к Мудрому разуму: эффективно ли это?',
      'Определите противоположное действие.',
      'Действуйте противоположно во всех отношениях.',
      'Продолжайте, пока эмоция не изменится.'
    ],
    examples: [
      'Например: страх', 'Например: факты не подтверждают опасность',
      'Например: хочется избежать встречи', 'Например: избегание не решит проблему',
      'Например: пойти на встречу, подготовившись', 'Например: одеться, выйти, говорить спокойно',
      'Например: после встречи страх уменьшился'
    ],
    finalMessage: 'Действуя наперекор эмоции, вы учите мозг новым реакциям.',
    type: 'input',
  },
  {
    id: 'radical', title: '🌱 Радикальное принятие',
    when: 'Неприятная реальность, которую невозможно изменить.',
    desc: 'Полное принятие реальности такой, какая она есть.',
    fields: [],
    examples: [],
    finalMessage: '',
    type: 'instruction',
  },
  // Жёлтый уровень
  {
    id: 'senses', title: '🖐️ Самоуспокоение через 5 чувств',
    when: 'Нужно быстро снизить дистресс, переключив внимание.',
    desc: 'Найдите приятные стимулы для каждого органа чувств.',
    fields: [],
    examples: [],
    finalMessage: '',
    type: 'instruction',
  },
  {
    id: 'improve', title: '🌈 Улучшение момента',
    when: 'Трудно пережить текущую ситуацию.',
    desc: 'Несколько коротких техник для облегчения состояния.',
    fields: [],
    examples: [],
    finalMessage: '',
    type: 'instruction',
  },
  {
    id: 'distract', title: '🎯 Отвлечение',
    when: 'Нужно переключиться с болезненных переживаний.',
    desc: 'Способы безопасно отвлечься от дистресса.',
    fields: [],
    examples: [],
    finalMessage: '',
    type: 'instruction',
  },
  {
    id: 'halfsmile', title: '🙂 Полуулыбка и открытые ладони',
    when: 'Напряжение в теле, сопротивление реальности.',
    desc: 'Телесная практика принятия.',
    fields: [],
    examples: [],
    finalMessage: '',
    type: 'instruction',
  },
  // Красный уровень
  {
    id: 'stop', title: '🛑 STOP',
    when: 'Острый кризис, сильный импульс.',
    desc: 'Быстрый навык для остановки автоматической реакции.',
    fields: [],
    examples: [],
    finalMessage: '',
    type: 'instruction',
  },
  {
    id: 'trud', title: '⚡ ТРУД (Температура, Расслабление, Упражнения, Дыхание)',
    when: 'Очень сильные эмоции, требующие быстрого телесного сброса.',
    desc: 'Измените химию тела за несколько минут.',
    fields: [],
    examples: [],
    finalMessage: '',
    type: 'instruction',
  },
];

// Инструкции для техник без ввода
const instructions: Record<string, { steps: string[]; final: string }> = {
  radical: {
    steps: [
      '1. Наблюдайте со стороны, как вы боретесь с реальностью.',
      '2. Вспомните, что реальность неприятна, но она такая, какая есть.',
      '3. Напомните, что у реальности есть причины. Найдите причинно-следственные связи.',
      '4. Практикуйте целостное принятие реальности умом, телом и сознанием.',
      '5. Составьте список действий, которые вы бы сделали, если бы приняли неприемлемое.',
      '6. Обратите внимание на ощущения своего тела.',
      '7. Позвольте себе испытать естественное огорчение, чтобы отпустить ситуацию.',
      '8. Вспомните, что жизнь стоит того, чтобы жить, даже если в ней есть боль.',
      '9. Взвесьте все за и против, чтобы начать практиковать принятие сейчас.'
    ],
    final: 'Принятие не означает одобрение. Это первый шаг к изменениям.'
  },
  senses: {
    steps: [
      '👁️ Зрение: найдите приятный глазу объект (цветок, фото, пейзаж).',
      '👂 Слух: включите любимую музыку или послушайте звуки природы.',
      '👃 Обоняние: вдохните приятный запах (кофе, эфирное масло).',
      '👅 Вкус: попробуйте что-то вкусное, тщательно распробуйте.',
      '🤚 Осязание: прикоснитесь к мягкой ткани, погладьте домашнее животное.'
    ],
    final: 'Вы переключили внимание на приятные ощущения и вернулись в настоящий момент.'
  },
  improve: {
    steps: [
      '🌈 Воображение: представьте безопасное место, где вам хорошо.',
      '🔍 Смысл: найдите смысл в текущей ситуации (чему она учит?).',
      '😌 Релаксация: сделайте глубокий вдох и выдох, расслабьте плечи.',
      '⏸️ Короткий отпуск: разрешите себе паузу на 1-2 минуты, ничего не делая.',
      '💬 Самоободрение: скажите себе что-то поддерживающее («Я справлюсь»).'
    ],
    final: 'Даже несколько минут передышки могут изменить ваше состояние.'
  },
  distract: {
    steps: [
      '🏃 Деятельность: займитесь чем-то активным (уборка, прогулка).',
      '🤝 Помощь другим: позвоните другу, предложите помощь.',
      '📊 Сравнение: вспомните, как вы справлялись раньше.',
      '😲 Сильные ощущения: примите контрастный душ, сожмите резиновый мячик.',
      '💭 Другие мысли: посчитайте предметы вокруг или вспомните стихотворение.'
    ],
    final: 'Отвлекаясь безопасно, вы даёте эмоции утихнуть.'
  },
  halfsmile: {
    steps: [
      '1. Расслабьте мышцы лица.',
      '2. Поднимите уголки губ легко вверх, почти незаметно для окружающих.',
      '3. Сделайте умиротворённое выражение лица.',
      '4. Разверните ладони наружу, большими пальцами от себя.',
      '5. Если сидите, положите ладони на колени. Расслабьте руки.'
    ],
    final: 'Тело подаёт сигнал мозгу: всё в порядке, можно расслабиться.'
  },
  stop: {
    steps: [
      '🛑 Стоп! — Замрите, не реагируйте.',
      '⬅️ Шаг назад — Сделайте паузу, отстранитесь от ситуации.',
      '👀 Наблюдайте — Обратите внимание на то, что вас окружает (вижу, слышу, чувствую).',
      '✅ Продолжайте осознанно — Примите мудрое или эффективное решение.'
    ],
    final: 'Вы вернули контроль и можете действовать осознанно.'
  },
  trud: {
    steps: [
      '🌡️ Температура: умойтесь ледяной водой или приложите холод к запястьям на 30 секунд.',
      '😌 Расслабление: прогрессивно напрягите и расслабьте мышцы тела.',
      '🏃 Упражнения: сделайте интенсивные приседания или бег на месте.',
      '🌬️ Дыхание: медленный глубокий выдох, затем спокойный вдох.'
    ],
    final: 'Вы сбросили острое напряжение через тело.'
  }
};

export default function TechniquesScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ open?: string }>();
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
    if (!selected) return;
    if (selected.type === 'instruction') {
      const instr = instructions[selected.id] || { steps: [] };
      const total = instr.steps.length;
      if (currentStep < total - 1) {
        setCurrentStep(s => s + 1);
      } else {
        setCompleted(true);
      }
    } else {
      if (currentStep < selected.fields.length - 1) {
        setCurrentStep(s => s + 1);
      } else {
        setCompleted(true);
      }
    }
  };

  const handlePrev = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };
  const handleAnswer = (text: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = text;
    setAnswers(newAnswers);
  };
  const handleClose = () => { setSelected(null); setCurrentStep(0); setAnswers([]); setCompleted(false); };

  // Автооткрытие техники по параметру из Компаса
  useEffect(() => {
    if (params.open) {
      const tech = techniques.find(t => t.id === params.open);
      if (tech) startTechnique(tech);
    }
  }, [params.open]);

  // Рендер выбранной техники
  if (selected) {
    if (selected.type === 'instruction') {
      const instr = instructions[selected.id] || { steps: [], final: '' };
      const total = instr.steps.length;
      return (
        <Background>
          <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scroll}>
              <Text style={[Fonts.title, { color: colors.text }]}>{selected.title}</Text>
              <Text style={styles.when}>{selected.when}</Text>
              <Text style={styles.desc}>{selected.desc}</Text>
              <ProgressBar step={completed ? total : currentStep} total={total} />
              {completed ? (
                <View style={styles.card}>
                  <Text style={styles.congrats}>✅ Завершено</Text>
                  <Text style={styles.finalMessage}>{instr.final}</Text>
                  <StyledButton title="Понятно" onPress={handleClose} />
                </View>
              ) : (
                <View style={styles.card}>
                  <Text style={styles.stepTitle}>Шаг {currentStep + 1} из {total}</Text>
                  <Text style={styles.instructionText}>{instr.steps[currentStep]}</Text>
                  <View style={styles.buttonRow}>
                    <StyledButton title="Назад" onPress={handlePrev} variant="secondary" disabled={currentStep === 0} />
                    <View style={{ width: 10 }} />
                    <StyledButton title={currentStep === total - 1 ? 'Завершить' : 'Дальше'} onPress={handleNext} />
                  </View>
                  <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                    <Text style={styles.closeText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Background>
      );
    }

    // Техника с вводом
    const total = selected.fields.length;
    return (
      <Background>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={[Fonts.title, { color: colors.text }]}>{selected.title}</Text>
            <Text style={styles.when}>{selected.when}</Text>
            <Text style={styles.desc}>{selected.desc}</Text>
            <ProgressBar step={completed ? total : currentStep} total={total} />
            {completed ? (
              <View style={styles.card}>
                <Text style={styles.congrats}>✅ Упражнение завершено</Text>
                {selected.id === 'cba' ? (
                  <View style={styles.table}>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableHeader, { color: colors.text }]}></Text>
                      <Text style={[styles.tableHeader, { color: colors.positive }]}>Выгоды</Text>
                      <Text style={[styles.tableHeader, { color: colors.danger }]}>Издержки</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Краткосрочно</Text>
                      <Text style={styles.tableCell}>{answers[1] || '—'}</Text>
                      <Text style={styles.tableCell}>{answers[2] || '—'}</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Долгосрочно</Text>
                      <Text style={styles.tableCell}>{answers[3] || '—'}</Text>
                      <Text style={styles.tableCell}>{answers[4] || '—'}</Text>
                    </View>
                  </View>
                ) : (
                  selected.fields.map((field, i) => (
                    <View key={i} style={styles.summaryItem}>
                      <Text style={styles.fieldLabel}>{selected.emojis?.[i] ? selected.emojis[i] + ' ' : ''}{field}</Text>
                      <Text style={styles.fieldValue}>{answers[i] || '—'}</Text>
                    </View>
                  ))
                )}
                <Text style={styles.reflection}>{selected.finalMessage}</Text>
                <StyledButton title="Понятно" onPress={handleClose} />
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.stepTitle}>Шаг {currentStep + 1} из {total}</Text>
                <Text style={styles.label}>{selected.emojis?.[currentStep] ? selected.emojis[currentStep] + ' ' : ''}{selected.fields[currentStep]}</Text>
                <Text style={styles.example}>{selected.examples[currentStep]}</Text>
                <StyledInput value={answers[currentStep]} onChangeText={handleAnswer} placeholder="Введите ваш ответ..." multiline />
                <View style={styles.buttonRow}>
                  <StyledButton title="Назад" onPress={handlePrev} variant="secondary" disabled={currentStep === 0} />
                  <View style={{ width: 10 }} />
                  <StyledButton title={currentStep === total - 1 ? 'Завершить' : 'Дальше'} onPress={handleNext} />
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Text style={styles.closeText}>Закрыть</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Background>
    );
  }

  // Главный список
  return (
    <Background>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>Техники</Text>
          <Text style={[Fonts.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg }]}>Инструменты самопомощи</Text>

          <View style={[styles.levelSection, { borderLeftColor: '#4F9F6E' }]}>
            <Text style={[styles.levelTitle, { color: '#4F9F6E' }]}>🟢 Решать (0–40%)</Text>
            {techniques.filter(t => ['surf','cba','disarm','usa','factcheck','opposite','radical'].includes(t.id)).map(tech => (
              <TouchableOpacity key={tech.id} style={styles.techCard} onPress={() => startTechnique(tech)} activeOpacity={0.7}>
                <Text style={styles.techCardTitle}>{tech.title}</Text>
                <Text style={styles.techCardDesc}>{tech.when}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.levelSection, { borderLeftColor: '#C9A84C' }]}>
            <Text style={[styles.levelTitle, { color: '#C9A84C' }]}>🟡 Пережить (40–65%)</Text>
            {techniques.filter(t => ['senses','improve','distract','halfsmile'].includes(t.id)).map(tech => (
              <TouchableOpacity key={tech.id} style={styles.techCard} onPress={() => startTechnique(tech)} activeOpacity={0.7}>
                <Text style={styles.techCardTitle}>{tech.title}</Text>
                <Text style={styles.techCardDesc}>{tech.when}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.levelSection, { borderLeftColor: '#C44F4F' }]}>
            <Text style={[styles.levelTitle, { color: '#C44F4F' }]}>🔴 Сбросить (65–100%)</Text>
            {techniques.filter(t => ['stop','trud'].includes(t.id)).map(tech => (
              <TouchableOpacity key={tech.id} style={styles.techCard} onPress={() => startTechnique(tech)} activeOpacity={0.7}>
                <Text style={styles.techCardTitle}>{tech.title}</Text>
                <Text style={styles.techCardDesc}>{tech.when}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.md },
  when: { fontSize: 13, marginBottom: 8, fontStyle: 'italic', textAlign: 'center', color: '#7B8FA1' },
  desc: { fontSize: 14, textAlign: 'center', marginBottom: Spacing.md, color: '#7B8FA1' },
  card: {
    backgroundColor: '#131E2B',
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#1E2D3A',
  },
  stepTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#D0D9E2' },
  label: { fontSize: 15, marginBottom: 8, color: '#D0D9E2' },
  example: { fontSize: 12, marginBottom: 12, fontStyle: 'italic', color: '#C9A84C' },
  instructionText: { fontSize: 16, lineHeight: 24, marginBottom: 20, color: '#D0D9E2' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  closeBtn: { alignItems: 'center', marginTop: 8 },
  closeText: { fontSize: 14, color: '#7B8FA1' },
  congrats: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#4F9F6E' },
  summaryItem: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 2, color: '#C9A84C' },
  fieldValue: { fontSize: 14, color: '#D0D9E2' },
  reflection: { fontSize: 13, marginTop: 12, fontStyle: 'italic', color: '#7B8FA1' },
  finalMessage: { fontSize: 15, lineHeight: 22, marginTop: 12, fontStyle: 'italic', color: '#D0D9E2', textAlign: 'center' },
  table: { marginBottom: 12, borderWidth: 1, borderColor: '#1E2D3A', borderRadius: 8, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#1E2D3A' },
  tableHeader: { flex: 1, padding: 6, fontWeight: '600', textAlign: 'center', color: '#D0D9E2' },
  tableLabel: { flex: 1, padding: 6, fontWeight: '500', textAlign: 'center', color: '#D0D9E2' },
  tableCell: { flex: 1, padding: 6, fontSize: 12, textAlign: 'center', color: '#7B8FA1' },
  levelSection: {
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    paddingLeft: Spacing.md,
  },
  levelTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  techCard: {
    backgroundColor: '#131E2B',
    borderRadius: 12,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#1E2D3A',
  },
  techCardTitle: { fontSize: 16, fontWeight: '600', color: '#D0D9E2' },
  techCardDesc: { fontSize: 13, color: '#7B8FA1', marginTop: 4 },
});
