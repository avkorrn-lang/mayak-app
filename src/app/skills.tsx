import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors, Fonts, Spacing } from '../theme';
import StyledButton from '../components/StyledButton';
import StyledInput from '../components/StyledInput';
import ProgressBar from '../components/ProgressBar';
import Background from '../components/Background';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Lesson {
  id: string;
  title: string;
  theory: string;
  steps: { instruction: string; hint: string }[];
  reflection: string;
}

const MODULES = [
  {
    id: 'awareness',
    title: 'Осознанность и разделение',
    description: 'Научись замечать мысли и не сливаться с ними. Это основа для всех остальных навыков.',
    lessons: [
      {
        id: 'mayak',
        title: 'Я и мои мысли — не одно и то же',
        theory: `Тревожные мысли часто звучат как голос диктора, объявляющего катастрофу. Но мысль — это просто событие в уме, а не приказ к действию и не факт. Разделяя «я» и «мысль», ты возвращаешь себе авторство своей жизни.\n\nКогда ты говоришь «Я боюсь», ты сливаешься со страхом. Когда ты говоришь «Я заметил мысль о страхе», ты становишься наблюдателем. Этот сдвиг активирует префронтальную кору — центр осознанного контроля — и снижает активность миндалевидного тела, отвечающего за реакцию «бей-беги».`,
        steps: [
          {
            instruction: 'Заметь мысль, которая вызывает тревогу.',
            hint: 'Представь, что ты сидишь на берегу реки, а мысли — это проплывающие мимо листья. Ты просто смотришь на них, не прыгая в воду.'
          },
          {
            instruction: 'Скажи себе: «Я заметил мысль: ...»',
            hint: 'Добавление «Я заметил» создаёт дистанцию между тобой и мыслью. Ты — небо, а мысли — облака. Они приходят и уходят, но небо остаётся.'
          },
          {
            instruction: 'Спроси: «Эта мысль — факт или интерпретация?»',
            hint: 'Факт — то, что можно проверить (например, «начальник не ответил на письмо»). Интерпретация — то, что мы додумываем («он считает меня некомпетентным»). Раздели их.'
          },
          {
            instruction: 'Выбери, как ты хочешь на неё ответить.',
            hint: 'Вместо автоматической реакции ты можешь выбрать новую мысль или действие. Например: «Вместо паники я выбираю спокойно уточнить детали».'
          },
        ],
        reflection: 'Как изменилось ощущение, когда ты посмотрел на мысль со стороны? Попробуй практиковать это каждый день в течение недели, записывая по одной мысли с приставкой «Я заметил мысль...»'
      },
    ],
  },
  {
    id: 'distress',
    title: 'Перенесение дистресса',
    description: 'Навыки, чтобы пережить трудный момент, не делая хуже.',
    lessons: [],
  },
  {
    id: 'emotion',
    title: 'Эмоциональная регуляция',
    description: 'Понимание и управление своими эмоциями.',
    lessons: [],
  },
  {
    id: 'interpersonal',
    title: 'Межличностная эффективность',
    description: 'Как строить здоровые отношения и отстаивать свои границы.',
    lessons: [],
  },
];

const SKILL_DIARY_KEY = '@mayak_skill_diary';

interface DiaryEntry {
  date: string;
  selfRating: number; // 1-5
}

interface SkillDiary {
  [skillId: string]: DiaryEntry[];
}

