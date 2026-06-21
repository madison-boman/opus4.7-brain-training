import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import GradientCard from '../components/GradientCard';
import PrimaryButton from '../components/PrimaryButton';
import ScreenWrapper from '../components/ScreenWrapper';
import { ACHIEVEMENTS } from '../data/achievements';
import { useGameStore } from '../store/GameStore';
import { palette, radii, shadow, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

const AchievementDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'AchievementDetail'>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const store = useGameStore();
  const ach = ACHIEVEMENTS.find((a) => a.id === route.params.id);

  if (!ach) return null;
  const unlockedAt = store.unlockedAchievements[ach.id];
  const unlocked = !!unlockedAt;
  const isPinned = store.pinnedAchievements.includes(ach.id);

  return (
    <ScreenWrapper>
      <Pressable onPress={() => nav.goBack()} hitSlop={10} style={styles.back}>
        <Ionicons name="chevron-back" size={20} color={palette.text} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <GradientCard colors={unlocked ? ach.gradient : ['#202043', '#13132B']} radius={radii.xl} style={{ alignItems: 'center', padding: 30 }}>
        <View style={[styles.iconBig, shadow.glow(ach.gradient[0])]}>
          <LinearGradient
            colors={unlocked ? ach.gradient : ['#202043', '#13132B']}
            style={[StyleSheet.absoluteFill, { borderRadius: 36 }]}
          />
          <Ionicons name={ach.icon as any} size={50} color="#fff" />
        </View>
        <Text style={styles.title}>{ach.title}</Text>
        <Text style={styles.desc}>{ach.description}</Text>
        {ach.trophy && (
          <View style={styles.trophyChip}>
            <Ionicons name="trophy" size={14} color="#fff" />
            <Text style={styles.trophyText}>{ach.trophy.toUpperCase()} TROPHY</Text>
          </View>
        )}
      </GradientCard>

      <GradientCard>
        <Row label="Status" value={unlocked ? 'Unlocked' : 'Locked'} valueColor={unlocked ? palette.green : palette.textDim} />
        <Divider />
        <Row label="Reward" value={`+${ach.xpReward} XP`} valueColor={palette.yellow} />
        <Divider />
        <Row label="Category" value={ach.category[0].toUpperCase() + ach.category.slice(1)} />
        {unlockedAt && (
          <>
            <Divider />
            <Row label="Earned" value={new Date(unlockedAt).toLocaleDateString()} />
          </>
        )}
      </GradientCard>

      <PrimaryButton
        title={isPinned ? 'Unpin from Profile' : 'Pin to Profile'}
        icon={isPinned ? 'bookmark' : 'bookmark-outline'}
        variant={unlocked ? 'primary' : 'ghost'}
        disabled={!unlocked}
        onPress={() => store.togglePinAchievement(ach.id)}
      />
    </ScreenWrapper>
  );
};

const Row: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
  </View>
);

const Divider: React.FC = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  backText: { ...typography.body, color: palette.text },
  iconBig: {
    width: 96,
    height: 96,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: { ...typography.display, color: '#fff', marginTop: 18 },
  desc: { ...typography.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 6 },
  trophyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginTop: 18,
  },
  trophyText: { ...typography.tiny, color: '#fff', fontWeight: '800' },

  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  rowLabel: { ...typography.body, color: palette.textDim },
  rowValue: { ...typography.h3, color: palette.text },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
});

export default AchievementDetailScreen;
