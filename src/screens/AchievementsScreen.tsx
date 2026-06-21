import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import AchievementBadge from '../components/AchievementBadge';
import GradientCard from '../components/GradientCard';
import ScreenWrapper from '../components/ScreenWrapper';
import SectionHeader from '../components/SectionHeader';
import XPBar from '../components/XPBar';
import { ACHIEVEMENTS, AchievementCategory, AchievementDef } from '../data/achievements';
import { useGameStore } from '../store/GameStore';
import { palette, radii, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

const CATEGORY_LABELS: Record<AchievementCategory | 'all', string> = {
  all: 'All',
  milestone: 'Milestones',
  streak: 'Streaks',
  memory: 'Memory',
  speed: 'Speed',
  logic: 'Logic',
  mastery: 'Mastery',
};

const SLOT_W = 110;
const SLOT_H = 130;

interface PinnedSlotProps {
  achievement: AchievementDef;
  index: number;
  total: number;
  onReorder: (from: number, to: number) => void;
  onPress: () => void;
}

const PinnedSlot: React.FC<PinnedSlotProps> = ({ achievement, index, total, onReorder, onPress }) => {
  const tx = useSharedValue(0);
  const startX = useSharedValue(0);
  const scale = useSharedValue(1);
  const z = useSharedValue(1);

  const pan = Gesture.Pan()
    .activateAfterLongPress(220)
    .onStart(() => {
      startX.value = tx.value;
      scale.value = withTiming(1.12, { duration: 100 });
      z.value = 99;
    })
    .onChange((e) => {
      tx.value = startX.value + e.translationX;
    })
    .onEnd(() => {
      const slotsMoved = Math.round(tx.value / SLOT_W);
      const newIndex = Math.max(0, Math.min(total - 1, index + slotsMoved));
      tx.value = withSpring(0, { damping: 14 });
      scale.value = withTiming(1);
      z.value = 1;
      if (newIndex !== index) runOnJS(onReorder)(index, newIndex);
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { scale: scale.value }],
    zIndex: z.value,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ width: SLOT_W, height: SLOT_H, alignItems: 'center' }, style]}>
        <AchievementBadge achievement={achievement} unlocked size="md" pinned onPress={onPress} />
      </Animated.View>
    </GestureDetector>
  );
};

const AchievementsScreen: React.FC = () => {
  const store = useGameStore();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<'all' | AchievementCategory>('all');

  const unlockedCount = Object.keys(store.unlockedAchievements).length;
  const total = ACHIEVEMENTS.length;
  const progress = unlockedCount / total;

  const filtered = filter === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter((a) => a.category === filter);

  const pinnedItems = useMemo(
    () =>
      store.pinnedAchievements
        .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
        .filter((a): a is AchievementDef => Boolean(a)),
    [store.pinnedAchievements],
  );

  const handleReorder = (from: number, to: number) => {
    const ids = [...store.pinnedAchievements];
    const [item] = ids.splice(from, 1);
    ids.splice(to, 0, item);
    store.reorderPinned(ids);
  };

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Achievements</Text>
      <Text style={styles.subtitle}>Collect trophies and brain rank rewards</Text>

      <GradientCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy" size={26} color={palette.yellow} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressTitle}>
              {unlockedCount} of {total} unlocked
            </Text>
            <View style={{ height: 8 }} />
            <XPBar progress={progress} />
          </View>
          <View style={styles.trophyCount}>
            <Text style={styles.trophyValue}>{store.trophies}</Text>
            <Text style={styles.trophyLabel}>Trophies</Text>
          </View>
        </View>
      </GradientCard>

      <SectionHeader
        title="Pinned"
        subtitle="Long-press to drag and reorder"
      />
      <GradientCard>
        {pinnedItems.length === 0 ? (
          <Text style={{ ...typography.body, color: palette.textDim }}>
            Pin up to 6 achievements to display them here.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {pinnedItems.map((a, i) => (
                <PinnedSlot
                  key={a.id}
                  achievement={a}
                  index={i}
                  total={pinnedItems.length}
                  onReorder={handleReorder}
                  onPress={() => nav.navigate('AchievementDetail', { id: a.id })}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </GradientCard>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {(Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).map((c) => {
          const active = c === filter;
          return (
            <Pressable key={c} onPress={() => setFilter(c as any)}>
              <View style={[styles.catChip, active && styles.catChipActive]}>
                <Text style={[styles.catChipText, active && { color: '#fff' }]}>
                  {CATEGORY_LABELS[c]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Grid */}
      <View style={styles.grid}>
        {filtered.map((a) => {
          const unlocked = !!store.unlockedAchievements[a.id];
          return (
            <View key={a.id} style={styles.cell}>
              <AchievementBadge
                achievement={a}
                unlocked={unlocked}
                size="md"
                pinned={store.pinnedAchievements.includes(a.id)}
                onPress={() => nav.navigate('AchievementDetail', { id: a.id })}
                onLongPress={() => store.togglePinAchievement(a.id)}
              />
            </View>
          );
        })}
      </View>

      <View style={{ height: 8 }} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  title: { ...typography.display, color: palette.text },
  subtitle: { ...typography.caption, color: palette.textDim, marginTop: 4 },

  trophyCircle: {
    width: 56,
    height: 56,
    borderRadius: 56,
    backgroundColor: 'rgba(255,209,102,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,209,102,0.4)',
  },
  progressTitle: { ...typography.h3, color: palette.text },
  trophyCount: { alignItems: 'flex-end' },
  trophyValue: { ...typography.h1, color: palette.text },
  trophyLabel: { ...typography.tiny, color: palette.textDim },

  catChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  catChipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  catChipText: { ...typography.caption, color: palette.textDim, fontWeight: '700' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  cell: { width: '31%', alignItems: 'center', marginBottom: 8 },
});

export default AchievementsScreen;
