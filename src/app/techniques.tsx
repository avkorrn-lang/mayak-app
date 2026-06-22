import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import Background from '../components/Background';
import StyledButton from '../components/StyledButton';
import StyledInput from '../components/StyledInput';
import ProgressBar from '../components/ProgressBar';
import { useThemeColors, Fonts, Spacing } from '../theme';

interface Technique {
  id: string; title: string; when: string; desc: string; fields: string[]; examples: string[]; finalMessage: string; emojis?: string[]; type?: 'input' | 'instruction'; theory?: string;
}

const techniques: Technique[] = [
  {
    id: 'surf', title: '🌊 Серфинг эмоций',
    when: 'Сильные эмоции, тяга, провоцирующие симптомы.',
    desc: 'Позвольте тревожной волне пройти, не борясь и не убегая.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
  },
  {
    id: 'cba', title: '⚖️ Анализ выгод и издержек',
    when: 'Повторяющееся поведение, которое хотите изменить, или дилемма.',
    desc: 'Взвесьте плюсы и минусы привычного поведения или варианта.',
    fields: ['Что анализируем?', 'Краткосрочные выгоды', 'Краткосрочные издержки', 'Долгосрочные выгоды', 'Долгосрочные издержки'],
    examples: ['Например: прокрастинация', 'Избегание дискомфорта, кажущееся облегчение', 'Чувство вины, накопление дел', 'Ничего не меняется', 'Упущенные возможности, снижение самооценки'],
    finalMessage: 'Взгляните на таблицу: что перевешивает? Помогает ли это поведение в долгосрочной перспективе?',
    type: 'input',
    theory: 'Во время кризиса и на пути к деструктивному поведению представьте положительные и отрицательные последствия. Чёткое видение последствий помогает выбрать здоровый путь.',
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
    examples: ['Например: тревога', 'Например: начальник не ответил на письмо', 'Например: он считает меня некомпетентным', 'Например: угроза увольнения, вероятность 20%', 'Например: уволят — обновлю резюме, буду искать новую работу', 'Например: тревога завышена, факты не подтверждают катастрофу'],
    finalMessage: 'Сравнив эмоцию с фактами, вы можете увидеть ситуацию более ясно.',
    type: 'input',
    theory: 'Шесть вопросов, чтобы проверить, соответствуют ли ваши эмоции реальным фактам. Проверка фактов помогает увидеть реальность и снизить необоснованную тревогу.',
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
    examples: ['Например: страх', 'Например: факты не подтверждают опасность', 'Например: хочется избежать встречи', 'Например: избегание не решит проблему', 'Например: пойти на встречу, подготовившись', 'Например: одеться, выйти, говорить спокойно', 'Например: после встречи страх уменьшился'],
    finalMessage: 'Действуя наперекор эмоции, вы учите мозг новым реакциям.',
    type: 'input',
    theory: 'Семь шагов, чтобы изменить эмоцию через действие, когда она неэффективна.',
  },
  {
    id: 'radical', title: '🌱 Радикальное принятие',
    when: 'Неприятная реальность, которую невозможно изменить.',
    desc: 'Полное принятие реальности такой, какая она есть.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'Полное принятие реальности такой, какая она есть, без борьбы и отрицания. Это не одобрение, а отправная точка для изменений.',
  },
  {
    id: 'senses', title: '🖐️ Самоуспокоение через 5 чувств',
    when: 'Нужно быстро снизить дистресс, переключив внимание.',
    desc: 'Найдите приятные стимулы для каждого органа чувств.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'Успокойте себя с помощью каждого из пяти органов чувств, осознанно направляя внимание на что-то приятное.',
  },
  {
    id: 'improve', title: '🌈 Улучшение момента',
    when: 'Трудно пережить текущую ситуацию.',
    desc: 'Несколько коротких техник для облегчения состояния.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'Несколько коротких техник для облегчения состояния в трудный момент.',
  },
  {
    id: 'distract', title: '🎯 Отвлечение',
    when: 'Нужно переключиться с болезненных переживаний.',
    desc: 'Способы безопасно отвлечься от дистресса.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'Безопасное переключение внимания с болезненных переживаний на нейтральную или приятную деятельность.',
  },
  {
    id: 'halfsmile', title: '🙂 Полуулыбка и открытые ладони',
    when: 'Напряжение в теле, сопротивление реальности.',
    desc: 'Телесная практика принятия.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
  },
  {
    id: 'stop', title: '🛑 STOP',
    when: 'Острый кризис, сильный импульс.',
    desc: 'Быстрый навык для остановки автоматической реакции.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'Быстрый навык для остановки автоматической реакции в остром кризисе.',
  },
  {
    id: 'trud', title: '⚡ ТРУД',
    when: 'Очень сильные эмоции, требующие быстрого телесного сброса.',
    desc: 'Измените химию тела за несколько минут.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'Температура, Расслабление, Упражнения, Дыхание — быстрый способ сбросить острое напряжение через тело.',
  },
  {
    id: 'positive', title: '🌞 Накопление положительных эмоций',
    when: 'Радость, удовлетворение или желание закрепить хорошее состояние.',
    desc: 'Краткосрочные и долгосрочные шаги для увеличения позитивных переживаний.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'Создание списка приятных дел и полное вовлечение в позитивные события.',
  },
];

