import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { palette, radii, typography } from '../../theme';
import { shuffle } from '../../utils/helpers';
import { RootStackParamList } from '../../navigation/types';

type Phase = 'idle' | 'preview' | 'playing' | 'roundEnd' | 'done';

const { width: SCREEN_W } = Dimensions.get('window');

const Cell: React.FC<{
  index: number;
  flashing: boolean;
  found: boolean;
  miss: boolean;
  size: number;
  onPress: () => void;
}> = ({ flashing, found, miss, size, onPress }) => {
  const scale = useSharedValue(1);
  const shakeSv = useSharedValue(0);

  useEffect(() => {
    if (flashing) {
      scale.value = withSequence(
        withTiming(1.05, { duration: 120 }),
        withTiming(1, { duration: 220 }),
      );
    }
  }, [flashing, scale]);

  useEffect(() => {
    if (miss) {
      shakeSv.value = withSequence(
        withTiming(-1, { duration: 60 }),
        withTiming(1, { duration: 60 }),
        withTiming(-1, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
    }
  }, [miss, shakeSv]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shakeSv.value * 6 }],
  }));

  return (
    <Pressable onPress={onPress} style={{ width: size, height: size, padding: 6 }}>
      <Animated.View
        style={[
          styles.cellBox,
          { borderRadius: 18 },
          flashing && styles.cellFlash,
          found && styles.cellFound,
          miss && styles.cellMiss,
          style,
        ]}
      >
        {flashing || found ? (
          <Text style={{ fontSize: size * 0.4 }}>⭐️</Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
};

const PeekABooGridScreen: React.FC = () => {
  const meta = gameById('peekABoo');
  const store = useGameStore();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [showIntro, setShowIntro] = useState(true);
  const [tier, setTier] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hidden, setHidden] = useState<number[]>([]);
  const [flashing, setFlashing] = useState<number[]>([]);
  const [found, setFound] = useState<Record<number, true>>({});
  const [misses, setMisses] = useState<Record<number, true>>({});
  const [statusMessage, setStatusMessage] = useState('Get ready');
  const [missedThisRound, setMissedThisRound] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctTaps, setCorrectTaps] = useState(0);
  const [previewLeft, setPreviewLeft] = useState(0);

  const startTimeRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const gridSize = useMemo(() => (tier >= 2 ? 4 : 3), [tier]); // 3x3 or 4x4
  const totalCells = gridSize * gridSize;
  const cellSize = (SCREEN_W - 60) / gridSize;

  const targetsForRound = (r: number) => {
    if (tier === 0) return Math.min(6, 3 + Math.floor(r / 2));
    if (tier === 1) return Math.min(7, 4 + Math.floor(r / 2));
    if (tier === 2) return Math.min(9, 5 + Math.floor(r / 2));
    return Math.min(11, 6 + Math.floor(r / 2));
  };

  const previewSeconds = useMemo(() => Math.max(1, 2 - tier * 0.4), [tier]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const startGame = () => {
    setShowIntro(false);
    setRound(0);
    setScore(0);
    setCombo(0);
    setFoundCount(0);
    setTotalAttempts(0);
    setCorrectTaps(0);
    startTimeRef.current = Date.now();
    nextRound(1);
  };

  const nextRound = (rnd: number) => {
    const count = targetsForRound(rnd);
    const positions = shuffle(Array.from({ length: totalCells }, (_, i) => i)).slice(0, count);
    setRound(rnd);
    setHidden(positions);
    setFlashing(positions);
    setFound({});
    setMisses({});
    setMissedThisRound(0);
    setPhase('preview');
    setStatusMessage(`Round ${rnd} · Memorize the stars`);
    setPreviewLeft(previewSeconds);

    // Countdown ticker
    let p = previewSeconds;
    const tick = setInterval(() => {
      p -= 0.25;
      setPreviewLeft(Math.max(0, p));
    }, 250);
    timersRef.current.push(tick as unknown as ReturnType<typeof setTimeout>);
    // After preview, hide
    const t = setTimeout(() => {
      clearInterval(tick);
      setFlashing([]);
      setPhase('playing');
      setStatusMessage('Tap every cell that lit up');
    }, previewSeconds * 1000);
    timersRef.current.push(t);
  };

  const handleCellPress = (i: number) => {
    if (phase !== 'playing') return;
    if (found[i] || misses[i]) return;
    setTotalAttempts((a) => a + 1);
    if (hidden.includes(i)) {
      const newFound = { ...found, [i]: true } as Record<number, true>;
      setFound(newFound);
      setCorrectTaps((c) => c + 1);
      const newCombo = combo + 1;
      const gain = 80 + newCombo * 12 + tier * 25;
      setCombo(newCombo);
      setScore((s) => s + gain);
      setFoundCount((c) => c + 1);
      playSfx('success');
      const totalFound = Object.keys(newFound).length;
      if (totalFound === hidden.length) {
        setStatusMessage('Round clear!');
        playSfx('combo');
        setPhase('roundEnd');
        const t = setTimeout(() => {
          if (round >= 8) {
            endGame();
          } else {
            nextRound(round + 1);
          }
        }, 900);
        timersRef.current.push(t);
      } else {
        setStatusMessage(`Nice +${gain}`);
      }
    } else {
      setMisses((m) => ({ ...m, [i]: true } as Record<number, true>));
      setCombo(0);
      setMissedThisRound((m) => m + 1);
      playSfx('failure');
      setStatusMessage('Wrong square!');
      if (missedThisRound + 1 >= 3) {
        const t = setTimeout(() => endGame(), 700);
        timersRef.current.push(t);
      }
    }
  };

  const endGame = () => {
    clearTimers();
    setPhase('done');
    const duration = Date.now() - startTimeRef.current;
    const accuracy = totalAttempts === 0 ? 0 : correctTaps / totalAttempts;
    const result = store.submitSession({
      gameId: 'peekABoo',
      score,
      accuracy,
      combo,
      durationMs: duration,
      difficultyTier: tier,
      skillDeltas: { memory: 16 + tier * 4, reaction: 8 + tier * 2, focus: 4 },
      metricForDaily: { metric: 'score', value: score },
    });
    nav.replace('GameResult', {
      gameId: 'peekABoo',
      score,
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
        bestScore={store.bestScores.peekABoo}
      />
      <Text style={styles.status}>{statusMessage}</Text>
      {phase === 'preview' && (
        <View style={styles.previewBar}>
          <Text style={styles.previewText}>Memorize · {previewLeft.toFixed(1)}s</Text>
        </View>
      )}
      <View style={[styles.board, { width: cellSize * gridSize, alignSelf: 'center' }]}>
        {Array.from({ length: totalCells }).map((_, i) => (
          <Cell
            key={i}
            index={i}
            size={cellSize}
            flashing={flashing.includes(i)}
            found={!!found[i]}
            miss={!!misses[i]}
            onPress={() => handleCellPress(i)}
          />
        ))}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendChip}>
          <Text style={styles.legendText}>Found {Object.keys(found).length}/{hidden.length}</Text>
        </View>
        <View style={styles.legendChip}>
          <Text style={styles.legendText}>Lives {Math.max(0, 3 - missedThisRound)}</Text>
        </View>
      </View>

      <GameIntro
        visible={showIntro}
        emoji={meta.emoji}
        title={meta.title}
        description={meta.description}
        tips={[
          `Stars flash on a ${gridSize}×${gridSize} grid for ${previewSeconds.toFixed(1)} seconds.`,
          'Tap every cell that lit up — order does not matter.',
          'Wrong taps cost a life. 3 misses end the round.',
          'Survive 8 rounds for the maximum bonus.',
        ]}
        difficultyLabel={meta.difficultyTiers[tier]}
        difficultyTier={tier}
        difficultyOptions={meta.difficultyTiers}
        onChangeDifficulty={setTier}
        bestScore={store.bestScores.peekABoo}
        primaryColor={meta.gradient}
        onStart={startGame}
        onCancel={() => nav.goBack()}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  status: { ...typography.h3, color: palette.text, textAlign: 'center', paddingHorizontal: 16, marginVertical: 8 },
  previewBar: { alignSelf: 'center', marginBottom: 8 },
  previewText: { ...typography.caption, color: palette.accent, fontWeight: '700' },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cellBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cellFlash: {
    backgroundColor: 'rgba(255,209,102,0.85)',
    borderColor: '#FFD166',
  },
  cellFound: {
    backgroundColor: 'rgba(62,230,168,0.18)',
    borderColor: 'rgba(62,230,168,0.5)',
  },
  cellMiss: {
    backgroundColor: 'rgba(255,94,122,0.25)',
    borderColor: 'rgba(255,94,122,0.6)',
  },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 16 },
  legendChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  legendText: { ...typography.caption, color: palette.text },
});

export default PeekABooGridScreen;
