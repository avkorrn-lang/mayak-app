import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors, Fonts, Spacing } from '../theme';
import StyledButton from '../components/StyledButton';
import StyledInput from '../components/StyledInput';
import ProgressBar from '../components/ProgressBar';
import Background from '../components/Background';

// Типы для модулей и уроков
interface Lesson {
  id: string;
  title: string;
  theory: string;
  steps: string[];
  reflection: string;
}

const MODULES = [
  {
    id: 'awareness',
    title: 'Осознанность и разделение',
    lessons: [
      {
        id: 'mayak',
        title: 'Я и мои мысли — не одно и то же',
        theory: `Тревожные мысли часто звучат как голос диктора, объявляющего катастрофу. Но мысль — это просто событие в уме, а не приказ к действию и не факт. Разделяя «я» и «мысль», ты возвращаешь себе авторство своей жизни.\n\nКогда ты говоришь «Я боюсь», ты сливаешься со страхом. Когда ты говоришь «Я заметил мысль о страхе», ты становишься наблюдателем. Этот сдвиг активирует префронтальную кору — центр осознанного контроля — и снижает активность миндалевидного тела, отвечающего за реакцию «бей-беги».`,
        steps: [
          'Заметь мысль, которая вызывает тревогу.',
          'Скажи себе: «Я заметил мысль: ...»',
          'Спроси: «Эта мысль — факт или интерпретация?»',
          'Выбери, как ты хочешь на неё ответить.',
        ],
        reflection: 'Как изменилось ощущение, когда ты посмотрел на мысль со стороны? Попробуй практиковать это каждый день, и ты заметишь, что мысли теряют свою хватку.',
      },
    ],
  },
  {
    id: 'distress',
    title: 'Перенесение дистресса',
    lessons: [], // будет дополнено
  },
  {
    id: 'emotion',
    title: 'Эмоциональная регуляция',
    lessons: [],
  },
  {
    id: 'interpersonal',
    title: 'Межличностная эффективность',
    lessons: [],
  },
];

export default function SkillsScreen() {
  const colors = useThemeColors();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [practiceStep, setPracticeStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '']);
  const [practiceDone, setPracticeDone] = useState(false);

  const module = MODULES.find(m => m.id === selectedModule);

  const startLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setPracticeStep(0);
    setAnswers(['', '', '', '']);
    setPracticeDone(false);
  };

  const handleNextStep = () => {
    if (selectedLesson && practiceStep < selectedLesson.steps.length - 1) {
      setPracticeStep(s => s + 1);
    } else {
      setPracticeDone(true);
    }
  };

  const handlePrevStep = () => {
    if (practiceStep > 0) setPracticeStep(s => s - 1);
  };

  const handleAnswer = (text: string) => {
    const newAnswers = [...answers];
    newAnswers[practiceStep] = text;
    setAnswers(newAnswers);
  };

  const handleCloseLesson = () => {
    setSelectedLesson(null);
    setPracticeDone(false);
    setPracticeStep(0);
  };

  // Если просматриваем урок
  if (selectedLesson) {
    return (
      <Background>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={[Fonts.title, { color: colors.text, marginBottom: Spacing.sm }]}>{selectedLesson.title}</Text>

            {practiceDone ? (
              <View style={styles.card}>
                <Text style={styles.congrats}>✅ Практика завершена</Text>
                <Text style={styles.reflection}>{selectedLesson.reflection}</Text>
                <StyledButton title="Понятно" onPress={handleCloseLesson} />
              </View>
            ) : (
              <>
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>📚 Почему это важно</Text>
                  <Text style={styles.text}>{selectedLesson.theory}</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>🧠 Техника</Text>
                  <ProgressBar step={practiceStep} total={selectedLesson.steps.length} />
                  <Text style={styles.stepTitle}>Шаг {practiceStep + 1} из {selectedLesson.steps.length}</Text>
                  <Text style={styles.stepText}>{selectedLesson.steps[practiceStep]}</Text>
                  <StyledInput
                    value={answers[practiceStep]}
                    onChangeText={handleAnswer}
                    placeholder="Твой ответ..."
                    multiline
                  />
                  <View style={styles.buttonRow}>
                    <StyledButton title="Назад" onPress={handlePrevStep} variant="secondary" disabled={practiceStep === 0} />
                    <View style={{ width: 10 }} />
                    <StyledButton title={practiceStep === selectedLesson.steps.length - 1 ? 'Завершить' : 'Дальше'} onPress={handleNextStep} />
                  </View>
                  <TouchableOpacity onPress={handleCloseLesson} style={styles.closeBtn}>
                    <Text style={styles.closeText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Background>
    );
  }

  // Если выбрали модуль, показываем список уроков
  if (module) {
    return (
      <Background>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <TouchableOpacity onPress={() => setSelectedModule(null)} style={styles.backBtn}>
              <Text style={[styles.backText, { color: colors.accent }]}>← Назад к модулям</Text>
            </TouchableOpacity>
            <Text style={[Fonts.title, { color: colors.text, marginBottom: Spacing.sm }]}>{module.title}</Text>
            {module.lessons.length === 0 ? (
              <Text style={[styles.text, { color: colors.textSecondary, textAlign: 'center', marginTop: 40 }]}>Скоро здесь появятся уроки.</Text>
            ) : (
              module.lessons.map(lesson => (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.lessonCard}
                  onPress={() => startLesson(lesson)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDesc}>Урок с теорией и практикой</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Background>
    );
  }

  // Главный экран Навыков – список модулей
  return (
    <Background>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>Навыки</Text>
          <Text style={[Fonts.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg }]}>
            Тренировка устойчивости и осознанности
          </Text>
          {MODULES.map(mod => (
            <TouchableOpacity
              key={mod.id}
              style={styles.moduleCard}
              onPress={() => setSelectedModule(mod.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.moduleTitle}>{mod.title}</Text>
              <Text style={styles.moduleProgress}>
                {mod.lessons.length > 0 ? `${mod.lessons.length} уроков` : 'Скоро'}
              </Text>
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
  card: {
    backgroundColor: '#131E2B',
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#1E2D3A',
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#C9A84C', marginBottom: 8 },
  text: { fontSize: 15, lineHeight: 22, color: '#D0D9E2' },
  stepTitle: { fontSize: 18, fontWeight: '600', color: '#D0D9E2', marginBottom: 8 },
  stepText: { fontSize: 15, lineHeight: 22, color: '#D0D9E2', marginBottom: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  closeBtn: { alignItems: 'center', marginTop: 8 },
  closeText: { fontSize: 14, color: '#7B8FA1' },
  congrats: { fontSize: 18, fontWeight: '700', color: '#4F9F6E', marginBottom: 12 },
  reflection: { fontSize: 15, lineHeight: 22, color: '#D0D9E2', fontStyle: 'italic', marginBottom: 16 },
  moduleCard: {
    backgroundColor: '#131E2B',
    borderRadius: 12,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#1E2D3A',
  },
  moduleTitle: { fontSize: 18, fontWeight: '600', color: '#D0D9E2' },
  moduleProgress: { fontSize: 13, color: '#7B8FA1', marginTop: 4 },
  lessonCard: {
    backgroundColor: '#131E2B',
    borderRadius: 12,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#1E2D3A',
  },
  lessonTitle: { fontSize: 16, fontWeight: '600', color: '#D0D9E2' },
  lessonDesc: { fontSize: 13, color: '#7B8FA1', marginTop: 4 },
  backBtn: { marginBottom: Spacing.sm },
  backText: { fontSize: 16, fontWeight: '500' },
});
