import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import { palette, typography } from '../../theme';
import { shuffle } from '../../utils/helpers';
import { RootStackParamList } from '../../navigation/types';

type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond' | 'hexagon' | 'cross';

interface ShapeItem {
  id: string;
  kind: ShapeKind;
  color: string;
}

const SHAPE_COLORS = ['#FF5E7A', '#22D3EE', '#FFD166', '#3EE6A8', '#7C5CFF', '#FF9F4A', '#FF6BCB', '#4F8DFF'];
const ALL_SHAPES: ShapeKind[] = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'hexagon', 'cross'];

const { width: SCREEN_W } = Dimensions.get('window');
const BOARD_PAD = 18;
const COL_W = (SCREEN_W - BOARD_PAD * 2) / 2;
const SHAPE_SIZE = Math.min(64, COL_W - 24);
const ROW_GAP = 12;
const SLOT_OFFSET_X = (COL_W - SHAPE_SIZE) / 2;
const SHAPE_OFFSET_X = COL_W + (COL_W - SHAPE_SIZE) / 2;

const ShapeIcon: React.FC<{ kind: ShapeKind; color: string; size?: number; outline?: boolean }> = ({
  kind,
  color,
  size = SHAPE_SIZE,
  outline,
}) => {
  const c = outline ? 'rgba(0,0,0,0.7)' : color;
  const common: any = { width: size, height: size, alignItems: 'center', justifyContent: 'center' };
  switch (kind) {
    case 'circle':
      return <View style={[common, { borderRadius: size, backgroundColor: c }]} />;
    case 'square':
      return <View style={[common, { borderRadius: size * 0.18, backgroundColor: c }]} />;
    case 'triangle':
      return (
        <View style={[common, { backgroundColor: 'transparent' }]}>
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: size / 2,
              borderRightWidth: size / 2,
              borderBottomWidth: size,
              borderStyle: 'solid',
              backgroundColor: 'transparent',
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: c,
            }}
          />
        </View>
      );
    case 'star':
      return (
        <View style={common}>
          <Text style={{ fontSize: size, color: c, lineHeight: size }}>★</Text>
        </View>
      );
    case 'heart':
      return (
        <View style={common}>
          <Text style={{ fontSize: size * 0.95, color: c, lineHeight: size }}>♥</Text>
        </View>
      );
    case 'diamond':
      return (
        <View style={[common, { transform: [{ rotate: '45deg' }] }]}>
          <View style={{ width: size * 0.7, height: size * 0.7, backgroundColor: c, borderRadius: 6 }} />
        </View>
      );
    case 'hexagon':
      return (
        <View style={common}>
          <Text style={{ fontSize: size * 1.1, color: c, lineHeight: size }}>⬢</Text>
        </View>
      );
    case 'cross':
      return (
        <View style={common}>
          <Text style={{ fontSize: size, color: c, lineHeight: size, fontWeight: '900' }}>✚</Text>
        </View>
      );
  }
};

interface DragShape extends ShapeItem {
  homeX: number;
  homeY: number;
  matched: boolean;
  targetX?: number;
  targetY?: number;
}

interface DragProps {
  shape: DragShape;
  slots: { id: string; x: number; y: number }[];
  onMatched: (id: string) => void;
  onMissed: () => void;
}

