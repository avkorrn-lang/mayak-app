import React, { useState, useEffect, useRef } from 'react'; import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Vibration, Platform } from 'react-native'; import { SafeAreaView } from 'react-native-safe-area-context'; import StyledButton from '../components/StyledButton'; import Background from '../components/Background'; import { useThemeColors, Fonts, Spacing } from '../theme';

const rituals = [
  { title: 'Медитация на дыхание', desc: 'Сядьте удобно, закройте глаза. Считайте вдохи и выдохи: вдох — раз, выдох — два, и так до 10, затем сначала. Если внимание уходит, мягко возвращайте.' },
  { title: 'Заземление 5-4-3-2-1', desc: 'Назовите 5 вещей, которые видите; 4 — которые ощущаете кожей; 3 — которые слышите; 2 — которые чувствуете запахом; 1 — вкус. Это быстро вернёт в реальность.' },
  { title: 'Техника «Падающая стрела»', desc: 'Представьте худший сценарий. Спросите себя: «Если это случится, что я буду делать?» Повторите несколько раз, пока не дойдёте до реального дна. Обычно оно оказывается не таким страшным.' },
  { title: 'Остановись и переключись (ТРУД)', desc: 'Пошаговая инструкция для быстрого сброса напряжения (DBT).\n\n1. Стоп! — Громко скажите себе «Стоп!» или хлопните в ладоши. Прервите автоматическую реакцию.\n2. Осознайте — Что сейчас происходит? Какая эмоция вас захлестнула? Назовите её.\n3. Сделайте паузу — Умойтесь ледяной водой, выйдите в другую комнату или на свежий воздух. Смените обстановку на 1–2 минуты.\n4. Переключитесь — Займите руки или голову чем‑то нейтральным: посчитайте предметы вокруг, включите музыку, сделайте 10 приседаний.' },
];
const TOTAL_SECONDS = 600;

export default function HarborScreen() {
  const colors = useThemeColors();
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [expandedRitual, setExpandedRitual] = useState<number | null>(null);

  const startTimer = () => {
    setTimerRunning(true);
    setSecondsLeft(TOTAL_SECONDS);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimerRunning(false);
          if (Platform.OS !== 'web') Vibration.vibrate(500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerRunning(false);
    setSecondsLeft(TOTAL_SECONDS);
  };
  const fmt = (sec: number) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <Background>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>Бухта</Text>
          <Text style={[Fonts.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg }]}>Место, где можно безопасно потревожиться или восстановиться</Text>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Таймер тревоги</Text>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>Выделите 10 минут, чтобы осознанно пережить страхи, затем вернитесь к действиям</Text>
            {timerRunning ? (
              <>
                <Text style={[styles.timer, { color: colors.accent }]}>{fmt(secondsLeft)}</Text>
                {secondsLeft === 0 && <Text style={[styles.timeUp, { color: colors.positive }]}>Время вышло. Возвращайтесь к реальности.</Text>}
                <StyledButton title="Остановить" onPress={stopTimer} variant="secondary" />
              </>
            ) : (
              <StyledButton title="Начать 10 минут" onPress={startTimer} />
            )}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ритуалы для восстановления</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>Вы можете использовать эти техники после таймера или отдельно, чтобы быстрее вернуть спокойствие.</Text>
          {rituals.map((r, i) => (
            <TouchableOpacity key={i} style={[styles.ritualCard, { backgroundColor: colors.surface, borderLeftColor: colors.accent }]} onPress={() => setExpandedRitual(expandedRitual === i ? null : i)} activeOpacity={0.7}>
              <Text style={[styles.ritualTitle, { color: colors.text }]}>{r.title}</Text>
              {expandedRitual === i && <Text style={[styles.ritualDesc, { color: colors.textSecondary }]}>{r.desc}</Text>}
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
  card: { borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  hint: { fontSize: 13, marginBottom: Spacing.sm, textAlign: 'center' },
  timer: { fontSize: 56, fontWeight: '700', marginVertical: Spacing.sm, fontVariant: ['tabular-nums'] },
  timeUp: { fontSize: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: Spacing.sm, marginTop: Spacing.sm },
  ritualCard: { borderRadius: 12, padding: Spacing.md, marginBottom: Spacing.sm, borderLeftWidth: 3 },
  ritualTitle: { fontWeight: '600', marginBottom: 4 },
  ritualDesc: { fontSize: 13, marginTop: Spacing.sm },
});
