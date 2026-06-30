import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import GradientCard from '../components/GradientCard';
import LineChart from '../components/LineChart';
import ScreenWrapper from '../components/ScreenWrapper';
import SectionHeader from '../components/SectionHeader';
import SkillRadar from '../components/SkillRadar';
import { VISIBLE_GAMES, gameById, SKILL_META, SkillKey } from '../data/games';
import { useGameStore } from '../store/GameStore';
import { gradients, palette, radii, typography } from '../theme';
import { formatNumber, prettyDate } from '../utils/helpers';

const SKILLS: SkillKey[] = ['memory', 'focus', 'reaction', 'logic', 'problem'];

const ProgressScreen: React.FC = () => {
  const store = useGameStore();
  const [skill, setSkill] = useState<SkillKey>('memory');

  const series = useMemo(
    () => store.skillHistory.map((s) => s.values[skill]),
    [store.skillHistory, skill],
  );
  const labels = useMemo(
    () => store.skillHistory.map((s) => prettyDate(new Date(s.date))),
    [store.skillHistory],
  );

  const overallPercentile = useMemo(() => {
    const cur = series[series.length - 1] ?? 0;
    return Math.min(99, Math.max(1, Math.round((cur / 1500) * 100)));
  }, [series]);

  const totalSessions = store.sessions.length;
  const totalMinutes = useMemo(
    () => Math.round(store.sessions.reduce((acc, s) => acc + s.durationMs, 0) / 60000),
    [store.sessions],
  );
  const avgAccuracy = useMemo(() => {
    if (store.sessions.length === 0) return 0;
    return store.sessions.reduce((acc, s) => acc + s.accuracy, 0) / store.sessions.length;
  }, [store.sessions]);

  const gamePerformance = useMemo(() => {
    return VISIBLE_GAMES.map((g) => {
      const sessions = store.sessions.filter((s) => s.gameId === g.id);
      const avg = sessions.length === 0 ? 0 : sessions.reduce((a, s) => a + s.score, 0) / sessions.length;
      const best = store.bestScores[g.id] ?? 0;
      return { game: g, sessions: sessions.length, avg, best };
    }).sort((a, b) => b.sessions - a.sessions);
  }, [store.sessions, store.bestScores]);

  const width = Dimensions.get('window').width - 36 - 36;

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Your Progress</Text>
      <Text style={styles.subtitle}>Track every cognitive metric you train</Text>

      <GradientCard colors={gradients.galaxy} radius={radii.xl} style={{ padding: 22 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View>
            <Text style={styles.heroLabel}>Cognitive Index</Text>
            <Text style={styles.heroValue}>{series[series.length - 1] ?? '—'}</Text>
            <Text style={styles.heroPercentile}>Top {100 - overallPercentile}% of users</Text>
          </View>
          <View style={{ flex: 1 }} />
          <SkillRadar values={store.skills} size={170} />
        </View>
      </GradientCard>

      {/* Stats overview */}
      <View style={styles.summaryRow}>
        <SummaryCard icon="play" label="Sessions" value={totalSessions} color={palette.primary} />
        <SummaryCard icon="time" label="Minutes" value={totalMinutes} color={palette.accent} />
        <SummaryCard
          icon="locate"
          label="Accuracy"
          value={`${Math.round(avgAccuracy * 100)}%`}
          color={palette.green}
        />
      </View>

      <SectionHeader title="Skill Trends" subtitle="Last 14 days" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {SKILLS.map((s) => {
          const active = s === skill;
          return (
            <Pressable key={s} onPress={() => setSkill(s)}>
              <View style={[styles.skillChip, active && { backgroundColor: SKILL_META[s].color, borderColor: SKILL_META[s].color }]}>
                <Ionicons name={SKILL_META[s].icon as any} size={14} color={active ? '#fff' : SKILL_META[s].color} />
                <Text style={[styles.skillChipText, active && { color: '#fff' }]}>{SKILL_META[s].label}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <GradientCard>
        <Text style={styles.chartTitle}>{SKILL_META[skill].label}</Text>
        <Text style={styles.chartSub}>
          Current {series[series.length - 1]} · Δ {series[series.length - 1] - series[0] >= 0 ? '+' : ''}
          {series[series.length - 1] - series[0]} over period
        </Text>
        <LineChart data={series} width={width} height={150} color={SKILL_META[skill].color} />
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>{labels[0]}</Text>
          <Text style={styles.dateLabel}>{labels[Math.floor(labels.length / 2)]}</Text>
          <Text style={styles.dateLabel}>{labels[labels.length - 1]}</Text>
        </View>
      </GradientCard>

      {/* Skill breakdown */}
      <SectionHeader title="Skill Breakdown" />
      <View style={{ gap: 10 }}>
        {SKILLS.map((s) => {
          const v = store.skills[s];
          const pct = Math.min(1, Math.max(0.05, (v - 200) / 1300));
          return (
            <GradientCard key={s} colors={gradients.card} style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.skillIcon, { backgroundColor: SKILL_META[s].color + '24', borderColor: SKILL_META[s].color + '70' }]}>
                  <Ionicons name={SKILL_META[s].icon as any} size={18} color={SKILL_META[s].color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.skillName}>{SKILL_META[s].label}</Text>
                  <Text style={styles.skillSub}>Score {v}</Text>
                  <View style={styles.barTrack}>
                    <LinearGradient
                      colors={[SKILL_META[s].color, SKILL_META[s].color + '88']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ height: 8, borderRadius: 8, width: `${pct * 100}%` }}
                    />
                  </View>
                </View>
                <Text style={styles.percentile}>{Math.round(pct * 100)}%</Text>
              </View>
            </GradientCard>
          );
        })}
      </View>

      {/* Per-game performance */}
      <SectionHeader title="Game Performance" />
      <View style={{ gap: 10 }}>
        {gamePerformance.map(({ game, sessions, avg, best }) => (
          <GradientCard key={game.id} colors={gradients.card} style={{ padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 30 }}>{game.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.gameName}>{game.title}</Text>
                <Text style={styles.gameSub}>
                  {sessions} sessions · avg {formatNumber(Math.round(avg))} · best {formatNumber(best)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.textDim} />
            </View>
          </GradientCard>
        ))}
      </View>

      {/* Recent sessions list */}
      <SectionHeader title="Session Log" />
      <View style={{ gap: 8 }}>
        {store.sessions.slice(0, 8).map((s) => {
          const meta = gameById(s.gameId);
          return (
            <GradientCard key={s.id} colors={gradients.card} style={{ padding: 12 }}>
              <View style={styles.logRow}>
                <Text style={{ fontSize: 22 }}>{meta.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logTitle}>{meta.title}</Text>
                  <Text style={styles.logSub}>
                    {prettyDate(new Date(s.timestamp))} · {Math.round(s.accuracy * 100)}% acc · {s.combo}x combo
                  </Text>
                </View>
                <Text style={styles.logScore}>{formatNumber(s.score)}</Text>
              </View>
            </GradientCard>
          );
        })}
      </View>
    </ScreenWrapper>
  );
};

const SummaryCard: React.FC<{ icon: any; label: string; value: number | string; color: string }> = ({
  icon,
  label,
  value,
  color,
}) => (
  <View style={styles.summaryCard}>
    <View style={[styles.summaryIcon, { backgroundColor: color + '24', borderColor: color + '70' }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  title: { ...typography.display, color: palette.text },
  subtitle: { ...typography.caption, color: palette.textDim, marginTop: 4 },

  heroLabel: { ...typography.tiny, color: 'rgba(255,255,255,0.85)' },
  heroValue: { ...typography.display, color: '#fff', marginTop: 2 },
  heroPercentile: { ...typography.caption, color: 'rgba(255,255,255,0.85)' },

  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  summaryValue: { ...typography.h2, color: palette.text },
  summaryLabel: { ...typography.tiny, color: palette.textDim },

  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  skillChipText: { ...typography.caption, color: palette.text, fontWeight: '700' },

  chartTitle: { ...typography.h3, color: palette.text },
  chartSub: { ...typography.caption, color: palette.textDim, marginTop: 4, marginBottom: 12 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  dateLabel: { ...typography.tiny, color: palette.textDim },

  skillIcon: {
    width: 38,
    height: 38,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  skillName: { ...typography.h3, color: palette.text },
  skillSub: { ...typography.caption, color: palette.textDim, marginTop: 2 },
  barTrack: {
    marginTop: 8,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  percentile: { ...typography.h3, color: palette.text },

  gameName: { ...typography.h3, color: palette.text },
  gameSub: { ...typography.caption, color: palette.textDim, marginTop: 2 },

  logRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logTitle: { ...typography.h3, color: palette.text },
  logSub: { ...typography.caption, color: palette.textDim, marginTop: 2 },
  logScore: { ...typography.h3, color: palette.text },
});

export default ProgressScreen;