const instructions: Record<string, { steps: string[]; final: string }> = {
  radical: {
    steps: [
      '1. Наблюдайте со стороны, как вы боретесь с реальностью.',
      '2. Вспомните, что реальность неприятна, но она такая, какая есть.',
      '3. Напомните, что у реальности есть причины; выявите причинно-следственные связи.',
      '4. Практикуйте целостное принятие реальности умом, телом и сознанием.',
      '5. Составьте список действий, которые вы бы делали, если бы приняли неприемлемое.',
      '6. Обратите внимание на ощущения своего тела.',
      '7. Позвольте себе испытать естественное огорчение, чтобы отпустить ситуацию.',
      '8. Вспомните, что жизнь стоит того, чтобы жить, даже если в ней есть боль.',
      '9. Взвесьте все за и против, чтобы начать практиковать принятие сейчас.',
    ],
    final: 'Принятие не означает одобрение. Это первый шаг к изменениям.'
  },
  senses: {
    steps: [
      '👁️ Зрение: найдите приятный глазу объект (цветок, фото, пейзаж).',
      '👂 Слух: включите любимую музыку или послушайте звуки природы.',
      '👃 Обоняние: вдохните приятный запах (кофе, эфирное масло).',
      '👅 Вкус: попробуйте что-то вкусное, тщательно распробуйте.',
      '🤚 Осязание: прикоснитесь к мягкой ткани, погладьте домашнее животное.',
    ],
    final: 'Вы переключили внимание на приятные ощущения и вернулись в настоящий момент.'
  },
  improve: {
    steps: [
      '🌈 Воображение: представьте безопасное место, где вам хорошо.',
      '🔍 Смысл: найдите смысл в текущей ситуации (чему она учит?).',
      '😌 Релаксация: сделайте глубокий вдох и выдох, расслабьте плечи.',
      '⏸️ Короткий отпуск: разрешите себе паузу на 1-2 минуты, ничего не делая.',
      '💬 Самоободрение: скажите себе что-то поддерживающее («Я справлюсь»).',
    ],
    final: 'Даже несколько минут передышки могут изменить ваше состояние.'
  },
  distract: {
    steps: [
      '• Посредством деятельности (уборка, прогулка).',
      '• Посредством помощи другим людям.',
      '• Посредством сравнения (вспомните, как вы справлялись раньше).',
      '• Посредством эмоций противоположной направленности (посмотрите комедию).',
      '• Посредством выхода из ситуации (смените обстановку).',
      '• С помощью других мыслей (посчитайте предметы вокруг).',
      '• С помощью сильных ощущений (контрастный душ, холодная вода).',
    ],
    final: 'Отвлекаясь безопасно, вы даёте эмоции время утихнуть.'
  },
  halfsmile: {
    steps: [
      '1. Расслабьте мышцы лица.',
      '2. Поднимите уголки губ легко вверх, почти незаметно для окружающих.',
      '3. Сделайте умиротворённое выражение лица.',
      '4. Разверните ладони наружу, большими пальцами от себя.',
      '5. Если сидите, положите ладони на колени. Расслабьте руки.',
    ],
    final: 'Тело подаёт сигнал мозгу: всё в порядке, можно расслабиться.'
  },
  stop: {
    steps: [
      '🛑 Стоп! — Замрите, не реагируйте.',
      '⬅️ Шаг назад — Сделайте паузу, отстранитесь от ситуации.',
      '👀 Наблюдайте — Обратите внимание на то, что вас окружает (вижу, слышу, чувствую).',
      '✅ Продолжайте осознанно — Примите мудрое или эффективное решение.',
    ],
    final: 'Вы вернули контроль и можете действовать осознанно.'
  },
  trud: {
    steps: [
      '🌡️ Температурный контраст 30 сек (холодная вода на лицо или запястья).',
      '😌 Расслабление (прогрессивное напряжение и расслабление мышц).',
      '🏃 Упражнения (интенсивные приседания или бег на месте).',
      '🌬️ Дыхание (медленный выдох, затем спокойный вдох).',
    ],
    final: 'Вы сбросили острое напряжение через тело.'
  },
  positive: {
    steps: [
      'Создайте список приятных дел и событий, вызывающих положительные эмоции.',
      'Вовлекайтесь полностью: фиксируйте внимание на случившихся позитивных событиях.',
      'Возвращайтесь к позитивным событиям, когда отвлекаетесь на негативные.',
      'Опознавайте, но не обесценивайте, когда позитивное событие заканчивается.',
      'Перестаньте избегать: делайте то, что ведёт к успешной жизни прямо сейчас.',
      'Определите важные для вас ценности и поставьте маленькую цель на сегодня.',
      'Выберите один этап и выполните его.',
    ],
    final: 'Накопление положительных эмоций укрепляет устойчивость и помогает видеть светлые стороны жизни.'
  }
};

