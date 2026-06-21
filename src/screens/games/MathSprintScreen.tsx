import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import GameHud from '../../components/GameHud';
import GameIntro from '../../components/GameIntro';
import ScreenWrapper from '../../components/ScreenWrapper';
import playSfx from '../../components/SoundEffectsHint';
import { gameById } from '../../data/games';
import { useGameStore } from '../../store/GameStore';
import { gradients, palette, radii, shadow, typography } from '../../theme';
import { random, shuffle } from '../../utils/helpers';
import { RootStackParamList } from '../../navigation/types';

interface Problem {
  id: string;
  text: string;
  answer: number;
  options: number[];
}

const buildProblem = (tier: number, idx: number): Problem => {
  const ops = tier === 0
    ? ['+', '-']
    : tier === 1
    ? ['+', '-', '×']
    : tier === 2
    ? ['+', '-', '×', '÷']
    : ['+', '-', '×', '÷', '+', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = random(2, 12 + tier * 5);
  let b = random(2, 8 + tier * 3);
  let answer = 0;
  let text = '';
  switch (op) {
    case '+':
      a = random(5, 20 + tier * 12);
      b = random(5, 20 + tier * 12);
      answer = a + b;
      text = `${a} + ${b}`;
      break;
    case '-':
      a = random(20 + tier * 10, 50 + tier * 30);
      b = random(2, a - 2);
      answer = a - b;
      text = `${a} − ${b}`;
      break;
    case '×':
      a = random(2, 9 + tier);
      b = random(2, 9 + tier);
      answer = a * b;
      text = `${a} × ${b}`;
      break;
    case '÷':
      b = random(2, 9 + tier);
      answer = random(2, 9 + tier);
      a = b * answer;
      text = `${a} ÷ ${b}`;
      break;
  }
  // Build wrong options
  const optsSet = new Set<number>([answer]);
  while (optsSet.size < 4) {
    const offset = random(-7 - tier * 3, 7 + tier * 3);
    if (offset === 0) continue;
    optsSet.add(Math.max(0, answer + offset));
  }
  return { id: `p${idx}`, text, answer, options: shuffle([...optsSet]) };
};

const MathSprintScreen: React.FC = () => {
  const meta = gameById('mathSprint');
  const store = useGameStore();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [showIntro, setShowIntro] = useState(true);
  const [tier, setTier] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [problemIdx, setProblemIdx] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [pickedCorrect, setPickedCorrect] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState('Tap the correct answer');
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const startTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalTime = useMemo(() => Math.max(20, 70 - tier * 10), [tier]);

  const shake = useSharedValue(0);
  const flash = useSharedValue(0);
  useEffect(() => {
    if (pickedCorrect === false) {
      shake.value = withSequence(
        withTiming(-1, { duration: 60 }),
        withTiming(1, { duration: 60 }),
        withTiming(-1, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
    } else if (pickedCorrect === true) {
      flash.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 250 }));
    }
  }, [pickedCorrect, shake, flash]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value * 8 }],
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value * 0.4,
  }));

  const startGame = () => {
    setShowIntro(false);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setProblemIdx(0);
    setCorrect(0);
    setWrong(0);
    setRunning(true);
    setTimeLeft(totalTime);
    startTimeRef.current = Date.now();
    setProblem(buildProblem(tier, 0));
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const handleAnswer = (i: number) => {
    if (!problem || pickedIdx !== null) return;
    setPickedIdx(i);
    const ok = problem.options[i] === problem.answer;
    setPickedCorrect(ok);
    if (ok) {
      const newCombo = combo + 1;
      const gain = 100 + newCombo * 14 + tier * 25;
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      setScore((s) => s + gain);
      setCorrect((c) => c + 1);
      setStatusMessage(`Correct! +${gain}`);
      playSfx(newCombo % 5 === 0 ? 'combo' : 'success');
      if (combo > 0 && newCombo > combo + 0) {
        setTimeLeft((t) => Math.min(totalTime, t + 1));
      }
    } else {
      setCombo(0);
      setWrong((w) => w + 1);
      setStatusMessage(`Wrong — answer was ${problem.answer}`);
      playSfx('failure');
      setTimeLeft((t) => Math.max(0, t - 3));
    }
    setTimeout(() => {
      const nextIdx = problemIdx + 1;
      setProblemIdx(nextIdx);
      setProblem(buildProblem(tier, nextIdx));
      setPickedIdx(null);
      setPickedCorrect(null);
    }, 600);
  };

  const endGame = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    const duration = Date.now() - startTimeRef.current;
    const total = correct + wrong;
    const accuracy = total === 0 ? 0 : correct / total;
    const result = store.submitSession({
      gameId: 'mathSprint',
      score: correct,
      accuracy,
      combo: maxCombo,
      durationMs: duration,
      difficultyTier: tier,
      skillDeltas: { problem: 14 + tier * 4, reaction: 12 + tier * 2, logic: 6 },
      metricForDaily: { metric: 'combo', value: maxCombo },
    });
    nav.replace('GameResult', {
      gameId: 'mathSprint',
      score: correct,
      accuracy,
      combo: maxCombo,
      durationMs: duration,
      difficultyTier: tier,
      xpEarned: result.xpEarned,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
      isNewBest: result.isNewBest,
      brainCoinsEarned: result.brainCoinsEarned,
      unlockedAchievementIds: result.unlockedAchievements.map((a) => a.id),
      completedDailyIds: result.completedDailies.map((d) => d.id),
    });
  };

  return (
    <ScreenWrapper scroll={false} contentStyle={{ padding: 0 }}>
      <GameHud
        title={meta.title}
        score={score}
        combo={combo}
        timer={timeLeft}
        difficultyLabel={meta.difficultyTiers[tier]}
        bestScore={store.bestScores.mathSprint}
      />
      <Text style={styles.status}>{statusMessage}</Text>

      <Animated.View style={[styles.problemCard, cardStyle, shadow.card]}>
        <LinearGradient
          colors={pickedCorrect === false ? ['#FF5E7A', '#7C3344'] as const : meta.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.xl }]}
        />
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', borderRadius: radii.xl }, flashStyle]} pointerEvents="none" />
        <Text style={styles.problemTag}>QUESTION {problemIdx + 1}</Text>
        <Text style={styles.problemText}>{problem?.text ?? '—'}</Text>
        <Text style={styles.problemEq}>= ?</Text>
      </Animated.View>

      <View style={styles.options}>
        {problem?.options.map((opt, i) => {
          const isCorrect = problem.answer === opt;
          const isPicked = pickedIdx === i;
          const isWrongPick = isPicked && !isCorrect;
          return (
            <Pressable
              key={i}
              onPress={() => handleAnswer(i)}
              disabled={pickedIdx !== null}
              style={({ pressed }) => [pressed && { transform: [{ scale: 0.97 }] }]}
            >
              <View
                style={[
                  styles.option,
                  isPicked && isCorrect && { backgroundColor: 'rgba(62,230,168,0.18)', borderColor: palette.green },
                  isWrongPick && { backgroundColor: 'rgba(255,94,122,0.18)', borderColor: palette.red },
                  pickedIdx !== null && isCorrect && { borderColor: palette.green },
                ]}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Text style={styles.metaLabel}>Correct</Text>
          <Text style={styles.metaValue}>{correct}</Text>
        </View>
        <View style={styles.metaChip}>
          <Text style={styles.metaLabel}>Wrong</Text>
          <Text style={styles.metaValue}>{wrong}</Text>
        </View>
        <View style={styles.metaChip}>
          <Text style={styles.metaLabel}>Best Combo</Text>
          <Text style={styles.metaValue}>{maxCombo}x</Text>
        </View>
      </View>

      <GameIntro
        visible={showIntro}
        emoji={meta.emoji}
        title={meta.title}
        description={meta.description}
        tips={[
          'Solve as many problems as you can before time runs out.',
          'Each correct answer adds time. Wrong answers cost 3s.',
          'Stack a streak to multiply your score.',
          'Higher difficulty introduces multiplication and division.',
        ]}
        difficultyLabel={meta.difficultyTiers[tier]}
        difficultyTier={tier}
        difficultyOptions={meta.difficultyTiers}
        onChangeDifficulty={setTier}
        bestScore={store.bestScores.mathSprint}
        primaryColor={meta.gradient}
        onStart={startGame}
        onCancel={() => nav.goBack()}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  status: { ...typography.h3, color: palette.text, textAlign: 'center', marginVertical: 12, paddingHorizontal: 16 },
  problemCard: {
    marginHorizontal: 18,
    borderRadius: radii.xl,
    paddingVertical: 38,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  problemTag: { ...typography.tiny, color: 'rgba(255,255,255,0.8)' },
  problemText: { fontSize: 56, color: '#fff', fontWeight: '900', marginVertical: 6, letterSpacing: -1 },
  problemEq: { ...typography.h2, color: 'rgba(255,255,255,0.85)' },
  options: {
    marginTop: 22,
    paddingHorizontal: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  option: {
    width: '47%',
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  optionText: { ...typography.h1, color: palette.text },
  metaRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, marginTop: 18, justifyContent: 'space-between' },
  metaChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  metaLabel: { ...typography.tiny, color: palette.textDim },
  metaValue: { ...typography.h3, color: palette.text, marginTop: 2 },
});

export default MathSprintScreen;