const Draggable: React.FC<DragProps> = ({ shape, slots, onMatched, onMissed }) => {
  const tx = useSharedValue(shape.matched && shape.targetX !== undefined ? shape.targetX - shape.homeX : 0);
  const ty = useSharedValue(shape.matched && shape.targetY !== undefined ? shape.targetY - shape.homeY : 0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (shape.matched && shape.targetX !== undefined && shape.targetY !== undefined) {
      tx.value = withSpring(shape.targetX - shape.homeX, { damping: 14, stiffness: 140 });
      ty.value = withSpring(shape.targetY - shape.homeY, { damping: 14, stiffness: 140 });
    }
  }, [shape.matched, shape.targetX, shape.targetY, shape.homeX, shape.homeY, tx, ty]);

  const pan = Gesture.Pan()
    .enabled(!shape.matched)
    .onStart(() => {
      startX.value = tx.value;
      startY.value = ty.value;
      scale.value = withTiming(1.18, { duration: 90 });
    })
    .onChange((e) => {
      tx.value = startX.value + e.translationX;
      ty.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      const cx = shape.homeX + tx.value + SHAPE_SIZE / 2;
      const cy = shape.homeY + ty.value + SHAPE_SIZE / 2;
      let hit: { id: string; x: number; y: number } | null = null;
      let bestDist = Infinity;
      for (const s of slots) {
        const sx = s.x + SHAPE_SIZE / 2;
        const sy = s.y + SHAPE_SIZE / 2;
        const d = Math.sqrt((cx - sx) ** 2 + (cy - sy) ** 2);
        if (d < SHAPE_SIZE * 0.7 && d < bestDist) {
          bestDist = d;
          hit = s;
        }
      }
      scale.value = withTiming(1, { duration: 120 });
      if (hit && hit.id === shape.id) {
        runOnJS(onMatched)(shape.id);
      } else {
        tx.value = withSpring(0, { damping: 14 });
        ty.value = withSpring(0, { damping: 14 });
        runOnJS(onMissed)();
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
    zIndex: scale.value > 1 ? 99 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.shape,
          { left: shape.homeX, top: shape.homeY },
          style,
        ]}
      >
        <ShapeIcon kind={shape.kind} color={shape.color} />
      </Animated.View>
    </GestureDetector>
  );
};

