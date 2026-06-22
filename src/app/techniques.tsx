import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, LayoutChangeEvent, Vibration, Platform } from 'react-native';
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
    when: 'Сильные переживания, которые хочется подавить или от которых хочется убежать.',
    desc: 'Наблюдайте за своей эмоцией как за волной — не борясь и не убегая. Вы увидите, как она меняется и утихает.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
  },
  {
    id: 'cba', title: '⚖️ Анализ выгод и издержек',
    when: 'Когда стоите перед трудным выбором или сомневаетесь в решении.',
    desc: 'Взвесьте все «за» и «против», чтобы увидеть реальные последствия и принять осознанное решение.',
    fields: ['Что именно вы решаете?', 'Краткосрочные выгоды', 'Краткосрочные издержки', 'Долгосрочные выгоды', 'Долгосрочные издержки'],
    examples: ['Например: желание закурить', 'Кратковременное расслабление, снижение стресса', 'Неприятный запах, кашель, трата денег', 'Избавление от вредной привычки, улучшение здоровья', 'Риск развития зависимости, проблемы с лёгкими'],
    finalMessage: 'Теперь вы видите полную картину. Какое решение кажется более взвешенным?',
    type: 'input',
    theory: 'Взвешивание плюсов и минусов помогает выйти из автоматического режима и увидеть, что стоит за вашим выбором. Это не про «правильно» или «неправильно», а про честный взгляд на последствия.',
  },
  {
    id: 'disarm', title: '🛡️ ОСАДДА деструктивных образов (DISARM)',
    when: 'Когда в голове крутятся пугающие картинки или катастрофические сценарии.',
    desc: 'Научитесь противостоять навязчивым образам, рассматривая их как навязчивую рекламу, которую вы не обязаны покупать.',
    fields: ['Опишите навязчивый образ.', 'Какие чувства он вызывает?', 'Представьте, что этот образ — просто навязчивая реклама. Хотите ли вы её «купить»?', 'Чем заменить этот образ? Придумайте позитивную альтернативу.'],
    examples: ['Например: картинка, как я кричу на близких', 'Страх, стыд, злость', 'Это всего лишь старая запись в моей голове, а не реальность', 'Я представляю, как спокойно обсуждаю проблему и нахожу решение'],
    finalMessage: 'Вы осознали, что образ — лишь мысленная конструкция. Вы можете выбирать, на что направлять внимание.',
    type: 'input',
    theory: 'Наш мозг иногда прокручивает пугающие «фильмы», которые кажутся очень реальными. Техника DISARM помогает «разоружить» эти образы, отделяя факты от фантазий.',
  },
  {
    id: 'usa', title: '💖 Безусловное самопринятие',
    when: 'Когда вы ругаете себя, чувствуете вину или стыд.',
    desc: 'Отделите свои поступки от своей ценности как человека. Вы — не ваши ошибки.',
    fields: ['За что я себя сейчас осуждаю?', 'Какие качества или поступки вызывают стыд?', 'Могу ли я отделить поступки от своей ценности как человека?', 'Сформулируйте утверждение: «Я принимаю себя полностью, даже если...»'],
    examples: ['Например: за прокрастинацию', 'Считаю себя ленивым', 'Лень — поведение, а не свойство личности', '«Я принимаю себя полностью, даже если иногда прокрастинирую. Моя ценность неизменна»'],
    finalMessage: 'Принятие себя не означает одобрение всех поступков. Это фундамент, на котором строятся изменения.',
    type: 'input',
    theory: 'Безусловное самопринятие — это признание своей ценности вне зависимости от достижений или ошибок. Это не снимает ответственности, но убирает разрушительное чувство вины.',
  },
  {
    id: 'factcheck', title: '🔍 Проверка фактов',
    when: 'Когда тревожные мысли кажутся непреложной истиной.',
    desc: 'Шесть вопросов, которые помогут отделить реальность от пугающих интерпретаций.',
    fields: [
      'Какая мысль вызывает у вас тревогу?',
      'Какое событие её запустило? (только факты)',
      'Какие интерпретации и предположения вы добавляете?',
      'Воспринимаете ли вы это как угрозу? Оцените реальную вероятность.',
      'Что самое худшее может произойти? Как вы справитесь?',
      'Соответствует ли сила вашей тревоги реальным фактам?'
    ],
    examples: ['Например: «Я провалю экзамен и моя жизнь кончена»', 'Я получил сложный билет', '«Я никогда не сдам», «Я хуже всех»', 'Угроза провала, но реальная вероятность — 30%', 'Даже если провалю, пересдам через месяц или найду другой путь', 'Тревога сильно завышена, факты не подтверждают катастрофу'],
    finalMessage: 'Отделяя факты от домыслов, вы возвращаете себе ясность. Тревога теряет свою хватку, когда видит реальность.',
    type: 'input',
    theory: 'Наш мозг часто путает мысли с фактами. Проверка фактов — это навык детектива: мы собираем улики, чтобы понять, что происходит на самом деле.',
  },
  {
    id: 'opposite', title: '↔️ Противоположное действие',
    when: 'Когда эмоция подталкивает вас к неэффективному поведению.',
    desc: 'Семь шагов, чтобы пойти против нездорового импульса и научить мозг новым реакциям.',
    fields: [
      'Назовите эмоцию, которая вами движет.',
      'Проверьте факты: соответствует ли эмоция реальности?',
      'Опишите, что вам хочется сделать под влиянием эмоции.',
      'Обратитесь к Мудрому разуму: эффективно ли это действие?',
      'Какое противоположное действие вы можете выбрать?',
      'Действуйте противоположно во всех отношениях (поза, слова, поступки).',
      'Продолжайте, пока эмоция не начнёт меняться.'
    ],
    examples: ['Например: страх', 'Факты не подтверждают реальную опасность', 'Хочется избежать встречи', 'Избегание не решит проблему, а только усилит страх', 'Пойти на встречу, заранее подготовившись', 'Одеться уверенно, говорить спокойно, держать открытую позу', 'После нескольких таких действий страх уменьшится'],
    finalMessage: 'Действуя наперекор нездоровой эмоции, вы учите мозг: «Я могу справляться иначе».',
    type: 'input',
    theory: 'Эмоции часто подталкивают нас к привычным, но неэффективным действиям. Противоположное действие — это осознанный выбор в пользу здоровья, даже когда страшно или стыдно.',
  },
  {
    id: 'radical', title: '🌱 Радикальное принятие',
    when: 'Когда вы столкнулись с реальностью, которую невозможно изменить прямо сейчас.',
    desc: 'Полное принятие ситуации без борьбы и отрицания. Это не одобрение, а отправная точка.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'Борьба с реальностью отнимает силы. Радикальное принятие — это смелость признать: «Да, сейчас так. Что я могу сделать дальше?»',
  },
  {
    id: 'senses', title: '🖐️ Самоуспокоение через пять чувств',
    when: 'Когда нужно быстро успокоиться и вернуть контроль.',
    desc: 'Мягко переключите внимание на приятные ощущения, задействуя все органы чувств.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'Фокусировка на органах чувств возвращает нас в настоящий момент и снижает активность тревожных центров мозга.',
  },
  {
    id: 'improve', title: '🌈 Улучшение момента',
    when: 'Когда тяжело пережить текущую ситуацию и нужно немного облегчения.',
    desc: 'Несколько бережных техник, которые помогут смягчить остроту переживаний.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'Иногда мы не можем изменить обстоятельства, но можем изменить своё состояние в моменте. Эти микро-практики — ваш якорь.',
  },
  {
    id: 'distract', title: '🎯 Отвлечение',
    when: 'Когда эмоции захлёстывают и нужно безопасно переключиться.',
    desc: 'Способы временно отвлечься от болезненных переживаний, чтобы снизить накал.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'Отвлечение — не бегство, а разумная пауза. Дайте мозгу время остыть, чтобы потом вернуться к ситуации более ясно.',
  },
  {
    id: 'halfsmile', title: '🙂 Полуулыбка и открытые ладони',
    when: 'Когда в теле чувствуется напряжение и сопротивление.',
    desc: 'Телесная практика, которая посылает сигнал безопасности вашему мозгу.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'Наше тело и разум связаны. Расслабленное лицо и открытые ладони говорят мозгу: «Я в безопасности», даже если эмоции говорят об обратном.',
  },
  {
    id: 'stop', title: '🛑 STOP',
    when: 'В острый кризисный момент, когда вы готовы сорваться.',
    desc: 'Быстрый навык, чтобы остановить автоматическую реакцию и вернуть контроль.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'В критической ситуации наше тело реагирует мгновенно. STOP — это экстренный тормоз, который даёт вам пару секунд, чтобы выбрать действие осознанно.',
  },
  {
    id: 'trud', title: '⚡ ТРУД',
    when: 'Очень сильные эмоции, требующие срочного телесного сброса.',
    desc: 'Измените химию тела за несколько минут с помощью простых физических действий.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'Сильные эмоции — это химические реакции в теле. ТРУД помогает быстро их нейтрализовать через температуру, напряжение и дыхание.',
  },
  {
    id: 'positive', title: '🌞 Накопление положительных эмоций',
    when: 'Хотите улучшить настроение и укрепить психологическую устойчивость.',
    desc: 'Создавайте запас приятных переживаний, чтобы опираться на них в трудные времена.',
    fields: [], examples: [], finalMessage: '',
    type: 'instruction',
    theory: 'Позитивные эмоции — не просто приятный бонус. Они расширяют наше мышление и помогают восстанавливаться после стресса.',
  },
];