export default function SkillsScreen() {
  const colors = useThemeColors();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonStep, setLessonStep] = useState<'intro' | 'practice' | 'reflection'>('intro');
  const [practiceStep, setPracticeStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [diary, setDiary] = useState<SkillDiary>({});
  const [showDiary, setShowDiary] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SKILL_DIARY_KEY).then(data => {
      if (data) setDiary(JSON.parse(data));
    });
  }, []);

  const saveDiaryEntry = async (skillId: string, rating: number) => {
    const entry: DiaryEntry = { date: new Date().toISOString().slice(0, 10), selfRating: rating };
    const updated = { ...diary };
    if (!updated[skillId]) updated[skillId] = [];
    updated[skillId].push(entry);
    setDiary(updated);
    await AsyncStorage.setItem(SKILL_DIARY_KEY, JSON.stringify(updated));
  };

  const module = MODULES.find(m => m.id === selectedModuleId);

  const startLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setLessonStep('intro');
    setPracticeStep(0);
    setAnswers(new Array(lesson.steps.length).fill(''));
  };

  const handleStartPractice = () => setLessonStep('practice');
  const handleNextPracticeStep = () => {
    if (selectedLesson && practiceStep < selectedLesson.steps.length - 1) {
      setPracticeStep(s => s + 1);
    } else {
      setLessonStep('reflection');
    }
  };
  const handlePrevPracticeStep = () => {
    if (practiceStep > 0) setPracticeStep(s => s - 1);
  };
  const handleAnswer = (text: string) => {
    const newAnswers = [...answers];
    newAnswers[practiceStep] = text;
    setAnswers(newAnswers);
  };
  const handleFinishReflection = (rating: number) => {
    if (selectedLesson) {
      saveDiaryEntry(selectedLesson.id, rating);
    }
    setSelectedLesson(null);
    setLessonStep('intro');
  };

  // Экран просмотра урока
  if (selectedLesson) {
    return (
      <Background>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <TouchableOpacity onPress={() => setSelectedLesson(null)} style={styles.backBtn}>
              <Text style={[styles.backText, { color: colors.accent }]}>← Назад</Text>
            </TouchableOpacity>
            <Text style={[Fonts.title, { color: colors.text }]}>{selectedLesson.title}</Text>

            {lessonStep === 'intro' && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>📚 Теория</Text>
                <Text style={styles.text}>{selectedLesson.theory}</Text>
                <StyledButton title="Перейти к практике" onPress={handleStartPractice} />
              </View>
            )}

            {lessonStep === 'practice' && (
              <View style={styles.card}>
                <ProgressBar step={practiceStep} total={selectedLesson.steps.length} />
                <Text style={styles.stepTitle}>Шаг {practiceStep + 1} из {selectedLesson.steps.length}</Text>
                <Text style={styles.stepText}>{selectedLesson.steps[practiceStep].instruction}</Text>
                <Text style={styles.hintText}>{selectedLesson.steps[practiceStep].hint}</Text>
                <StyledInput
                  value={answers[practiceStep]}
                  onChangeText={handleAnswer}
                  placeholder="Твой ответ..."
                  multiline
                />
                <View style={styles.buttonRow}>
                  <StyledButton title="Назад" onPress={handlePrevPracticeStep} variant="secondary" disabled={practiceStep === 0} />
                  <View style={{ width: 10 }} />
                  <StyledButton title={practiceStep === selectedLesson.steps.length - 1 ? 'Завершить' : 'Дальше'} onPress={handleNextPracticeStep} />
                </View>
              </View>
            )}

            {lessonStep === 'reflection' && (
              <View style={styles.card}>
                <Text style={styles.congrats}>✅ Практика завершена</Text>
                <Text style={styles.text}>{selectedLesson.reflection}</Text>
                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>📝 Дневник навыка</Text>
                <Text style={styles.text}>Насколько хорошо у тебя получилось? (1 — трудно, 5 — отлично)</Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map(r => (
                    <TouchableOpacity key={r} style={[styles.ratingBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleFinishReflection(r)}>
                      <Text style={[styles.ratingText, { color: colors.text }]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={() => setShowDiary(!showDiary)} style={{ marginTop: 16 }}>
                  <Text style={{ color: colors.accent }}>{showDiary ? 'Скрыть дневник' : 'Посмотреть дневник'}</Text>
                </TouchableOpacity>
                {showDiary && (
                  <View style={{ marginTop: 8 }}>
                    {(diary[selectedLesson.id] || []).slice(-5).reverse().map((entry, i) => (
                      <Text key={i} style={{ color: colors.textSecondary }}>{entry.date}: {entry.selfRating}/5</Text>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Background>
    );
  }

  // Экран модуля (список уроков)
  if (module) {
    const completedLessons = module.lessons.filter(l => (diary[l.id] || []).length > 0).length;
    return (
      <Background>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <TouchableOpacity onPress={() => setSelectedModuleId(null)} style={styles.backBtn}>
              <Text style={[styles.backText, { color: colors.accent }]}>← Назад к модулям</Text>
            </TouchableOpacity>
            <Text style={[Fonts.title, { color: colors.text }]}>{module.title}</Text>
            <Text style={[styles.text, { marginBottom: 16 }]}>{module.description}</Text>
            <View style={styles.progressRow}>
              <Text style={[styles.text, { color: colors.accent }]}>Прогресс: {completedLessons} / {module.lessons.length}</Text>
            </View>
            {module.lessons.length === 0 ? (
              <Text style={[styles.text, { textAlign: 'center', marginTop: 40, color: colors.textSecondary }]}>Скоро здесь появятся уроки.</Text>
            ) : (
              module.lessons.map(lesson => {
                const isCompleted = (diary[lesson.id] || []).length > 0;
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[styles.lessonCard, { borderLeftColor: isCompleted ? colors.positive : colors.accent }]}
                    onPress={() => startLesson(lesson)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonStatus}>{isCompleted ? '✅ Пройден' : '📖 Новый'}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Background>
    );
  }

  // Главный список модулей
  return (
    <Background>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>Навыки</Text>
          <Text style={[Fonts.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg }]}>
            Тренировка устойчивости и осознанности
          </Text>
          {MODULES.map(mod => {
            const totalLessons = mod.lessons.length;
            const completed = mod.lessons.filter(l => (diary[l.id] || []).length > 0).length;
            return (
              <TouchableOpacity
                key={mod.id}
                style={styles.moduleCard}
                onPress={() => setSelectedModuleId(mod.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.moduleTitle}>{mod.title}</Text>
                <Text style={styles.moduleDesc}>{mod.description}</Text>
                <Text style={styles.moduleProgress}>
                  {totalLessons > 0 ? `${completed}/${totalLessons} уроков пройдено` : 'Скоро'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.md },
  backBtn: { marginBottom: Spacing.sm },
  backText: { fontSize: 16, fontWeight: '500' },
  card: {
    backgroundColor: '#131E2B',
    borderRadius: 16,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#1E2D3A',
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#C9A84C', marginBottom: 8 },
  text: { fontSize: 15, lineHeight: 22, color: '#D0D9E2', marginBottom: 12 },
  stepTitle: { fontSize: 18, fontWeight: '600', color: '#D0D9E2', marginBottom: 8 },
  stepText: { fontSize: 16, lineHeight: 24, color: '#D0D9E2', marginBottom: 12 },
  hintText: { fontSize: 14, lineHeight: 20, color: '#7B8FA1', fontStyle: 'italic', marginBottom: 16, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#C9A84C' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  congrats: { fontSize: 18, fontWeight: '700', color: '#4F9F6E', marginBottom: 12 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
  ratingBtn: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  ratingText: { fontSize: 20, fontWeight: '600' },
  progressRow: { marginBottom: Spacing.sm },
  lessonCard: {
    backgroundColor: '#131E2B',
    borderRadius: 12,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#1E2D3A',
    borderLeftWidth: 4,
  },
  lessonTitle: { fontSize: 16, fontWeight: '600', color: '#D0D9E2' },
  lessonStatus: { fontSize: 13, color: '#7B8FA1', marginTop: 4 },
  moduleCard: {
    backgroundColor: '#131E2B',
    borderRadius: 12,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#1E2D3A',
  },
  moduleTitle: { fontSize: 18, fontWeight: '600', color: '#D0D9E2' },
  moduleDesc: { fontSize: 14, color: '#7B8FA1', marginTop: 4 },
  moduleProgress: { fontSize: 13, color: '#C9A84C', marginTop: 8 },
});
