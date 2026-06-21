import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { gradients, palette, radii, shadow, typography } from '../theme';

interface Props {
  xp: number;
  brainCoins: number;
  onOpen?: () => void;
}

const RewardChest: React.FC<Props> = ({ xp, brainCoins, onOpen }) => {
  const [opened, setOpened] = useState(false);
  const wiggle = useSharedValue(0);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (opened) return;
    wiggle.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: 220, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 220 }),
        withTiming(0, { duration: 220 }),
      ),
      -1,
      false,
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      -1,
      true,
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, [opened, wiggle, scale, glow]);

  const chestStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${wiggle.value * 6}deg` },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + glow.value * 0.5,
  }));

  const handleOpen = () => {
    setOpened(true);
    wiggle.value = withTiming(0);
    scale.value = withSequence(
      withTiming(1.25, { duration: 200 }),
      withTiming(1, { duration: 250 }),
    );
    onOpen?.();
  };

  return (
    <Pressable onPress={handleOpen} disabled={opened}>
      <View style={styles.container}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <Animated.View style={[styles.chest, chestStyle, shadow.glow('#FFD166')]}>
          <LinearGradient
            colors={opened ? gradients.gold : gradients.galaxy}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chestInner}
          >
            <Ionicons
              name={opened ? 'gift' : 'lock-closed'}
              size={42}
              color={opened ? palette.bg : '#fff'}
            />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.title}>{opened ? 'Reward Unlocked!' : 'Tap to Open Chest'}</Text>
        {opened && (
          <View style={styles.rewardRow}>
            <View style={styles.rewardChip}>
              <Ionicons name="flash" size={16} color={palette.primary} />
              <Text style={styles.rewardText}>+{xp} XP</Text>
            </View>
            <View style={styles.rewardChip}>
              <Ionicons name="diamond" size={16} color={palette.accent} />
              <Text style={styles.rewardText}>+{brainCoins} Coins</Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 12 },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: '#FFD166',
    top: -30,
    opacity: 0.4,
  },
  chest: { borderRadius: radii.lg, overflow: 'hidden' },
  chestInner: {
    width: 120,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: { ...typography.h3, color: palette.text, marginTop: 14 },
  rewardRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  rewardText: { ...typography.caption, color: palette.text, fontWeight: '700' },
});

export default RewardChest;
