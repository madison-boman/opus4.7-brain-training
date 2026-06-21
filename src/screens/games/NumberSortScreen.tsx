import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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

const { width: SCREEN_W } = Dimensions.get('window');
const BOARD_PAD = 30;
const COL_GAP = 8;
const TILE_W = (SCREEN_W - BOARD_PAD * 2 - COL_GAP * 3) / 4;
const TILE_H = TILE_W * 0.95;
const ROW_GAP = 12;

interface Tile {
  id: string;
  value: number;
}

const Slot: React.FC<{ x: number; y: number; index: number }> = ({ x, y, index }) => (
  <View style={[styles.slot, { left: x, top: y, width: TILE_W, height: TILE_H }]}>
    <Text style={styles.slotIndex}>{index + 1}</Text>
  </View>
);

interface DraggableTileProps {
  tile: Tile;
  homeX: number;
  homeY: number;
  onDrop: (tileId: string, x: number, y: number) => void;
}

const DraggableTile: React.FC<DraggableTileProps> = ({ tile, homeX, homeY, onDrop }) => {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Update home position when reorder
  useEffect(() => {
    tx.value = withSpring(0, { damping: 14 });
    ty.value = withSpring(0, { damping: 14 });
  }, [homeX, homeY, tx, ty]);

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = tx.value;
      startY.value = ty.value;
      scale.value = withTiming(1.12, { duration: 90 });
    })
    .onChange((e) => {
      tx.value = startX.value + e.translationX;
      ty.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      const dropX = homeX + tx.value + TILE_W / 2;
      const dropY = homeY + ty.value + TILE_H / 2;
      scale.value = withTiming(1, { duration: 120 });
      runOnJS(onDrop)(tile.id, dropX, dropY);
      tx.value = withSpring(0, { damping: 14 });
      ty.value = withSpring(0, { damping: 14 });
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
    zIndex: scale.value > 1 ? 99 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.tile, { left: homeX, top: homeY, width: TILE_W, height: TILE_H }, style]}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
        />
        <Text style={styles.tileText}>{tile.value}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const NumberSortScreen: React.FC = () => {
  const meta = gameById('numberSort');
  const store = useGameStore();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [showIntro, setShowIntro] = useState(true);
  const [tier, setTier] = useState(0);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [order, setOrder] = useState<string[]>([]); // order of tile ids in slots
  const [completed, setCompleted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Drag tiles into ascending order');
  const [timeLeft, setTimeLeft] = useState(45);
  const [running, setRunning] = useState(false);
  const [boardsCleared, setBoardsCleared] = useState(0);

  const startTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tilesPerRound = useMemo(() => 5 + Math.min(tier * 2, 7), [tier]);
  const baseTime = useMemo(() => Math.max(20, 50 - tier * 8), [tier]);

  const buildRound = (rnd: number) => {
    const count = Math.min(8, tilesPerRound + Math.floor(rnd / 3));
    const used = new Set<number>();
    const values: number[] = [];
    while (values.length < count) {
      const v = random(1 + tier * 5, 49 + tier * 30);
      if (!used.has(v)) {
        used.add(v);
        values.push(v);
      }
    }
    const t: Tile[] = values.map((v, i) => ({ id: `r${rnd}-${i}`, value: v }));
    const shuffled = shuffle(t);
    setTiles(shuffled);
    setOrder(shuffled.map((x) => x.id));
    setCompleted(false);
    setTimeLeft(Math.max(15, baseTime - rnd * 2));
    setStatusMessage(`Round ${rnd} · Sort ${count} tiles`);
  };

  const startGame = () => {
    setShowIntro(false);
    setRound(1);
    setScore(0);
    setCombo(0);
    setBoardsCleared(0);
    setRunning(true);
    startTimeRef.current = Date.now();
    buildRound(1);
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
  }, [running, round]);

  // layout: row-based wrap into rows of 4
  const slotPositions = useMemo(() => {
    return order.map((_, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      return { x: col * (TILE_W + COL_GAP), y: row * (TILE_H + ROW_GAP) };
    });
  }, [order]);

  const tileMap = useMemo(() => Object.fromEntries(tiles.map((t) => [t.id, t])), [tiles]);

  const handleDrop = (tileId: string, dropX: number, dropY: number) => {
    // find target slot
    let target = -1;
    let bestDist = Infinity;
    slotPositions.forEach((pos, i) => {
      const cx = pos.x + TILE_W / 2;
      const cy = pos.y + TILE_H / 2;
      const d = Math.sqrt((cx - dropX) ** 2 + (cy - dropY) ** 2);
      if (d < bestDist) {
        bestDist = d;
        target = i;
      }
    });
    if (bestDist > TILE_W * 0.9) {
      playSfx('failure');
      return;
    }
    const fromIdx = order.indexOf(tileId);
    if (fromIdx === target) return;
    const newOrder = [...order];
    newOrder.splice(fromIdx, 1);
    newOrder.splice(target, 0, tileId);
    setOrder(newOrder);
    playSfx('tap');

    // check win
    const sortedValues = [...newOrder].map((id) => tileMap[id].value);
    const isSorted = sortedValues.every((v, i) => i === 0 || sortedValues[i - 1] <= v);
    if (isSorted) {
      const newCombo = combo + 1;
      const gain = 200 + newCombo * 30 + tier * 60;
      setCombo(newCombo);
      setScore((s) => s + gain);
      setBoardsCleared((b) => b + 1);
      setCompleted(true);
      setStatusMessage(`Solved! +${gain}`);
      playSfx('success');
      const next = round + 1;
      advanceTimerRef.current && clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        setRound(next);
        buildRound(next);
      }, 800);
    }
  };

  const endGame = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setRunning(false);
    const duration = Date.now() - startTimeRef.current;
    const total = boardsCleared * 5 + (completed ? 0 : 1);
    const accuracy = Math.min(1, boardsCleared > 0 ? 0.7 + boardsCleared * 0.05 : 0.4);
    const result = store.submitSession({
      gameId: 'numberSort',
      score: tilesPerRound + boardsCleared,
      accuracy,
      combo,
      durationMs: duration,
      difficultyTier: tier,
      skillDeltas: { logic: 16 + tier * 4, focus: 8 + tier * 2 },
      metricForDaily: { metric: 'score', value: tilesPerRound },
    });
    nav.replace('GameResult', {
      gameId: 'numberSort',
      score: tilesPerRound + boardsCleared,
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

  const rows = Math.ceil(order.length / 4);
  const boardHeight = rows * (TILE_H + ROW_GAP) + 30;

  return (
    <ScreenWrapper scroll={false} contentStyle={{ padding: 0 }}>
      <GameHud
        title={meta.title}
        score={score}
        combo={combo}
        timer={timeLeft}
        level={round}
        difficultyLabel={meta.difficultyTiers[tier]}
        bestScore={store.bestScores.numberSort}
      />
      <Text style={styles.status}>{statusMessage}</Text>
      <Text style={styles.subhint}>Smallest first · Drag a tile to swap positions</Text>
      <View style={[styles.board, { height: boardHeight, marginHorizontal: BOARD_PAD }]}>
        {slotPositions.map((p, i) => (
          <Slot key={`slot-${i}`} x={p.x} y={p.y} index={i} />
        ))}
        {order.map((tileId, i) => {
          const tile = tileMap[tileId];
          if (!tile) return null;
          const pos = slotPositions[i];
          return (
            <DraggableTile
              key={tile.id}
              tile={tile}
              homeX={pos.x}
              homeY={pos.y}
              onDrop={handleDrop}
            />
          );
        })}
      </View>
      <View style={styles.footer}>
        <View style={styles.footChip}>
          <Text style={styles.footLabel}>Boards</Text>
          <Text style={styles.footVal}>{boardsCleared}</Text>
        </View>
      </View>

      <GameIntro
        visible={showIntro}
        emoji={meta.emoji}
        title={meta.title}
        description={meta.description}
        tips={[
          'Drag and drop the tiles into ascending order.',
          'Sort the entire row to clear the board.',
          'Each cleared board grows the next puzzle.',
          'Combo multiplier rewards consecutive solves.',
        ]}
        difficultyLabel={meta.difficultyTiers[tier]}
        difficultyTier={tier}
        difficultyOptions={meta.difficultyTiers}
        onChangeDifficulty={setTier}
        bestScore={store.bestScores.numberSort}
        primaryColor={meta.gradient}
        onStart={startGame}
        onCancel={() => nav.goBack()}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  status: { ...typography.h3, color: palette.text, textAlign: 'center', marginVertical: 4 },
  subhint: { ...typography.caption, color: palette.textDim, textAlign: 'center', marginBottom: 14 },
  board: { position: 'relative' },
  slot: {
    position: 'absolute',
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotIndex: { ...typography.tiny, color: 'rgba(255,255,255,0.2)' },
  tile: {
    position: 'absolute',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
    ...shadow.card,
  },
  tileText: { ...typography.h1, color: '#fff', fontSize: 24 },
  footer: { alignItems: 'center', marginTop: 8, flexDirection: 'row', justifyContent: 'center', gap: 12 },
  footChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footLabel: { ...typography.tiny, color: palette.textDim },
  footVal: { ...typography.h3, color: palette.text },
});

export default NumberSortScreen;