const instructions: Record<string, { steps: string[]; final: string }> = {
  radical: {
    steps: [
      '1. Наблюдайте со стороны, как вы боретесь с реальностью. Представьте, что вы смотрите на себя со стороны.',
      '2. Вспомните, что реальность неприятна, но она такая, какая есть. Не нужно её оправдывать — просто признайте.',
      '3. Напомните, что у реальности есть причины. Проследите цепочку событий, которые привели к этой ситуации.',
      '4. Практикуйте целостное принятие: умом, телом и сознанием. Как бы вы дышали, если бы приняли это?',
      '5. Составьте список действий, которые вы бы делали, если бы уже приняли неприемлемое.',
      '6. Обратите внимание на ощущения своего тела. Где живёт сопротивление?',
      '7. Позвольте себе испытать естественное огорчение, чтобы отпустить. Грусть — это нормально.',
      '8. Вспомните, что жизнь стоит того, чтобы жить, даже если в ней есть боль.',
      '9. Взвесьте все «за» и «против»: помогает ли вам борьба или пора начать практиковать принятие?',
    ],
    final: 'Принятие не означает одобрение. Это первый шаг к изменениям, которые вы можете сделать.'
  },
  senses: {
    steps: [
      '👁️ **Зрение.** Найдите глазами что-то приятное: фотографию близкого, цветок на окне, красивый узор. Внимательно рассмотрите детали, цвет, форму. Заметьте, как это вас немного отпускает.',
      '👂 **Слух.** Включите любимую музыку, послушайте пение птиц или просто тишину. Обратите внимание на ритм, громкость, тембр.',
      '👃 **Обоняние.** Вдохните приятный запах: кофе, эфирное масло, свежий воздух. Какой аромат вызывает у вас чувство уюта?',
      '👅 **Вкус.** Попробуйте что-то вкусное, но не торопитесь. Почувствуйте текстуру, температуру, послевкусие.',
      '🤚 **Осязание.** Прикоснитесь к мягкой ткани, погладьте домашнее животное, умойтесь прохладной водой. Какие ощущения на коже?',
    ],
    final: 'Вы переключили внимание на приятные ощущения и вернулись в настоящий момент.'
  },
  improve: {
    steps: [
      '🌈 **Воображение.** Представьте безопасное место, где вам хорошо. Это может быть реальное место или вымышленное. Что вы там видите, слышите, чувствуете?',
      '🔍 **Смысл.** Найдите в текущей ситуации хотя бы маленький урок или возможность. Чему она учит вас?',
      '😌 **Релаксация.** Сделайте глубокий вдох на 4 счёта и медленный выдох на 6 счетов. Повторите 3–4 раза, расслабляя плечи.',
      '⏸️ **Короткий отпуск.** Разрешите себе паузу на 1–2 минуты, ничего не делая. Просто посидите в тишине.',
      '💬 **Самоободрение.** Скажите себе что-то поддерживающее: «Я справлюсь», «Это временное чувство», «Я в безопасности».',
    ],
    final: 'Даже несколько минут такой передышки могут изменить ваше состояние.'
  },
  distract: {
    steps: [
      '🏃 **Деятельность.** Займитесь чем-то активным: быстрая прогулка, уборка, танцы под музыку. Движение сжигает гормоны стресса.',
      '🤝 **Помощь другим.** Позвоните другу, предложите помощь или просто выслушайте. Смещение фокуса с себя на других помогает.',
      '📊 **Сравнение.** Вспомните, как вы справлялись с похожими ситуациями раньше. Вы уже переживали трудности, вы сильнее, чем кажется.',
      '😲 **Эмоции противоположной направленности.** Посмотрите комедию, смешное видео или почитайте анекдоты. Смех — отличный антидот.',
      '🔀 **Выход из ситуации.** Смените обстановку: выйдите в другую комнату или на свежий воздух. Иногда достаточно просто встать.',
      '💭 **Другие мысли.** Посчитайте предметы вокруг одного цвета, вспомните стихотворение или таблицу умножения.',
      '⚡ **Сильные ощущения.** Примите контрастный душ, сожмите в руке кубик льда или резиновый мячик.',
    ],
    final: 'Отвлекаясь безопасно, вы даёте эмоциям время утихнуть. Теперь можно вернуться к ситуации более спокойно.'
  },
  halfsmile: {
    steps: [
      '1. **Расслабьте мышцы лица.** Почувствуйте, как напряжение уходит со лба, щёк, челюсти.',
      '2. **Поднимите уголки губ** легко вверх, почти незаметно для окружающих. Не нужно улыбаться через силу — достаточно лёгкого движения.',
      '3. **Сделайте умиротворённое выражение.** Представьте, что вы смотрите на спокойное море или любимого человека.',
      '4. **Разверните ладони наружу**, большими пальцами от себя. Жест открытости и принятия.',
      '5. **Если сидите, положите ладони на колени.** Расслабьте руки. Почувствуйте, как тело сигналит мозгу: «Всё в порядке».',
    ],
    final: 'Тело подаёт сигнал мозгу: «Я в безопасности». Эмоции следуют за телом, а не наоборот.'
  },
  stop: {
    steps: [
      '🛑 **Стоп!** Замрите буквально на секунду. Не реагируйте. Скажите себе мысленно «Стоп».',
      '⬅️ **Шаг назад.** Сделайте паузу, отстранитесь от ситуации. Представьте, что вы делаете шаг в сторону и смотрите на происходящее со стороны.',
      '👀 **Наблюдайте.** Обратите внимание на то, что вас окружает прямо сейчас: пять вещей, которые видите, четыре — которые слышите.',
      '✅ **Продолжайте осознанно.** Примите мудрое или эффективное решение. Что будет лучше для вас в долгосрочной перспективе?',
    ],
    final: 'Вы вернули контроль. Автоматическая реакция остановлена, теперь вы выбираете действие.'
  },
  trud: {
    steps: [
      '🌡️ **Температурный контраст.** Умойтесь холодной водой или приложите лёд к запястьям на 30 секунд. Это запускает «нырятельный рефлекс», замедляющий сердцебиение.',
      '😌 **Расслабление.** Сильно напрягите все мышцы тела на 5 секунд, а затем резко расслабьте. Повторите 2–3 раза. Почувствуйте разницу.',
      '🏃 **Упражнения.** Сделайте 15–20 интенсивных приседаний, побегайте на месте или попрыгайте. Сожгите кортизол.',
      '🌬️ **Дыхание.** Медленный выдох через рот (как через соломинку), затем спокойный вдох носом. Повторите 5–6 раз.',
    ],
    final: 'Вы сбросили острое напряжение через тело. Теперь можно думать яснее.'
  },
  positive: {
    steps: [
      '1. **Создайте список приятных дел.** Вспомните, что приносит вам радость: чашка любимого чая, прогулка, звонок другу. Запишите не менее 5 пунктов.',
      '2. **Вовлекайтесь полностью.** Выберите одно дело и сделайте его с полным вниманием, замечая все приятные ощущения.',
      '3. **Фиксируйте позитивные события.** Вечером вспомните 3 приятных момента за день, даже самых маленьких.',
      '4. **Не обесценивайте.** Когда позитивное событие заканчивается, просто поблагодарите его, не думая, что «вы этого не заслужили».',
      '5. **Действуйте в направлении ценностей.** Подумайте, что для вас важно, и сделайте маленький шаг уже сегодня.',
    ],
    final: 'Накопление положительных эмоций укрепляет вашу внутреннюю опору. Это навык, который тренируется.'
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
  { time: 0, message: 'Назовите эмоцию одним словом. Произнесите вслух или про себя: «Я чувствую...» и оцените её интенсивность на шкале.', showScale: true },
  { time: 15, message: 'Где в теле это ощущается? Какая форма, размер, температура? Оцените интенсивность.', showScale: true },
  { time: 45, message: 'Дышите. Вдох — выдох. Не пытайтесь изменить ощущение, просто наблюдайте за ним, как серфингист за волной. Периодически оценивайте интенсивность.', showScale: true },
  { time: 75, message: 'Скажите мысленно: «Я разрешаю этому быть». Не боритесь, не отвлекайтесь, не ищите причин. Оцените интенсивность.', showScale: true },
  { time: 120, message: 'Заметьте: стало легче? Возможно, волна уже пошла на спад? Продолжайте наблюдать.', showScale: true },
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
          if (Platform.OS !== 'web') Vibration.vibrate(500);
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
          if (Platform.OS !== 'web') Vibration.vibrate(500);
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
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={[Fonts.title, { color: colors.text, marginBottom: 24, textAlign: 'center' }]}>🌊 Серфинг эмоций</Text>
            <View style={styles.card}>
              <Text style={styles.text}>
                Эмоция — как волна: она нарастает, достигает пика и спадает. Бороться — утонуть, бежать — не успеть. Ваша задача — удержаться на гребне, наблюдая.{'\n\n'}
                Запомните: интенсивная эмоция длится не более 1–2 минут, если не подпитывать её мыслями. Вы не обязаны действовать, вы можете просто пережить её.
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.text}>
                Как делать:{'\n'}
                • Назовите эмоцию (страх, стыд, злость, отчаяние — конкретно).{'\n'}
                • Найдите её в теле (где? форма? размер? движение?).{'\n'}
                • Дышите ровно и просто следите за ощущениями.{'\n'}
                • Разрешите волне быть («Я позволяю этому быть столько, сколько нужно»).{'\n'}
                • Замечайте, как меняется интенсивность.
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.text}>
                Нажмите «Начать» — программа будет давать подсказки с определённым интервалом. Длительность практики — 3 минуты.
              </Text>
            </View>
            <StyledButton title="Начать" onPress={handleStart} />
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
            <View style={styles.card}>
              <Text style={styles.text}>
                Вы только что прошли через эмоциональную волну, не сломавшись и не сбежав. Запомните это ощущение — вы можете чувствовать сильно и оставаться в безопасности. Эмоция прошла, а вы остались.
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.text}>
                Теперь, когда пик позади, вы можете принять решение не из паники, а из ясности.
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.text}>
                Если нужно — сделайте паузу, выпейте воды, вернитесь к реальности.{'\n\n'}
                Вы сильнее своей эмоции. Всегда.
              </Text>
            </View>
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
              <Text style={[Fonts.title, { color: colors.text, marginBottom: 16, textAlign: 'center' }]}>{selected.title}</Text>
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
                  {instr.steps.map((step, idx) => (
                    <Text key={idx} style={styles.instructionText}>{step}</Text>
                  ))}
                  <Text style={styles.finalMessage}>{instr.final}</Text>
                  <StyledButton title="Понятно" onPress={handleClose} />
                </View>
              ) : (
                <View style={styles.card}>
                  <Text style={styles.stepTitle}>Шаг {currentStep + 1} из {total}</Text>
                  <Text style={styles.instructionText}>{instr.steps[currentStep]}</Text>
                  <View style={styles.buttonRow}>
                    {currentStep > 0 && <StyledButton title="Назад" onPress={handlePrev} variant="secondary" />}
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
            <Text style={[Fonts.title, { color: colors.text, marginBottom: 16, textAlign: 'center' }]}>{selected.title}</Text>
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
                  {currentStep > 0 && <StyledButton title="Назад" onPress={handlePrev} variant="secondary" />}
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
          <Text style={[Fonts.title, { color: colors.text, textAlign: 'center', marginBottom: 12 }]}>Техники</Text>
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
  when: { fontSize: 14, marginBottom: 16, fontStyle: 'italic', textAlign: 'center', color: '#7B8FA1' },
  desc: { fontSize: 15, textAlign: 'center', marginBottom: 20, color: '#D0D9E2', lineHeight: 22 },
  card: { backgroundColor: '#131E2B', borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: '#1E2D3A' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#C9A84C', marginBottom: 8 },
  text: { fontSize: 15, lineHeight: 22, color: '#D0D9E2', marginBottom: 12 },
  stepTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#D0D9E2' },
  label: { fontSize: 15, marginBottom: 8, color: '#D0D9E2' },
  example: { fontSize: 12, marginBottom: 12, fontStyle: 'italic', color: '#C9A84C' },
  instructionText: { fontSize: 15, lineHeight: 22, marginBottom: 16, color: '#D0D9E2' },
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
  techCardTitle: { fontSize: 16, fontWeight: '600', color: '#D0D9E2', marginBottom: 4 },
  techCardDesc: { fontSize: 13, color: '#7B8FA1' },
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
