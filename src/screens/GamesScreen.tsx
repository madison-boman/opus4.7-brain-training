import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import GradientCard from '../components/GradientCard';
import ScreenWrapper from '../components/ScreenWrapper';
import { GAMES, SKILL_META, SkillKey } from '../data/games';
import { useGameStore } from '../store/GameStore';
import { gradients, palette, radii, shadow, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { formatNumber } from '../utils/helpers';

const FILTERS: { key: 'all' | SkillKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'memory', label: 'Memory' },
  { key: 'focus', label: 'Focus' },
  { key: 'reaction', label: 'Reaction' },
  { key: 'logic', label: 'Logic' },
  { key: 'problem', label: 'Problem' },
];

const GamesScreen: React.FC = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const store = useGameStore();
  const [filter, setFilter] = useState<'all' | SkillKey>('all');

  const filtered = filter === 'all'
    ? GAMES
    : GAMES.filter((g) => g.primarySkill === filter || g.secondarySkill === filter);

  return (
    <ScreenWrapper>
      <View>
        <Text style={typography.tiny}>{' '}</Text>
        <Text style={styles.title}>Training Arena</Text>
        <Text style={styles.subtitle}>5 games · Sharpen every cognitive skill</Text>
      </View>

      {/* Skill filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable key={f.key} onPress={() => setFilter(f.key)}>
              <View style={[styles.filter, active && styles.filterActive]}>
                <Text style={[styles.filterLabel, active && { color: '#fff' }]}>{f.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Featured */}
      <GradientCard colors={gradients.galaxy} radius={radii.xl}>
        <View style={styles.featured}>
          <View style={{ flex: 1 }}>
            <Text style={styles.featuredTag}>FEATURED</Text>
            <Text style={styles.featuredTitle}>The Daily Mix</Text>
            <Text style={styles.featuredDesc}>
              5-minute personalized training session built from your weakest skills.
            </Text>
            <Pressable
              onPress={() => nav.navigate('Game', { gameId: 'lightSequence' })}
              style={({ pressed }) => [styles.featuredBtn, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="play" size={14} color={palette.bg} />
              <Text style={styles.featuredBtnText}>Start Mix</Text>
            </Pressable>
          </View>
          <Text style={{ fontSize: 70 }}>🧠</Text>
        </View>
      </GradientCard>

      {/* Games grid */}
      <View style={{ gap: 14 }}>
        {filtered.map((g) => {
          const locked = g.unlockLevel > store.level;
          const best = store.bestScores[g.id];
          return (
            <Pressable
              key={g.id}
              disabled={locked}
              onPress={() => nav.navigate('Game', { gameId: g.id })}
              style={({ pressed }) => [
                pressed && !locked && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <View style={[shadow.card, { borderRadius: radii.xl }]}>
                <LinearGradient
                  colors={locked ? ['#202043', '#13132B'] : g.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gameCard}
                >
                  <View style={styles.gameLeft}>
                    <View style={styles.gameEmojiWrap}>
                      <Text style={{ fontSize: 38 }}>{g.emoji}</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.gameTitle}>{g.title}</Text>
                      {locked && <Ionicons name="lock-closed" size={14} color="#fff" />}
                    </View>
                    <Text style={styles.gameTagline}>{g.tagline}</Text>
                    <View style={styles.skillRow}>
                      <View style={styles.skillChip}>
                        <Ionicons name={SKILL_META[g.primarySkill].icon as any} size={12} color="#fff" />
                        <Text style={styles.skillChipText}>{SKILL_META[g.primarySkill].label}</Text>
                      </View>
                      <View style={styles.skillChip}>
                        <Ionicons name={SKILL_META[g.secondarySkill].icon as any} size={12} color="#fff" />
                        <Text style={styles.skillChipText}>{SKILL_META[g.secondarySkill].label}</Text>
                      </View>
                    </View>
                    <View style={styles.metaRow}>
                      {locked ? (
                        <Text style={styles.lockText}>Unlock at Level {g.unlockLevel}</Text>
                      ) : (
                        <>
                          <Text style={styles.bestText}>
                            <Ionicons name="trophy" size={12} color="#fff" /> Best{' '}
                            {best ? formatNumber(best) : '—'}
                          </Text>
                          <Text style={styles.tierText}>
                            {g.difficultyTiers[0]} → {g.difficultyTiers[g.difficultyTiers.length - 1]}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  title: { ...typography.display, color: palette.text },
  subtitle: { ...typography.caption, color: palette.textDim, marginTop: 4 },
  filter: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  filterActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  filterLabel: { ...typography.caption, color: palette.textDim, fontWeight: '700' },

  featured: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featuredTag: { ...typography.tiny, color: 'rgba(255,255,255,0.8)' },
  featuredTitle: { ...typography.h1, color: '#fff', marginTop: 2 },
  featuredDesc: { ...typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  featuredBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  featuredBtnText: { ...typography.caption, color: palette.bg, fontWeight: '800' },

  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: radii.xl,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 140,
  },
  gameLeft: {},
  gameEmojiWrap: {
    width: 86,
    height: 86,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  gameTitle: { ...typography.h2, color: '#fff' },
  gameTagline: { ...typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  skillRow: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  skillChipText: { ...typography.tiny, color: '#fff', textTransform: 'none' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, gap: 8 },
  bestText: { ...typography.tiny, color: '#fff' },
  tierText: { ...typography.tiny, color: 'rgba(255,255,255,0.8)' },
  lockText: { ...typography.caption, color: 'rgba(255,255,255,0.85)' },
});

export default GamesScreen;
