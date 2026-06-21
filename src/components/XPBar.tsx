import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { gradients, palette, radii } from '../theme';

interface Props {
  progress: number; // 0-1
  height?: number;
  colors?: readonly [string, string];
  trackColor?: string;
  shimmer?: boolean;
}

const XPBar: React.FC<Props> = ({
  progress,
  height = 12,
  colors = gradients.primary,
  trackColor = 'rgba(255,255,255,0.08)',
  shimmer = true,
}) => {
  const sv = useSharedValue(0);
  useEffect(() => {
    sv.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: 700 });
  }, [progress, sv]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${sv.value * 100}%`,
  }));

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height }]}>
      <Animated.View style={[StyleSheet.absoluteFill, animStyle, { borderRadius: height, overflow: 'hidden' }]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: height }]}
        />
        {shimmer && <View style={[styles.shimmer, { borderRadius: height }]} pointerEvents="none" />}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.18)',
    transform: [{ skewX: '-20deg' }],
    opacity: 0.25,
  },
});

export default XPBar;

export const palettePill = palette;
