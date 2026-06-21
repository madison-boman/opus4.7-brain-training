import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import AchievementBadge from '../components/AchievementBadge';
import Confetti from '../components/Confetti';
import GradientCard from '../components/GradientCard';
import PrimaryButton from '../components/PrimaryButton';
import RewardChest from '../components/RewardChest';
import ScreenWrapper from '../components/ScreenWrapper';
import StatChip from '../components/StatChip';
import XPBar from '../components/XPBar';
import { ACHIEVEMENTS } from '../data/achievements';
import { gameById } from '../data/games';
import { useGameStore } from '../store/GameStore';
import { gradients, palette, radii, typography } from '../theme';
import { formatNumber, formatTime } from '../utils/helpers';
import { RootStackParamList } from '../navigation/types';

const GameResultScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'GameResult'>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const store = useGameStore();
  const params = route.params;
  const meta = gameById(params.gameId);

  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4500);
    return () => clearTimeout(t);
  }, []);

  const unlocked = ACHIEVEMENTS.filter((a) => params.unlockedAchievementIds.includes(a.id));

  const heroScale = useSharedValue(0.7);
  const heroOpacity = useSharedValue(0);
  useEffect(() => {
    heroOpacity.value = withTiming(1, { duration: 400 });
    heroScale.value = withSequence(
      withTiming(1.05, { duration: 360 }),
      withTiming(1, { duration: 200 }),
    );
  }, [heroOpacity, heroScale]);
  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
    opacity: heroOpacity.value,
  }));

  return (
    <ScreenWrapper gradient={['#0B0B1F', '#1B1B38'] as const}>
      <Confetti active={showConfetti} count={70} />

      <Animated.View style={heroStyle}>
        <GradientCard colors={meta.gradient} radius={radii.xl} style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 70 }}>{meta.emoji}</Text>
          <Text style={styles.title}>{params.isNewBest ? 'New Personal Best!' : 'Session Complete'}</Text>
          <Text style={styles.subtitle}>{meta.title}</Text>

          <View style={{ height: 14 }} />

          <View style={styles.scoreRow}>
            <Text style={styles.scoreBig}>{formatNumber(params.score)}</Text>
            <Text style={styles.scoreUnit}>pts</Text>
          </View>
          <Text style={styles.scoreLabel}>final score</Text>
        </GradientCard>
      </Animated.View>

      {/* Stats grid */}
      <View style={styles.grid}>
        <StatChip
          icon="speedometer"
          label="Combo"
          value={`${params.combo}x`}
          color={palette.yellow}
        />
        <StatChip
          icon="locate"
          label="Accuracy"
          value={`${Math.round(params.accuracy * 100)}%`}
          color={palette.green}
        />
        <StatChip
          icon="time"
          label="Time"
          value={formatTime(params.durationMs)}
          color={palette.accent}
        />
      </View>

      {/* XP earned */}
      <GradientCard>
        <View style={styles.xpHead}>
          <View style={styles.xpIcon}>
            <Ionicons name="flash" size={18} color={palette.yellow} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.xpTitle}>+{params.xpEarned} XP earned</Text>
            <Text style={styles.xpSub}>
              Level {store.level} · {store.xpInLevel} / {store.xpForCurrent}
            </Text>
          </View>
          <Text style={styles.coinsLabel}>+{params.brainCoinsEarned} 💎</Text>
        </View>
        <View style={{ height: 10 }} />
        <XPBar progress={store.xpProgress} />
        {params.leveledUp && (
          <LevelUpBanner level={params.newLevel} />
        )}
      </GradientCard>

      {/* Reward chest */}
      <GradientCard colors={gradients.galaxy}>
        <Text style={styles.sectionTitle}>Bonus Chest</Text>
        <Text style={styles.sectionSub}>Tap to claim a daily reward</Text>
        <RewardChest xp={Math.round(params.xpEarned * 0.3)} brainCoins={Math.round(params.brainCoinsEarned * 0.5)} />
      </GradientCard>

      {/* Achievements */}
      {unlocked.length > 0 && (
        <GradientCard>
          <Text style={styles.sectionTitle}>Achievements Unlocked</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingTop: 12 }}>
            {unlocked.map((a) => (
              <BadgeBurst key={a.id} delay={200} achievementId={a.id} />
            ))}
          </ScrollView>
        </GradientCard>
      )}

      {/* Skill deltas */}
      <GradientCard>
        <Text style={styles.sectionTitle}>Skill Boost</Text>
        <Text style={styles.sectionSub}>This session improved your cognitive profile</Text>
        <View style={{ height: 12 }} />
        {Object.entries(store.sessions[0]?.skillDeltas ?? {})
          .filter(([, v]) => (v as number) !== 0)
          .map(([k, v]) => (
            <View key={k} style={styles.deltaRow}>
              <Text style={styles.deltaLabel}>{k.toUpperCase()}</Text>
              <Text style={styles.deltaValue}>+{v as number}</Text>
            </View>
          ))}
      </GradientCard>

      {/* Actions */}
      <View style={{ gap: 10 }}>
        <PrimaryButton
          title="Play Again"
          icon="refresh"
          size="lg"
          onPress={() => nav.replace('Game', { gameId: params.gameId })}
        />
        <PrimaryButton
          title="Back to Games"
          icon="grid"
          variant="ghost"
          onPress={() => {
            nav.popToTop();
            (nav as any).navigate('Tabs', { screen: 'Games' });
          }}
        />
      </View>
    </ScreenWrapper>
  );
};