// ---------- График ----------
function LineChart({ data }: { data: { time: number; level: number }[] }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };
  if (data.length === 0) return null;
  const w = size.width || 300, h = size.height || 150;
  const padLeft = 30, padRight = 10, padTop = 10, padBottom = 20;
  const graphW = w - padLeft - padRight, graphH = h - padTop - padBottom;
  const minTime = data[0].time, maxTime = data[data.length - 1].time;
  const timeRange = maxTime - minTime || 1;
  const points = data.map(d => ({
    x: padLeft + ((d.time - minTime) / timeRange) * graphW,
    y: padTop + graphH - (d.level / 10) * graphH,
  }));
  return (
    <View style={{ width: '100%', height: 150, marginBottom: 20 }} onLayout={onLayout}>
      {size.width > 0 && (
        <>
          {points.map((p, i) => {
            if (i === 0) return null;
            const prev = points[i - 1];
            const dx = p.x - prev.x, dy = p.y - prev.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View key={i} style={{ position: 'absolute', left: prev.x, top: prev.y, width: length, height: 2, backgroundColor: '#C9A84C', transform: [{ rotate: `${angle}deg` }], transformOrigin: 'left center' }} />
            );
          })}
          {points.map((p, i) => (
            <View key={i} style={{ position: 'absolute', left: p.x - 6, top: p.y - 6, width: 12, height: 12, borderRadius: 6, backgroundColor: '#C9A84C', borderWidth: 2, borderColor: '#0B1622' }} />
          ))}
        </>
      )}
    </View>
  );
}

