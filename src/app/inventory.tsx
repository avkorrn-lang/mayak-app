import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StyledButton from '../components/StyledButton';
import ProgressBar from '../components/ProgressBar';
import Background from '../components/Background';
import { useThemeColors, Fonts, Spacing } from '../theme';

const TOTAL_STEPS = 6;
const STEP_LABELS = ['Событие', 'Мысль', 'Реакция', 'Убеждение', 'Проверка', 'Новый взгляд'];
const LEVELS = ['0','1','2','3','4','5','6','7','8','9','10'];

export default function InventoryScreen() {
  const colors = useThemeColors();
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<string[]>(new Array(TOTAL_STEPS).fill(''));
  const [emotionBefore, setEmotionBefore] = useState<number | null>(null);
  const [emotionAfter, setEmotionAfter] = useState<number | null>(null);
  const [dParts, setDParts] = useState<string[]>(['','','']);
  const [dAssembled, setDAssembled] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const next = () => {
    if (step === 5 && !dAssembled) {
      const assembled = dParts.filter(p => p.trim()).map((p, i) => {
        const labels = ['Доказательства ЗА','Доказательства ПРОТИВ','Что сказал бы другу'];
        return `${labels[i]}: ${p.trim()}`;
      }).join('\n\n');
      setDAssembled(assembled);
      const a = [...answers];
      a[4] = assembled;
      setAnswers(a);
    }
    if (step === TOTAL_STEPS) {
      setStep(7);
      return;
    }
    setStep(s => s + 1);
  };
  const prev = () => {
    if (step === 7) { setStep(TOTAL_STEPS); return; }
    setStep(s => Math.max(s - 1, 1));
  };
  const finish = () => { setDone(true); setSessionCount(c => c + 1); };
  const reset = () => {
    setStep(1);
    setAnswers(new Array(TOTAL_STEPS).fill(''));
    setDParts(['','','']);
    setDAssembled(null);
    setEmotionBefore(null);
    setEmotionAfter(null);
    setDone(false);
  };

  const renderLevelSelector = (level: number | null, onSelect: (v: number) => void) => (
    <View style={styles.levelRow}>
      {LEVELS.map(l => {
        const val = parseInt(l);
        const selected = level === val;
        return (
          <TouchableOpacity key={l} style={[styles.levelBtn, selected && styles.levelBtnActive]} onPress={() => onSelect(val)}>
            <Text style={[styles.levelText, selected && styles.levelTextActive]}>{l}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderPreviousAnswers = () => {
    if (step <= 1) return null;
    const prevSteps = step === 7 ? TOTAL_STEPS : step - 1;
    return (
      <View style={[styles.prevBox, { backgroundColor: colors.background }]}>
        {STEP_LABELS.slice(0, prevSteps).map((label, i) => (
          <View key={i} style={styles.prevItem}>
            <Text style={[styles.prevLabel, { color: colors.accent }]}>{label}:</Text>
            <Text style={{ color: colors.textSecondary, flex: 1 }}>{answers[i] || '—'}</Text>
          </View>
        ))}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: Spacing.md, flexGrow: 1 },
    card: { backgroundColor: colors.surface, borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: colors.border },
    stepTitle: { color: colors.text, fontSize: 20, fontWeight: '600', marginBottom: 4 },
    hint: { color: colors.textSecondary, fontSize: 14, marginBottom: 8 },
    example: { color: colors.accent, fontSize: 13, marginBottom: 12, fontStyle: 'italic' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    levelRow: { flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 8 },
    levelBtn: { width: 28, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
    levelBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    levelText: { color: colors.textSecondary, fontSize: 12 },
    levelTextActive: { color: colors.background, fontWeight: '600' },
    dBlock: { marginBottom: 12 },
    dLabel: { color: colors.text, fontWeight: '500', marginBottom: 4 },
    input: { backgroundColor: colors.background, borderRadius: 12, padding: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, fontSize: 15, marginBottom: 12 },
    prevBox: { borderRadius: 8, padding: 8, marginBottom: 12 },
    prevItem: { flexDirection: 'row', marginBottom: 4 },
    prevLabel: { fontWeight: '600', marginRight: 6 },
    delta: { color: colors.text, fontSize: 17, fontWeight: '600', marginTop: 8, marginBottom: 8 },
    reflection: { color: colors.textSecondary, fontSize: 14, marginTop: Spacing.sm, fontStyle: 'italic', marginBottom: Spacing.sm },
    introCard: { backgroundColor: colors.surface, borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: colors.border },
    introTitle: { color: colors.text, fontSize: 20, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
    introText: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 12 },
  });

  // Введение
  if (showIntro) {
    return (
      <Background>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>АБЦ анализ</Text>
            <View style={styles.introCard}>
              <Text style={styles.introTitle}>Что такое АБЦ анализ?</Text>
              <Text style={styles.introText}>
                АБЦ анализ — это техника когнитивной терапии, которая помогает отделить факты от эмоций и найти убеждения, стоящие за тревогой или гневом.{'\n\n'}
                Она состоит из шести шагов (ABCDE):{'\n'}
                • <Text style={{ fontWeight: '600', color: colors.accent }}>Событие</Text> — один конкретный факт без оценок.{'\n'}
                • <Text style={{ fontWeight: '600', color: colors.accent }}>Мысль</Text> — что пронеслось в голове в тот момент.{'\n'}
                • <Text style={{ fontWeight: '600', color: colors.accent }}>Реакция</Text> — эмоция, телесные ощущения, импульс.{'\n'}
                • <Text style={{ fontWeight: '600', color: colors.accent }}>Убеждение</Text> — глубинное правило или долженствование.{'\n'}
                • <Text style={{ fontWeight: '600', color: colors.accent }}>Проверка</Text> — сбор доказательств за и против убеждения.{'\n'}
                • <Text style={{ fontWeight: '600', color: colors.accent }}>Новый взгляд</Text> — замена жёсткой формулировки на гибкую.{'\n\n'}
                После заполнения вы оцените уровень эмоции до и после — это покажет, насколько анализ помог снизить накал.
              </Text>
              <StyledButton title="Понятно, приступим" onPress={() => setShowIntro(false)} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Background>
    );
  }

  // Завершено
  if (done) {
    const delta = (emotionBefore ?? 0) - (emotionAfter ?? 0);
    let comparisonText = `Было ${emotionBefore ?? 0} → стало ${emotionAfter ?? 0}. `;
    if (delta > 0) comparisonText += `Накал снизился на ${delta} пункта.`;
    else if (delta === 0) comparisonText += `Уровень не изменился, но само осознание уже шаг.`;
    else comparisonText += `Эмоция усилилась — это бывает, когда мы соприкасаемся с трудным.`;
    return (
      <Background>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>АБЦ анализ завершён</Text>
            <View style={styles.card}>
              {STEP_LABELS.map((label, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text style={[styles.prevLabel, { color: colors.accent }]}>{label}:</Text>
                  <Text style={{ color: colors.text }}>{answers[i] || '—'}</Text>
                </View>
              ))}
              <Text style={styles.delta}>{comparisonText}</Text>
              <Text style={styles.reflection}>
                Вы заменили жёсткое убеждение на гибкое. Чтобы закрепить его, в течение дня при появлении старой мысли сознательно напоминайте себе новый ответ и делайте одно микро‑действие, подтверждающее его.
              </Text>
              <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Сегодня выполнено {sessionCount} раз(а)</Text>
              <View style={styles.row}>
                <StyledButton title="Пройти заново" onPress={reset} variant="secondary" />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Background>
    );
  }

  // Основная форма
  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>
          <Text style={[Fonts.title, { color: colors.text, textAlign: 'center' }]}>АБЦ анализ</Text>
          <Text style={[Fonts.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md }]}>
            Шесть шагов, чтобы отделить факты от эмоций, найти и оспорить иррациональные убеждения и прийти к взвешенному взгляду.
          </Text>
          <ProgressBar step={step === 7 ? TOTAL_STEPS : step} total={TOTAL_STEPS} />

          {step === 7 ? (
            <View style={styles.card}>
              <Text style={styles.stepTitle}>Оцените уровень эмоции сейчас</Text>
              {renderLevelSelector(emotionAfter, setEmotionAfter)}
              <View style={styles.row}>
                <StyledButton title="Назад" onPress={prev} variant="secondary" />
                <StyledButton title="Завершить" onPress={() => { if (emotionAfter === null) setEmotionAfter(5); finish(); }} />
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              {renderPreviousAnswers()}
              <Text style={styles.stepTitle}>{step}. {STEP_LABELS[step - 1]}</Text>

              {step === 1 && <Text style={styles.hint}>Запишите один конкретный факт, который произошёл. Без оценок, только то, что можно подтвердить.</Text>}
              {step === 2 && <Text style={styles.hint}>Какие слова пронеслись у вас в голове в тот момент? Запишите их дословно.</Text>}
              {step === 3 && <Text style={styles.hint}>Что вы почувствовали и как себя повели? Оцените силу эмоции (0–10).</Text>}
              {step === 4 && <Text style={styles.hint}>Какое глубинное правило или долженствование скрывается за этой мыслью? (Например: «Я должен всё контролировать»)</Text>}

              {step === 5 && (
                <>
                  <Text style={styles.hint}>Ответьте на три вопроса, чтобы проверить убеждение «{answers[3] || '...'}»</Text>
                  {['Доказательства ЗА', 'Доказательства ПРОТИВ', 'Что бы я сказал другу'].map((q, i) => (
                    <View key={i} style={styles.dBlock}>
                      <Text style={styles.dLabel}>{q}</Text>
                      <TextInput style={styles.input} multiline value={dParts[i]} onChangeText={t => { const p = [...dParts]; p[i] = t; setDParts(p); }} placeholder="Ваш ответ..." placeholderTextColor={colors.textSecondary} />
                    </View>
                  ))}
                  {dAssembled ? (
                    <>
                      <Text style={styles.dLabel}>Итог проверки:</Text>
                      <TextInput style={styles.input} multiline value={dAssembled} onChangeText={t => { setDAssembled(t); const a = [...answers]; a[4] = t; setAnswers(a); }} placeholder="Можно отредактировать" placeholderTextColor={colors.textSecondary} />
                      <View style={styles.row}>
                        <StyledButton title="Назад" onPress={prev} variant="secondary" />
                        <StyledButton title="Дальше" onPress={next} />
                      </View>
                    </>
                  ) : (
                    <View style={styles.row}>
                      <StyledButton title="Назад" onPress={prev} variant="secondary" />
                      <StyledButton title="Собрать проверку" onPress={next} />
                    </View>
                  )}
                </>
              )}

              {step === 6 && (
                <>
                  <Text style={styles.hint}>
                    В шаге 4 вы нашли убеждение: «{answers[3] || '...'}».{'\n'}
                    Теперь замените в нём жёсткие формулировки на гибкие.{'\n'}
                    Например: «Я должен» → «Мне бы хотелось», «Это катастрофа» → «Это неприятность, но я справлюсь».
                  </Text>
                  <TextInput style={styles.input} multiline value={answers[5]} onChangeText={t => { const a = [...answers]; a[5] = t; setAnswers(a); }} placeholder="Новый, гибкий взгляд..." placeholderTextColor={colors.textSecondary} />
                  <View style={styles.row}>
                    <StyledButton title="Назад" onPress={prev} variant="secondary" />
                    <StyledButton title="Далее" onPress={next} />
                  </View>
                </>
              )}

              {step < 5 && (
                <>
                  <TextInput style={styles.input} multiline value={answers[step - 1]} onChangeText={t => { const a = [...answers]; a[step - 1] = t; setAnswers(a); }} placeholder="Введите ответ..." placeholderTextColor={colors.textSecondary} />
                  {step === 3 && renderLevelSelector(emotionBefore, setEmotionBefore)}
                  <View style={styles.row}>
                    {step > 1 && <StyledButton title="Назад" onPress={prev} variant="secondary" />}
                    <StyledButton title="Дальше" onPress={next} />
                  </View>
                </>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}