const LevelUpBanner: React.FC<{ level: number }> = ({ level }) => {
  const sv = useSharedValue(0);
  useEffect(() => {
    sv.value = withSequence(
      withTiming(1, { duration: 500 }),
      withDelay(800, withTiming(1, { duration: 0 })),
    );
  }, [sv]);
  const style = useAnimatedStyle(() => ({
    opacity: sv.value,
    transform: [{ translateY: (1 - sv.value) * 12 }],
  }));
  return (
    <Animated.View style={[styles.levelBanner, style]}>
      <LinearGradient
        colors={gradients.gold}
        style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      <Ionicons name="rocket" size={16} color={palette.bg} />
      <Text style={styles.levelText}>Level Up! Reached Level {level}</Text>
    </Animated.View>
  );
};

const BadgeBurst: React.FC<{ achievementId: string; delay: number }> = ({ achievementId, delay }) => {
  const ach = ACHIEVEMENTS.find((a) => a.id === achievementId);
  const sv = useSharedValue(0);
  useEffect(() => {
    sv.value = withDelay(
      delay,
      withSequence(
        withTiming(1.15, { duration: 280 }),
        withTiming(1, { duration: 220 }),
      ),
    );
  }, [delay, sv]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: Math.max(0.85, sv.value) }],
    opacity: Math.min(1, sv.value),
  }));
  if (!ach) return null;
  return (
    <Animated.View style={style}>
      <AchievementBadge achievement={ach} unlocked size="sm" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  title: { ...typography.h1, color: '#fff', marginTop: 8 },
  subtitle: { ...typography.body, color: 'rgba(255,255,255,0.85)' },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  scoreBig: { fontSize: 64, color: '#fff', fontWeight: '900' },
  scoreUnit: { ...typography.h3, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
  scoreLabel: { ...typography.tiny, color: 'rgba(255,255,255,0.8)' },
  grid: { flexDirection: 'row', gap: 8 },

  xpHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  xpIcon: {
    width: 38,
    height: 38,
    borderRadius: 38,
    backgroundColor: 'rgba(255,209,102,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,209,102,0.4)',
  },
  xpTitle: { ...typography.h3, color: palette.text },
  xpSub: { ...typography.caption, color: palette.textDim, marginTop: 2 },
  coinsLabel: { ...typography.h3, color: palette.accent },

  sectionTitle: { ...typography.h3, color: palette.text },
  sectionSub: { ...typography.caption, color: palette.textDim, marginTop: 4 },

  deltaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  deltaLabel: { ...typography.tiny, color: palette.textDim },
  deltaValue: { ...typography.h3, color: palette.green },

  levelBanner: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  levelText: { ...typography.h3, color: palette.bg, fontWeight: '900' },
});

export default GameResultScreen;
