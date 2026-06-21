import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const COLORS = ['#7C5CFF', '#22D3EE', '#FF6BCB', '#FFD166', '#3EE6A8', '#FF9F4A', '#4F8DFF'];

interface Piece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotateStart: number;
  rotateEnd: number;
  color: string;
  size: number;
  drift: number;
}

const ConfettiPiece: React.FC<{ piece: Piece; height: number }> = ({ piece, height }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      piece.delay,
      withTiming(1, { duration: piece.duration, easing: Easing.out(Easing.quad) }),
    );
  }, [piece.delay, piece.duration, progress]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: progress.value * height },
      { translateX: Math.sin(progress.value * 6) * piece.drift },
      {
        rotate:
          (piece.rotateStart + (piece.rotateEnd - piece.rotateStart) * progress.value) + 'deg',
      },
    ],
    opacity: 1 - Math.max(0, progress.value - 0.85) * 6,
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        animStyle,
        {
          left: piece.x,
          width: piece.size,
          height: piece.size * 0.4,
          backgroundColor: piece.color,
        },
      ]}
    />
  );
};

interface Props {
  count?: number;
  active?: boolean;
}

const Confetti: React.FC<Props> = ({ count = 60, active = true }) => {
  const { width, height } = Dimensions.get('window');
  const pieces = useMemo<Piece[]>(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * width,
      delay: Math.random() * 700,
      duration: 1600 + Math.random() * 1800,
      rotateStart: Math.random() * 360,
      rotateEnd: 360 + Math.random() * 720,
      color: COLORS[i % COLORS.length],
      size: 8 + Math.random() * 12,
      drift: 30 + Math.random() * 60,
    }));
  }, [count, width]);

  if (!active) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} piece={p} height={height + 40} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: -20,
    borderRadius: 2,
  },
});

export default Confetti;