// ---------- Серфинг ----------
const PRACTICE_DURATION = 180;

const checkpoints = [
  { time: 0, message: 'Назовите эмоцию одним словом. Произнесите вслух или про себя: “Я чувствую... и оцените ее интенсивность на шкале”', showScale: true },
  { time: 15, message: 'Где в теле это ощущается? Какая форма, размер, температура? Оцените интенсивность на шкале ниже', showScale: true },
  { time: 45, message: 'Дышите. Вдох — выдох. Не пытайтесь изменить ощущение, просто наблюдайте за ним, как серфингист за волной. Периодически оценивая интенсивность эмоции на шкале.', showScale: true },
  { time: 75, message: 'Скажите мысленно: “Я разрешаю этому быть”. Не боритесь, не отвлекайтесь, не ищите причин. Оцените интенсивность', showScale: true },
  { time: 120, message: 'Заметьте: Стало легче? Возможно, эмоция уже пошла на спад? Продолжайте наблюдать.', showScale: true },
  { time: 150, message: 'Волна всё ещё есть? Если да — продолжайте наблюдение. Если нет — почувствуйте, как пространство внутри расширяется.', showScale: false },
  { time: 170, message: 'Упражнение завершается через 10 секунд. Вы справляетесь. Вы — не эмоция, вы — тот, кто её наблюдает.', showScale: false },
];

