import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import GameHud from '../../components/GameHud';
import GameIntro from '../../components/GameIntro';
import ScreenWrapper from '../../components/ScreenWrapper';
import { gameById } from '../../data/games';
import { useGameStore } from '../../store/GameStore';
import { gradients, palette, radii, typography } from '../../theme';
import { random } from '../../utils/helpers';
import playSfx from '../../components/SoundEffectsHint';
import { RootStackParamList } from '../../navigation/types';

const PADS = [
  { color: '#FF5E7A', dim: '#7C3344', name: 'red' },
  { color: '#22D3EE', dim: '#13647A', name: 'blue' },
  { color: '#FFD166', dim: '#7C6E2E', name: 'yellow' },
  { color: '#3EE6A8', dim: '#256E54', name: 'green' },
];

type Phase = 'idle' | 'showing' | 'awaiting' | 'success' | 'fail';

const Pad: React.FC<{
  index: number;
  active: boolean;
  shake?: boolean;
  onPress: () => void;
  disabled?: boolean;
}> = ({ index, active, shake, onPress, disabled }) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const shakeSv = useSharedValue(0);

  useEffect(() => {
    glow.value = withTiming(active ? 1 : 0, { duration: 180 });
    if (active) scale.value = withSequence(withTiming(1.08, { duration: 130 }), withTiming(1, { duration: 200 }));
  }, [active, glow, scale]);

  useEffect(() => {
    if (shake) {
      shakeSv.value = withSequence(
        withTiming(-1, { duration: 60 }),
        withTiming(1, { duration: 60 }),
        withTiming(-1, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
    }
  }, [shake, shakeSv]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shakeSv.value * 8 }],
    opacity: 0.55 + glow.value * 0.45,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const pad = PADS[index];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 80, easing: Easing.out(Easing.quad) });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      style={styles.padWrap}
    >
      <Animated.View style={[styles.pad, style]}>
        <LinearGradient
          colors={[pad.color, pad.dim]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
        />
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, ringStyle, styles.padShine]}
        />
      </Animated.View>
    </Pressable>
  );
};

