import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { palette, radii, typography } from '../theme';

interface Props {
  title: string;
  score: number;
  combo: number;
  timer?: number;
  level?: number;
  difficultyLabel?: string;
  bestScore?: number;
}

const GameHud: React.FC<Props> = ({ title, score, combo, timer, level, difficultyLabel, bestScore }) => {
  const nav = useNavigation();
  const scoreScale = useSharedValue(1);
  const comboScale = useSharedValue(1);

  useEffect(() => {
    scoreScale.value = withSequence(
      withTiming(1.18, { duration: 120 }),
      withTiming(1, { duration: 200 }),
    );
  }, [score, scoreScale]);

  useEffect(() => {
    comboScale.value = withSequence(
      withTiming(1.25, { duration: 120 }),
      withTiming(1, { duration: 220 }),
    );
  }, [combo, comboScale]);

  const scoreStyle = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));
  const comboStyle = useAnimatedStyle(() => ({ transform: [{ scale: comboScale.value }] }));

  return (
    <View style={styles.root}>
      <Pressable hitSlop={10} onPress={() => nav.goBack()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={20} color="#fff" />
      </Pressable>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={styles.title}>{title}</Text>
        {difficultyLabel && <Text style={styles.subtitle}>{difficultyLabel}</Text>}
      </View>
      <View style={styles.right}>
        <View style={styles.box}>
          <Text style={styles.boxLabel}>SCORE</Text>
          <Animated.Text style={[styles.boxValue, scoreStyle]}>{score}</Animated.Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        {timer !== undefined && (
          <View style={[styles.pill, { backgroundColor: 'rgba(255,94,122,0.18)', borderColor: 'rgba(255,94,122,0.4)' }]}>
            <Ionicons name="timer-outline" size={14} color={palette.red} />
            <Text style={[styles.pillText, { color: palette.red }]}>{Math.ceil(timer)}s</Text>
          </View>
        )}
        {level !== undefined && (
          <View style={[styles.pill, { backgroundColor: 'rgba(124,92,255,0.18)', borderColor: 'rgba(124,92,255,0.4)' }]}>
            <Ionicons name="layers" size={14} color={palette.primary} />
            <Text style={[styles.pillText, { color: palette.primary }]}>Round {level}</Text>
          </View>
        )}
        <Animated.View
          style={[
            styles.pill,
            comboStyle,
            { backgroundColor: 'rgba(255,209,102,0.18)', borderColor: 'rgba(255,209,102,0.4)' },
          ]}
        >
          <Ionicons name="flame" size={14} color={palette.yellow} />
          <Text style={[styles.pillText, { color: palette.yellow }]}>{combo}x combo</Text>
        </Animated.View>
        {bestScore !== undefined && (
          <View style={[styles.pill, { backgroundColor: 'rgba(34,211,238,0.14)', borderColor: 'rgba(34,211,238,0.4)' }]}>
            <Ionicons name="trophy" size={14} color={palette.accent} />
            <Text style={[styles.pillText, { color: palette.accent }]}>Best {bestScore}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: { ...typography.h3, color: palette.text },
  subtitle: { ...typography.tiny, color: palette.textDim, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  box: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    minWidth: 80,
  },
  boxLabel: { ...typography.tiny, color: palette.textDim, fontSize: 9 },
  boxValue: { ...typography.h3, color: palette.text },
  bottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    marginTop: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { ...typography.tiny, fontWeight: '800' },
});

export default GameHud;