function SurfInteractive({ onClose }: { onClose: () => void }) {
  const colors = useThemeColors();
  const [phase, setPhase] = useState<'intro' | 'active' | 'done'>('intro');
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState('');
  const [showScale, setShowScale] = useState(false);
  const [rounds, setRounds] = useState<{ level: number; time: number }[]>([]);

  const breathAnim = useRef(new Animated.Value(0)).current;
  const targetScale = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathAnim]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleStart = () => {
    const now = Date.now();
    setElapsed(0);
    setPhase('active');
    setRounds([]);
    const first = checkpoints[0];
    setMessage(first.message);
    setShowScale(first.showScale);
    intervalRef.current = setInterval(() => {
      const sec = Math.floor((Date.now() - now) / 1000);
      setElapsed(sec);
      Animated.timing(progressAnim, { toValue: Math.min(sec / PRACTICE_DURATION, 1), duration: 500, useNativeDriver: false }).start();
      const activeCheckpoint = checkpoints.filter(cp => cp.time <= sec).slice(-1)[0];
      if (activeCheckpoint) {
        if (activeCheckpoint.message !== message) setMessage(activeCheckpoint.message);
        if (activeCheckpoint.showScale !== showScale) setShowScale(activeCheckpoint.showScale);
      }
      if (sec >= PRACTICE_DURATION) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase('done');
      }
    }, 200);
  };

  const handleRating = (level: number) => {
    const now = Date.now();
    setRounds(prev => [...prev, { level, time: now }]);
    const newScale = 0.8 + (level / 10) * 1.2;
    Animated.spring(targetScale, { toValue: newScale, useNativeDriver: true }).start();
    const targetColor = level >= 7 ? 2 : level >= 4 ? 1 : 0;
    Animated.timing(colorAnim, { toValue: targetColor, duration: 1800, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }).start();
  };

  const handleFinish = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase('done');
  };

  const scaleValue = Animated.multiply(
    targetScale,
    breathAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 1.2, 0.8], extrapolate: 'clamp' })
  );

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['#6B8E7B', '#B8965A', '#C08070'],
    extrapolate: 'clamp',
  });

  if (phase === 'intro') {
    return (
      <Background>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.surfCard}>
            <Text style={[Fonts.title, { color: colors.text, marginBottom: 20, textAlign: 'center' }]}>🌊 Серфинг эмоций</Text>
            <Text style={styles.text}>
              Эмоция — как волна: она нарастает, достигает пика и спадает. Бороться — утонуть, бежать — не успеть. Ваша задача — удержаться на гребне, наблюдая.{'\n\n'}
              Запомните: интенсивная эмоция длится не более 1–2 минут, если не подпитывать её мыслями. Вы не обязаны действовать, вы обязаны прожить.{'\n\n'}
              Как делать:{'\n'}
              • Назовите эмоцию (страх, стыд, злость, отчаяние — конкретно).{'\n'}
              • Найдите её в теле (где? форма? размер? движение?).{'\n'}
              • Дышите ровно и просто следите за ощущениями.{'\n'}
              • Разрешите волне быть («Я позволяю этому быть столько, сколько нужно»).{'\n'}
              • Замечайте, как меняется интенсивность.{'\n\n'}
              Нажмите «Начать» — программа будет давать подсказки с определённым интервалом. Длительность практики — 3 минуты.
            </Text>
            <StyledButton title="Начать" onPress={handleStart} />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}><Text style={styles.closeText}>Закрыть</Text></TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Background>
    );
  }

  if (phase === 'done') {
    return (
      <Background>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.surfCard}>
            <Text style={[Fonts.title, { color: colors.text, textAlign: 'center', marginBottom: 20 }]}>Завершено</Text>
            {rounds.length > 0 && (
              <>
                <Text style={styles.text}>Динамика интенсивности:</Text>
                <LineChart data={rounds} />
              </>
            )}
            <Text style={styles.text}>
              Вы только что прошли через эмоциональную волну, не сломавшись и не сбежав. Запомните это ощущение — вы можете чувствовать сильно и оставаться в безопасности. Эмоция прошла, а вы остались.{'\n\n'}
              Теперь, когда пик позади, вы можете принять решение не из паники, а из ясности. Если нужно — сделайте паузу, выпейте воды, вернитесь к реальности.{'\n\n'}
              Вы сильнее своей эмоции. Всегда.
            </Text>
            <StyledButton title="Понятно" onPress={onClose} />
          </ScrollView>
        </SafeAreaView>
      </Background>
    );
  }

  return (
    <Background>
      <SafeAreaView style={styles.safe}>
        <View style={styles.surfActiveContainer}>
          <View style={styles.circleContainer}>
            <Animated.View style={[styles.glowCircle, { transform: [{ scale: scaleValue }], backgroundColor }]} />
            <Animated.View style={[styles.glowLayer, { transform: [{ scale: scaleValue }], backgroundColor }]} />
            <Animated.View style={[styles.glowLayer2, { transform: [{ scale: scaleValue }], backgroundColor }]} />
          </View>
          <View style={styles.messageArea}>
            <Text style={styles.activeMessage}>{message}</Text>
          </View>
          {showScale && (
            <View style={styles.scaleRow}>
              {[0,1,2,3,4,5,6,7,8,9,10].map(v => (
                <TouchableOpacity key={v} style={styles.scaleBtn} onPress={() => handleRating(v)}>
                  <Text style={styles.scaleBtnText}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <StyledButton title="Завершить" onPress={handleFinish} variant="secondary" />
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
          </View>
        </View>
      </SafeAreaView>
    </Background>
  );
}

// ---------- Основной экран ----------
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
      if (currentStep < total - 1) setCurrentStep(s => s + 1);
      else setCompleted(true);
    } else {
      if (currentStep < selected.fields.length - 1) setCurrentStep(s => s + 1);
      else setCompleted(true);
    }
  };
  const handlePrev = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };
  const handleAnswer = (text: string) => { const newAnswers = [...answers]; newAnswers[currentStep] = text; setAnswers(newAnswers); };
  const handleClose = () => { setSelected(null); setCurrentStep(0); setAnswers([]); setCompleted(false); };

  useEffect(() => {
    if (params.open) {
      const tech = techniques.find(t => t.id === params.open);
      if (tech) startTechnique(tech);
    }
  }, [params.open]);

  if (selected) {
    if (selected.id === 'surf') {
      return <SurfInteractive onClose={handleClose} />;
    }

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
              {selected.theory && (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>📚 О навыке</Text>
                  <Text style={styles.text}>{selected.theory}</Text>
                </View>
              )}
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

    const total = selected.fields.length;
    return (
      <Background>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={[Fonts.title, { color: colors.text }]}>{selected.title}</Text>
            <Text style={styles.when}>{selected.when}</Text>
            <Text style={styles.desc}>{selected.desc}</Text>
            {selected.theory && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>📚 О навыке</Text>
                <Text style={styles.text}>{selected.theory}</Text>
              </View>
            )}
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

  return (
    <Background>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>Техники</Text>
          <Text style={[Fonts.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg }]}>Инструменты самопомощи</Text>
          <View style={[styles.levelSection, { borderLeftColor: '#4F9F6E' }]}>
            <Text style={[styles.levelTitle, { color: '#4F9F6E' }]}>🟢 Решать (0–40%)</Text>
            {techniques.filter(t => ['surf','cba','disarm','usa','factcheck','opposite','radical','positive'].includes(t.id)).map(tech => (
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
  card: { backgroundColor: '#131E2B', borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: '#1E2D3A' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#C9A84C', marginBottom: 8 },
  text: { fontSize: 15, lineHeight: 22, color: '#D0D9E2', marginBottom: 12 },
  stepTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#D0D9E2' },
  label: { fontSize: 15, marginBottom: 8, color: '#D0D9E2' },
  example: { fontSize: 12, marginBottom: 12, fontStyle: 'italic', color: '#C9A84C' },
  instructionText: { fontSize: 16, lineHeight: 24, marginBottom: 20, color: '#D0D9E2' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, marginTop: 8 },
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
  levelSection: { marginBottom: Spacing.lg, borderLeftWidth: 4, paddingLeft: Spacing.md },
  levelTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  techCard: { backgroundColor: '#131E2B', borderRadius: 12, padding: Spacing.sm, marginBottom: Spacing.sm, borderWidth: 1, borderColor: '#1E2D3A' },
  techCardTitle: { fontSize: 16, fontWeight: '600', color: '#D0D9E2' },
  techCardDesc: { fontSize: 13, color: '#7B8FA1', marginTop: 4 },
  // Серфинг
  surfCard: { padding: Spacing.md },
  surfActiveContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
  circleContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  glowCircle: { width: 150, height: 150, borderRadius: 75, position: 'absolute', opacity: 0.9, shadowColor: '#C9A84C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 40, elevation: 20 },
  glowLayer: { width: 180, height: 180, borderRadius: 90, position: 'absolute', opacity: 0.2, shadowColor: '#C9A84C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 50, elevation: 15 },
  glowLayer2: { width: 220, height: 220, borderRadius: 110, position: 'absolute', opacity: 0.08, shadowColor: '#C9A84C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 60, elevation: 10 },
  messageArea: { paddingHorizontal: Spacing.md, marginBottom: 16, minHeight: 60, justifyContent: 'center' },
  activeMessage: { fontSize: 16, color: '#D0D9E2', textAlign: 'center', lineHeight: 24 },
  scaleRow: { flexDirection: 'row', justifyContent: 'center', gap: 2, paddingHorizontal: 6, marginBottom: 16 },
  scaleBtn: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: '#1E2D3A', backgroundColor: '#131E2B', alignItems: 'center', justifyContent: 'center' },
  scaleBtnText: { fontSize: 12, fontWeight: '600', color: '#D0D9E2' },
  progressBarContainer: { width: '100%', height: 3, backgroundColor: '#1E2D3A', borderRadius: 2, overflow: 'hidden', position: 'absolute', bottom: 0, left: 0, right: 0 },
  progressFill: { height: '100%', backgroundColor: '#C9A84C', borderRadius: 2 },
});