const LightSequenceScreen: React.FC = () => {
  const meta = gameById('lightSequence');
  const store = useGameStore();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [showIntro, setShowIntro] = useState(true);
  const [tier, setTier] = useState(0);

  const [sequence, setSequence] = useState<number[]>([]);
  const [userIdx, setUserIdx] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [round, setRound] = useState(0);
  const [shakePad, setShakePad] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('Watch the pattern');
  const startTimeRef = useRef<number>(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const flashSpeed = useMemo(() => Math.max(260, 600 - tier * 100), [tier]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const startGame = () => {
    setShowIntro(false);
    setSequence([]);
    setUserIdx(0);
    setScore(0);
    setCombo(0);
    setRound(0);
    setPhase('idle');
    startTimeRef.current = Date.now();
    setTimeout(() => addToSequence([]), 400);
  };

  const addToSequence = (current: number[]) => {
    const additions = tier >= 2 ? 2 : 1;
    const next = [...current];
    for (let i = 0; i < additions; i++) next.push(random(0, 3));
    setSequence(next);
    setRound(next.length);
    setStatusMessage(`Round ${next.length} · Watch closely`);
    playSequence(next);
  };

  const playSequence = (seq: number[]) => {
    clearTimers();
    setPhase('showing');
    setUserIdx(0);
    setActivePad(null);
    seq.forEach((pad, i) => {
      const t1 = setTimeout(() => {
        setActivePad(pad);
        playSfx('tick');
      }, i * (flashSpeed + 120) + 200);
      const t2 = setTimeout(() => {
        setActivePad(null);
      }, i * (flashSpeed + 120) + 200 + flashSpeed);
      timersRef.current.push(t1, t2);
    });
    const total = seq.length * (flashSpeed + 120) + 200 + 100;
    const tEnd = setTimeout(() => {
      setPhase('awaiting');
      setStatusMessage('Your turn — repeat the pattern');
    }, total);
    timersRef.current.push(tEnd);
  };

  const handlePadPress = (pad: number) => {
    if (phase !== 'awaiting') return;
    const expected = sequence[userIdx];
    setActivePad(pad);
    setTimeout(() => setActivePad((p) => (p === pad ? null : p)), 180);
    if (expected === pad) {
      playSfx('tap');
      const newCombo = combo + 1;
      const gain = 10 + newCombo * 2 + tier * 4;
      setUserIdx((i) => i + 1);
      setCombo(newCombo);
      setScore((s) => s + gain);
      if (userIdx + 1 === sequence.length) {
        playSfx('success');
        setStatusMessage('Sequence complete! 🎉');
        setPhase('success');
        const t = setTimeout(() => {
          addToSequence(sequence);
        }, 700);
        timersRef.current.push(t);
      }
    } else {
      playSfx('failure');
      setShakePad(pad);
      setTimeout(() => setShakePad(null), 400);
      setPhase('fail');
      setStatusMessage('Pattern broken — game over');
      const t = setTimeout(() => endGame(), 900);
      timersRef.current.push(t);
    }
  };

  const endGame = () => {
    clearTimers();
    const totalSteps = sequence.length;
    const correctSteps = userIdx;
    const accuracy = totalSteps === 0 ? 0 : correctSteps / totalSteps;
    const duration = Date.now() - startTimeRef.current;
    const finalScore = Math.max(score, correctSteps);

    const result = store.submitSession({
      gameId: 'lightSequence',
      score: Math.max(round - 1, 0),
      accuracy,
      combo,
      durationMs: duration,
      difficultyTier: tier,
      skillDeltas: { memory: 14 + tier * 4, focus: 8 + tier * 2 },
      metricForDaily: { metric: 'score', value: Math.max(round - 1, 0) },
    });

    nav.replace('GameResult', {
      gameId: 'lightSequence',
      score: Math.max(round - 1, 0),
      accuracy,
      combo,
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
        level={round || 1}
        difficultyLabel={meta.difficultyTiers[tier]}
        bestScore={store.bestScores.lightSequence}
      />
      <View style={styles.body}>
        <Text style={styles.status}>{statusMessage}</Text>
        <View style={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <Pad
              key={i}
              index={i}
              active={activePad === i}
              shake={shakePad === i}
              onPress={() => handlePadPress(i)}
              disabled={phase !== 'awaiting'}
            />
          ))}
        </View>
        <View style={styles.dotRow}>
          {sequence.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < userIdx && { backgroundColor: palette.green },
                i === userIdx && phase === 'awaiting' && { backgroundColor: palette.accent },
              ]}
            />
          ))}
        </View>
      </View>

      <GameIntro
        visible={showIntro}
        emoji={meta.emoji}
        title={meta.title}
        description={meta.description}
        tips={[
          'Watch the colored pads flash in sequence.',
          'Tap them in the same order to win the round.',
          'Combo bonuses stack with every correct tap.',
          'One mistake ends the round — stay focused!',
        ]}
        difficultyLabel={meta.difficultyTiers[tier]}
        difficultyTier={tier}
        difficultyOptions={meta.difficultyTiers}
        onChangeDifficulty={setTier}
        bestScore={store.bestScores.lightSequence}
        primaryColor={meta.gradient}
        onStart={startGame}
        onCancel={() => nav.goBack()}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 18, paddingTop: 6, paddingBottom: 30, alignItems: 'center', justifyContent: 'center' },
  status: { ...typography.h3, color: palette.text, marginBottom: 22, textAlign: 'center' },
  grid: { width: 320, height: 320, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  padWrap: { width: '47%', height: '47%', flexBasis: '47%' },
  pad: { flex: 1, borderRadius: 24, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  padShine: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 24 },
  dotRow: { flexDirection: 'row', gap: 6, marginTop: 28, flexWrap: 'wrap', maxWidth: 320, justifyContent: 'center' },
  dot: { width: 12, height: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
});

export default LightSequenceScreen;