const ShadowMatcherScreen: React.FC = () => {
  const meta = gameById('shadowMatcher');
  const store = useGameStore();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [showIntro, setShowIntro] = useState(true);
  const [tier, setTier] = useState(0);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [errors, setErrors] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Drag each shape onto its shadow');
  const [timeLeft, setTimeLeft] = useState(40);
  const [running, setRunning] = useState(false);
  const [matched, setMatched] = useState<Record<string, true>>({});
  const [shapes, setShapes] = useState<ShapeItem[]>([]);
  const [shadowOrder, setShadowOrder] = useState<ShapeItem[]>([]);
  const [shapeOrder, setShapeOrder] = useState<ShapeItem[]>([]);

  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const matchesInRoundRef = useRef(0);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseTime = useMemo(() => Math.max(20, 50 - tier * 8), [tier]);
  const itemsPerRound = useMemo(() => Math.min(6, 3 + tier), [tier]);

  const buildRound = (rndNum: number) => {
    const count = Math.min(itemsPerRound + Math.floor(rndNum / 3), 7);
    const kinds = shuffle(ALL_SHAPES).slice(0, count);
    const items: ShapeItem[] = kinds.map((k, i) => ({
      id: `r${rndNum}-${i}`,
      kind: k,
      color: SHAPE_COLORS[i % SHAPE_COLORS.length],
    }));
    setShapes(items);
    setShadowOrder(shuffle(items));
    setShapeOrder(shuffle(items));
    setMatched({});
    matchesInRoundRef.current = 0;
    setTimeLeft(Math.max(15, baseTime - rndNum * 2));
    setStatusMessage(`Round ${rndNum} · Match ${count} shapes`);
  };

  const startGame = () => {
    setShowIntro(false);
    setRound(1);
    setScore(0);
    setCombo(0);
    setTotalMatches(0);
    setErrors(0);
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

  const handleMatched = (id: string) => {
    if (matched[id]) return;
    setMatched((prev) => ({ ...prev, [id]: true }));
    matchesInRoundRef.current += 1;
    setCombo((c) => {
      const next = c + 1;
      const gain = 80 + next * 12 + tier * 25;
      setScore((s) => s + gain);
      setStatusMessage(`Snap! +${gain} (${next}x combo)`);
      return next;
    });
    setTotalMatches((t) => t + 1);
    playSfx('success');

    if (matchesInRoundRef.current >= shapes.length) {
      const next = round + 1;
      advanceTimerRef.current && clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        setRound(next);
        buildRound(next);
      }, 700);
    }
  };

  const handleMissed = () => {
    setCombo(0);
    setErrors((e) => e + 1);
    playSfx('failure');
    setStatusMessage('Miss — combo reset');
  };

  const endGame = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setRunning(false);
    const duration = Date.now() - startTimeRef.current;
    const accuracy = totalMatches + errors === 0 ? 1 : totalMatches / (totalMatches + errors);
    const result = store.submitSession({
      gameId: 'shadowMatcher',
      score: totalMatches,
      accuracy,
      combo,
      durationMs: duration,
      difficultyTier: tier,
      skillDeltas: { problem: 12 + tier * 4, focus: 6 + tier * 2, reaction: 6 },
      metricForDaily: { metric: 'accuracy', value: totalMatches },
    });
    nav.replace('GameResult', {
      gameId: 'shadowMatcher',
      score: totalMatches,
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

  // Slot positions in board coordinates
  const slotPositions = useMemo(() => {
    return shadowOrder.map((s, i) => ({
      id: s.id,
      x: SLOT_OFFSET_X,
      y: i * (SHAPE_SIZE + ROW_GAP),
    }));
  }, [shadowOrder]);

  const dragShapes: DragShape[] = useMemo(() => {
    return shapeOrder.map((s, i) => {
      const slot = slotPositions.find((sp) => sp.id === s.id);
      return {
        ...s,
        homeX: SHAPE_OFFSET_X,
        homeY: i * (SHAPE_SIZE + ROW_GAP),
        matched: !!matched[s.id],
        targetX: slot?.x,
        targetY: slot?.y,
      };
    });
  }, [shapeOrder, slotPositions, matched]);

  const boardHeight = Math.max(1, Math.max(shapeOrder.length, shadowOrder.length)) * (SHAPE_SIZE + ROW_GAP);

  return (
    <ScreenWrapper scroll={false} contentStyle={{ padding: 0 }}>
      <GameHud
        title={meta.title}
        score={score}
        combo={combo}
        timer={timeLeft}
        level={round}
        difficultyLabel={meta.difficultyTiers[tier]}
        bestScore={store.bestScores.shadowMatcher}
      />
      <Text style={styles.status}>{statusMessage}</Text>
      <View style={styles.headerRow}>
        <Text style={styles.colLabel}>SHADOWS</Text>
        <Text style={styles.colLabel}>SHAPES</Text>
      </View>
      <View style={[styles.board, { height: boardHeight + 30 }]}>
        {/* Slot column */}
        {slotPositions.map((sp, i) => {
          const shape = shadowOrder[i];
          return (
            <View
              key={sp.id}
              style={[
                styles.slot,
                {
                  left: sp.x,
                  top: sp.y,
                },
                matched[sp.id] && {
                  borderColor: 'rgba(62,230,168,0.5)',
                  backgroundColor: 'rgba(62,230,168,0.1)',
                },
              ]}
            >
              <ShapeIcon kind={shape.kind} color={shape.color} outline />
            </View>
          );
        })}
        {/* Draggable shapes */}
        {dragShapes.map((s) => (
          <Draggable
            key={s.id}
            shape={s}
            slots={slotPositions}
            onMatched={handleMatched}
            onMissed={handleMissed}
          />
        ))}
        <View style={[styles.divider, { height: boardHeight + 30 }]} />
      </View>

      <GameIntro
        visible={showIntro}
        emoji={meta.emoji}
        title={meta.title}
        description={meta.description}
        tips={[
          'Drag each colored shape onto its matching shadow.',
          'Build combos by matching without missing.',
          'New shapes appear and the timer tightens every round.',
          'Wrong drops snap back and reset your combo.',
        ]}
        difficultyLabel={meta.difficultyTiers[tier]}
        difficultyTier={tier}
        difficultyOptions={meta.difficultyTiers}
        onChangeDifficulty={setTier}
        bestScore={store.bestScores.shadowMatcher}
        primaryColor={meta.gradient}
        onStart={startGame}
        onCancel={() => nav.goBack()}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  status: { ...typography.h3, color: palette.text, textAlign: 'center', paddingHorizontal: 16, marginVertical: 6 },
  headerRow: { flexDirection: 'row', paddingHorizontal: BOARD_PAD, marginTop: 6, marginBottom: 6 },
  colLabel: { ...typography.tiny, color: palette.textDim, flex: 1, textAlign: 'center' },
  board: {
    marginHorizontal: BOARD_PAD,
    position: 'relative',
  },
  slot: {
    position: 'absolute',
    width: SHAPE_SIZE,
    height: SHAPE_SIZE,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shape: {
    position: 'absolute',
    width: SHAPE_SIZE,
    height: SHAPE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    position: 'absolute',
    left: COL_W - 0.5,
    top: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});

export default ShadowMatcherScreen;
