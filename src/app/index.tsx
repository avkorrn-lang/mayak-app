import React, { useState } from 'react'; import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'; import { SafeAreaView } from 'react-native-safe-area-context'; import StyledButton from '../components/StyledButton'; import StyledInput from '../components/StyledInput'; import MayakIcon from '../components/MayakIcon'; import Background from '../components/Background'; import { useThemeColors, Fonts, Spacing } from '../theme';

export default function HorizonScreen() {
  const colors = useThemeColors();
  const [showIntro, setShowIntro] = useState(true);
  const [emotion, setEmotion] = useState('');
  const [thought, setThought] = useState('');
  const [step, setStep] = useState<'input' | 'reframe' | 'done'>('input');
  const [reframedThought, setReframedThought] = useState('');
  const [newChoice, setNewChoice] = useState('');

  const handleNotice = () => { if (!thought.trim()) return; setReframedThought(`Я заметил мысль: «${thought.trim()}»`); setStep('reframe'); };
  const handleReframe = () => setStep('done');
  const handleDone = () => { setStep('input'); setEmotion(''); setThought(''); setReframedThought(''); setNewChoice(''); };

  return (
    <Background>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {showIntro && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
              <Text style={[styles.introTitle, { color: colors.accent }]}>Добро пожаловать в Маяк</Text>
              <Text style={[styles.introText, { color: colors.text }]}>Это приложение — ваш навигатор в шторме тревоги. Вы научитесь замечать мысли, не сливаясь с ними, отделять факты от пугающих фантазий и находить маленькие, бережные шаги к спокойствию.</Text>
              <TouchableOpacity onPress={() => setShowIntro(false)}><Text style={[styles.introClose, { color: colors.accent }]}>Понятно, приступим</Text></TouchableOpacity>
            </View>
          )}
          <MayakIcon />
          <Text style={[Fonts.title, { color: colors.text, textAlign: 'center', marginTop: Spacing.md }]}>Маяк</Text>
          <Text style={[Fonts.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg }]}>Заметь тревогу, не проваливаясь в неё</Text>

          {step === 'input' && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Что я чувствую?</Text>
              <StyledInput value={emotion} onChangeText={setEmotion} placeholder="Страх, гнев, тоска..." />
              <StyledInput value={thought} onChangeText={setThought} placeholder="Какая мысль пришла?" multiline />
              <StyledButton title="Заметить" onPress={handleNotice} />
            </View>
          )}

          {step === 'reframe' && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Отделите мысль от себя</Text>
              <Text style={[styles.hint, { color: colors.textSecondary }]}>Мысль — это не вы. Это просто событие в уме.</Text>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Я заметил мысль:</Text>
              <StyledInput value={reframedThought} onChangeText={setReframedThought} placeholder="Я заметил мысль: ..." />
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Вместо этого я выбираю:</Text>
              <StyledInput value={newChoice} onChangeText={setNewChoice} placeholder="думать / чувствовать / делать ..." multiline />
              <View style={[styles.exampleBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.exampleText, { color: colors.textSecondary }]}>Пример: «Вместо этого я выбираю думать, что я способен справиться с этой задачей, чувствовать интерес и любопытство, и продолжать действовать в сфере своего влияния.»</Text>
              </View>
              <View style={styles.row}>
                <StyledButton title="Назад" onPress={() => setStep('input')} variant="secondary" />
                <View style={{ width: 10 }} />
                <StyledButton title="Готово" onPress={handleReframe} />
              </View>
            </View>
          )}

          {step === 'done' && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.resultTitle, { color: colors.positive }]}>Отлично!</Text>
              <Text style={[styles.resultText, { color: colors.text }]}>{reframedThought}</Text>
              {newChoice ? <Text style={[styles.resultChoice, { color: colors.accent }]}>Ваш выбор: {newChoice}</Text> : null}
              <Text style={[styles.schemeTitle, { color: colors.text }]}>Что произошло:</Text>
              <View style={styles.schemeRow}>
                <Text style={styles.schemeEmoji}>😟</Text>
                <Text style={[styles.schemeText, { color: colors.textSecondary }]}>Я слипся с мыслью</Text>
              </View>
              <Text style={[styles.schemeArrow, { color: colors.accent }]}>↓</Text>
              <View style={styles.schemeRow}>
                <Text style={styles.schemeEmoji}>🧘</Text>
                <Text style={[styles.schemeText, { color: colors.textSecondary }]}>Я заметил мысль и отделился от неё</Text>
              </View>
              <Text style={[styles.schemeArrow, { color: colors.accent }]}>↓</Text>
              <View style={styles.schemeRow}>
                <Text style={styles.schemeEmoji}>✅</Text>
                <Text style={[styles.schemeText, { color: colors.textSecondary }]}>Я выбрал, как хочу думать и действовать</Text>
              </View>
              <Text style={[styles.devis, { color: colors.textSecondary }]}>Делай что должно и будь что будет</Text>
              <StyledButton title="Понятно" onPress={handleDone} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.md, alignItems: 'center', paddingBottom: 40 },
  card: { borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, width: '100%' },
  introTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  introText: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  introClose: { fontWeight: '600', textAlign: 'right' },
  devis: { fontSize: 14, fontStyle: 'italic', textAlign: 'center', marginTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: Spacing.sm },
  hint: { fontSize: 14, marginBottom: 12 },
  fieldLabel: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  exampleBox: { borderRadius: 8, padding: 8, marginTop: 8, marginBottom: 12 },
  exampleText: { fontSize: 13, fontStyle: 'italic' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  resultTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  resultText: { fontSize: 16, marginBottom: 4 },
  resultChoice: { fontSize: 14, marginBottom: 8 },
  schemeTitle: { fontSize: 15, fontWeight: '600', marginTop: 8, marginBottom: 8 },
  schemeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  schemeEmoji: { fontSize: 24, marginRight: 10 },
  schemeText: { fontSize: 14 },
  schemeArrow: { fontSize: 20, marginVertical: 4, textAlign: 'center' },
});
