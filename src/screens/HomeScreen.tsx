import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { VISIBLE_GAMES, gameById, SKILL_META, SkillKey } from '../data/games';
import { useGameStore } from '../store/GameStore';
import { gradients, palette, radii, shadow, typography } from '../theme';
import { formatNumber } from '../utils/helpers';
import AvatarOrb from '../components/AvatarOrb';
import GradientCard from '../components/GradientCard';
import ScreenWrapper from '../components/ScreenWrapper';
import SectionHeader from '../components/SectionHeader';
import Sparkline from '../components/Sparkline';
import StatChip from '../components/StatChip';
import XPBar from '../components/XPBar';
import { RootStackParamList } from '../navigation/types';

const HomeScreen: React.FC = () => {
  const store = useGameStore();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const recentSessions = useMemo(() => store.sessions.slice(0, 3), [store.sessions]);

  const recommended = useMemo(() => {
    const skillEntries = (Object.entries(store.skills) as [SkillKey, number][]).sort(
      (a, b) => a[1] - b[1],
    );
    const weakest = skillEntries[0]?.[0];
    return VISIBLE_GAMES.filter((g) => g.unlockLevel <= store.level && g.primarySkill === weakest)
      .concat(VISIBLE_GAMES.filter((g) => g.unlockLevel <= store.level))
      .slice(0, 3);
  }, [store.skills, store.level]);

  const skillSeries = useMemo(() => {
    const sumLast7 = store.skillHistory.slice(-7);
    return sumLast7.map((s) =>
      Math.round(
        (s.values.memory + s.values.focus + s.values.reaction + s.values.logic + s.values.problem) /
          5,
      ),
    );
  }, [store.skillHistory]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return 'Late night training';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Late night session';
  }, []);

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greet}>{greeting}</Text>
          <Text style={styles.username}>{store.username}</Text>
        </View>
        <Pressable hitSlop={8} style={styles.bell}>
          <Ionicons name="notifications-outline" size={20} color={palette.text} />
          <View style={styles.bellDot} />
        </Pressable>
        <AvatarOrb initials={store.username[0]} gradient={store.rankGradient} size={54} level={store.level} />
      </View>

      {/* Hero rank/XP */}
      <GradientCard colors={store.rankGradient} radius={radii.xl} style={{ padding: 22 }}>
        <View style={styles.rankRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rankLabel}>BRAIN RANK</Text>
            <Text style={styles.rankTitle}>{store.rankTitle}</Text>
            <Text style={styles.rankSub}>
              Level {store.level} • {formatNumber(store.totalXp)} XP total
            </Text>
          </View>
          <View style={styles.brainIcon}>
            <Ionicons name="sparkles" size={26} color="#fff" />
          </View>
        </View>
        <View style={{ height: 16 }} />
        <XPBar progress={store.xpProgress} colors={['#fff', 'rgba(255,255,255,0.7)'] as const} trackColor="rgba(0,0,0,0.25)" />
        <View style={styles.xpRow}>
          <Text style={styles.xpText}>
            {store.xpInLevel} / {store.xpForCurrent} XP
          </Text>
          <Text style={styles.xpText}>
            Lv {store.level + 1} in {Math.max(0, store.xpForCurrent - store.xpInLevel)} XP
          </Text>
        </View>
      </GradientCard>

      {/* Streak / coins / trophies */}
      <View style={styles.statsRow}>
        <StatChip emoji="🔥" label="Day Streak" value={store.streak} color={palette.orange} />
        <StatChip icon="diamond" label="Coins" value={formatNumber(store.brainCoins)} color={palette.accent} />
        <StatChip icon="trophy" label="Trophies" value={store.trophies} color={palette.yellow} />
      </View>

      {/* Daily challenges */}
      <SectionHeader title="Daily Challenges" subtitle="Refreshes in 6h 22m" actionLabel="Refresh" onAction={store.refreshDailies} />
      <View style={{ gap: 12 }}>
        {store.dailies.map((d) => {
          const game = gameById(d.gameId);
          const pct = Math.min(1, d.progress / d.goal);
          return (
            <Pressable
              key={d.id}
              onPress={() => nav.navigate('Game', { gameId: d.gameId })}
              style={({ pressed }) => [pressed && { transform: [{ scale: 0.98 }] }]}
            >
              <GradientCard colors={d.completed ? gradients.forest : gradients.card} style={{ padding: 16 }}>
                <View style={styles.dailyRow}>
                  <View style={[styles.dailyIcon, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                    <Text style={{ fontSize: 24 }}>{d.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dailyTitle}>{d.title}</Text>
                    <Text style={styles.dailyDesc}>{d.description}</Text>
                    <View style={{ height: 8 }} />
                    <XPBar
                      progress={pct}
                      height={8}
                      colors={d.completed ? gradients.forest : game.gradient}
                    />
                  </View>
                  <View style={styles.dailyReward}>
                    <Ionicons name="flash" size={14} color={palette.yellow} />
                    <Text style={styles.dailyXp}>+{d.xpReward}</Text>
                  </View>
                </View>
              </GradientCard>
            </Pressable>
          );
        })}
      </View>

      {/* Recommended */}
      <SectionHeader
        title="Recommended for You"
        subtitle="Based on your skill profile"
        actionLabel="See all"
        onAction={() => (nav.getParent() as any)?.navigate('Tabs', { screen: 'Games' })}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: 4 }}>
        {recommended.map((g) => (
          <Pressable key={g.id} onPress={() => nav.navigate('Game', { gameId: g.id })}>
            <LinearGradient
              colors={g.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.recCard, shadow.card]}
            >
              <Text style={{ fontSize: 28 }}>{g.emoji}</Text>
              <Text style={styles.recTitle}>{g.title}</Text>
              <Text style={styles.recTag}>{g.tagline}</Text>
              <View style={styles.recBadge}>
                <Ionicons name={SKILL_META[g.primarySkill].icon as any} size={12} color="#fff" />
                <Text style={styles.recBadgeText}>{SKILL_META[g.primarySkill].label}</Text>
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>

      {/* Recent performance */}
      <SectionHeader
        title="Recent Performance"
        subtitle="Last 7 days · cognitive index"
        actionLabel="Details"
        onAction={() => (nav.getParent() as any)?.navigate('Tabs', { screen: 'Progress' })}
      />
      <GradientCard colors={gradients.card}>
        <View style={styles.perfHeader}>
          <View>
            <Text style={styles.perfBig}>
              {skillSeries[skillSeries.length - 1] ?? '—'}
            </Text>
            <Text style={styles.perfLabel}>Avg cognitive index</Text>
          </View>
          <View style={styles.perfChange}>
            <Ionicons name="trending-up" size={16} color={palette.green} />
            <Text style={[styles.perfDelta, { color: palette.green }]}>
              +
              {Math.max(
                0,
                (skillSeries[skillSeries.length - 1] ?? 0) - (skillSeries[0] ?? 0),
              )}{' '}
              this week
            </Text>
          </View>
        </View>
        <View style={{ height: 8 }} />
        <Sparkline data={skillSeries} width={300} height={70} color={palette.accent} />
      </GradientCard>

      {/* Recent sessions */}
      <SectionHeader title="Recent Sessions" />
      <View style={{ gap: 10 }}>
        {recentSessions.length === 0 && (
          <GradientCard>
            <Text style={{ ...typography.body, color: palette.textDim }}>
              No sessions yet. Start a game to see your activity.
            </Text>
          </GradientCard>
        )}
        {recentSessions.map((s) => {
          const meta = gameById(s.gameId);
          return (
            <GradientCard key={s.id} colors={gradients.card} style={{ padding: 14 }}>
              <View style={styles.sessionRow}>
                <View style={[styles.sessIcon, { backgroundColor: meta.gradient[0] + '40' }]}>
                  <Text style={{ fontSize: 22 }}>{meta.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessTitle}>{meta.title}</Text>
                  <Text style={styles.sessSub}>
                    {Math.round(s.accuracy * 100)}% acc · {s.combo}x combo · +{s.xpEarned} XP
                  </Text>
                </View>
                <Text style={styles.sessScore}>{formatNumber(s.score)}</Text>
              </View>
            </GradientCard>
          );
        })}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greet: { ...typography.caption, color: palette.textDim },
  username: { ...typography.h1, color: palette.text },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: palette.pink,
  },

  rankRow: { flexDirection: 'row', alignItems: 'center' },
  rankLabel: { ...typography.tiny, color: 'rgba(255,255,255,0.8)' },
  rankTitle: { ...typography.display, color: '#fff', marginTop: 2 },
  rankSub: { ...typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  brainIcon: {
    width: 56,
    height: 56,
    borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  xpText: { ...typography.tiny, color: 'rgba(255,255,255,0.85)' },

  statsRow: { flexDirection: 'row', gap: 10 },

  dailyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dailyIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dailyTitle: { ...typography.h3, color: palette.text },
  dailyDesc: { ...typography.caption, color: palette.textDim, marginTop: 2 },
  dailyReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,209,102,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,209,102,0.4)',
  },
  dailyXp: { ...typography.tiny, color: palette.yellow, fontWeight: '800' },

  recCard: {
    width: 180,
    height: 180,
    padding: 16,
    borderRadius: 24,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  recTitle: { ...typography.h2, color: '#fff' },
  recTag: { ...typography.caption, color: 'rgba(255,255,255,0.85)' },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  recBadgeText: { ...typography.tiny, color: '#fff' },

  perfHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  perfBig: { ...typography.display, color: palette.text },
  perfLabel: { ...typography.caption, color: palette.textDim },
  perfChange: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  perfDelta: { ...typography.caption, fontWeight: '700' },

  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessTitle: { ...typography.h3, color: palette.text },
  sessSub: { ...typography.caption, color: palette.textDim, marginTop: 2 },
  sessScore: { ...typography.h2, color: palette.text },
});

export default HomeScreen;
