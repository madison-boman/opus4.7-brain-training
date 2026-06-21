import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import AchievementBadge from '../components/AchievementBadge';
import AvatarOrb from '../components/AvatarOrb';
import GradientCard from '../components/GradientCard';
import PrimaryButton from '../components/PrimaryButton';
import ScreenWrapper from '../components/ScreenWrapper';
import SectionHeader from '../components/SectionHeader';
import StatChip from '../components/StatChip';
import XPBar from '../components/XPBar';
import { ACHIEVEMENTS } from '../data/achievements';
import { useGameStore } from '../store/GameStore';
import { palette, radii, typography } from '../theme';
import { formatNumber, totalXpUpToLevel } from '../utils/helpers';

const ProfileScreen: React.FC = () => {
  const store = useGameStore();
  const [haptics, setHaptics] = useState(true);
  const [sound, setSound] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  const pinned = store.pinnedAchievements
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
    .filter(Boolean);

  const totalSessions = store.sessions.length;
  const minutes = Math.round(store.sessions.reduce((a, s) => a + s.durationMs, 0) / 60000);

  return (
    <ScreenWrapper>
      <View style={{ alignItems: 'center', paddingTop: 8 }}>
        <AvatarOrb initials={store.username[0]} gradient={store.rankGradient} size={120} level={store.level} />
        <Text style={styles.username}>{store.username}</Text>
        <View style={styles.rankRow}>
          <Ionicons name="ribbon" size={14} color={palette.yellow} />
          <Text style={styles.rankTitle}>{store.rankTitle}</Text>
        </View>
      </View>

      <GradientCard colors={store.rankGradient}>
        <Text style={styles.cardLabel}>OVERALL XP</Text>
        <Text style={styles.cardBig}>{formatNumber(store.totalXp)}</Text>
        <View style={{ height: 10 }} />
        <XPBar progress={store.xpProgress} colors={['#fff', 'rgba(255,255,255,0.7)'] as const} trackColor="rgba(0,0,0,0.25)" />
        <View style={styles.xpRow}>
          <Text style={styles.xpText}>Lv {store.level}</Text>
          <Text style={styles.xpText}>
            {store.xpInLevel}/{store.xpForCurrent}
          </Text>
          <Text style={styles.xpText}>Lv {store.level + 1}</Text>
        </View>
      </GradientCard>

      <View style={styles.statsRow}>
        <StatChip icon="play" label="Sessions" value={totalSessions} color={palette.primary} />
        <StatChip icon="time" label="Minutes" value={minutes} color={palette.accent} />
        <StatChip icon="flame" label="Streak" value={store.streak} color={palette.orange} />
      </View>
      <View style={styles.statsRow}>
        <StatChip icon="trophy" label="Trophies" value={store.trophies} color={palette.yellow} />
        <StatChip icon="diamond" label="Coins" value={formatNumber(store.brainCoins)} color={palette.accent} />
        <StatChip icon="medal" label="Best Streak" value={store.longestStreak} color={palette.pink} />
      </View>

      <SectionHeader title="Showcase" subtitle="Pinned achievements appear on your profile" />
      <GradientCard>
        {pinned.length === 0 ? (
          <Text style={{ ...typography.body, color: palette.textDim }}>
            Pin achievements from the Achievements tab to feature them here.
          </Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {pinned.map((a) => (
              <AchievementBadge key={a!.id} achievement={a!} unlocked size="sm" />
            ))}
          </View>
        )}
      </GradientCard>

      <SectionHeader title="Brain Rank Titles" subtitle="Unlock as you level up" />
      <GradientCard>
        {RANK_TITLES.map(({ level, title }) => {
          const unlocked = store.level >= level;
          return (
            <View key={title} style={styles.rankItem}>
              <View style={[styles.rankBadge, unlocked ? styles.rankBadgeUnlocked : styles.rankBadgeLocked]}>
                <Text style={styles.rankNum}>{level}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rankItemTitle, !unlocked && { color: palette.textDim }]}>{title}</Text>
                <Text style={styles.rankItemSub}>
                  {unlocked
                    ? 'Unlocked'
                    : `Reach level ${level} (${totalXpUpToLevel(level) - store.totalXp} XP to go)`}
                </Text>
              </View>
              {unlocked && <Ionicons name="checkmark-circle" size={18} color={palette.green} />}
            </View>
          );
        })}
      </GradientCard>

      <SectionHeader title="Settings" />
      <GradientCard>
        <Toggle label="Haptic Feedback" value={haptics} onChange={setHaptics} icon="pulse" />
        <Toggle label="Sound Effects" value={sound} onChange={setSound} icon="musical-notes" />
        <Toggle label="Daily Reminders" value={reminders} onChange={setReminders} icon="alarm" />
        <Toggle label="Reduce Motion" value={reduceMotion} onChange={setReduceMotion} icon="snow" />
      </GradientCard>

      <View style={{ gap: 10 }}>
        <PrimaryButton
          title="Reset Progress"
          icon="refresh"
          variant="ghost"
          onPress={store.resetProgress}
        />
      </View>

      <Text style={styles.version}>NeuroNova v1.0.0</Text>
    </ScreenWrapper>
  );
};

const RANK_TITLES = [
  { level: 1, title: 'Apprentice' },
  { level: 3, title: 'Curious Mind' },
  { level: 6, title: 'Sharp Thinker' },
  { level: 10, title: 'Brain Hacker' },
  { level: 16, title: 'Mind Shaper' },
  { level: 22, title: 'Cognition Master' },
  { level: 30, title: 'Neural Architect' },
  { level: 40, title: 'Synaptic Sage' },
  { level: 50, title: 'Cortex Overlord' },
  { level: 60, title: 'Mind Sovereign' },
];

const Toggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void; icon: any }> = ({
  label,
  value,
  onChange,
  icon,
}) => (
  <View style={styles.toggleRow}>
    <View style={[styles.toggleIcon, { backgroundColor: 'rgba(124,92,255,0.18)' }]}>
      <Ionicons name={icon} size={16} color={palette.primary} />
    </View>
    <Text style={styles.toggleLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: 'rgba(255,255,255,0.1)', true: palette.primary }}
      thumbColor="#fff"
    />
  </View>
);

const styles = StyleSheet.create({
  username: { ...typography.h1, color: palette.text, marginTop: 14 },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  rankTitle: { ...typography.caption, color: palette.text, fontWeight: '700' },

  cardLabel: { ...typography.tiny, color: 'rgba(255,255,255,0.85)' },
  cardBig: { ...typography.display, color: '#fff' },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  xpText: { ...typography.tiny, color: 'rgba(255,255,255,0.85)' },

  statsRow: { flexDirection: 'row', gap: 10 },

  rankItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rankBadgeUnlocked: { backgroundColor: 'rgba(255,209,102,0.2)', borderColor: 'rgba(255,209,102,0.5)' },
  rankBadgeLocked: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' },
  rankNum: { ...typography.caption, color: palette.text, fontWeight: '800' },
  rankItemTitle: { ...typography.h3, color: palette.text },
  rankItemSub: { ...typography.tiny, color: palette.textDim, marginTop: 2 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  toggleIcon: {
    width: 32,
    height: 32,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: { ...typography.body, color: palette.text, flex: 1 },

  version: { ...typography.tiny, color: palette.textMuted, textAlign: 'center', marginTop: 8 },
});

export default ProfileScreen;
