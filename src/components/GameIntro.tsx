import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GradientCard from './GradientCard';
import PrimaryButton from './PrimaryButton';
import { gradients, palette, radii, typography } from '../theme';

interface Props {
  visible: boolean;
  emoji: string;
  title: string;
  description: string;
  tips: string[];
  difficultyLabel: string;
  difficultyTier: number;
  onChangeDifficulty: (next: number) => void;
  difficultyOptions: string[];
  bestScore?: number;
  primaryColor: readonly [string, string];
  onStart: () => void;
  onCancel: () => void;
}

const GameIntro: React.FC<Props> = ({
  visible,
  emoji,
  title,
  description,
  tips,
  difficultyLabel,
  difficultyTier,
  onChangeDifficulty,
  difficultyOptions,
  bestScore,
  primaryColor,
  onStart,
  onCancel,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        <GradientCard colors={primaryColor} radius={radii.xl} style={{ padding: 22 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 56 }}>{emoji}</Text>
            <Pressable onPress={onCancel} hitSlop={12}>
              <Ionicons name="close" size={22} color="#fff" />
            </Pressable>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </GradientCard>

        <View style={{ height: 14 }} />

        <GradientCard>
          <Text style={styles.sectionTitle}>How to play</Text>
          <View style={{ height: 8 }} />
          {tips.map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.bullet}><Text style={styles.bulletText}>{i + 1}</Text></View>
              <Text style={styles.tipText}>{t}</Text>
            </View>
          ))}
        </GradientCard>

        <View style={{ height: 14 }} />

        <GradientCard>
          <Text style={styles.sectionTitle}>Difficulty</Text>
          <View style={{ height: 10 }} />
          <View style={styles.diffRow}>
            {difficultyOptions.map((d, i) => {
              const active = i === difficultyTier;
              return (
                <Pressable key={d} onPress={() => onChangeDifficulty(i)}>
                  <LinearGradient
                    colors={active ? primaryColor : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                    style={[
                      styles.diffChip,
                      active && { borderColor: 'rgba(255,255,255,0.3)' },
                    ]}
                  >
                    <Text style={[styles.diffText, active && { color: '#fff' }]}>{d}</Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
          {bestScore !== undefined && (
            <View style={styles.bestRow}>
              <Ionicons name="trophy" size={14} color={palette.yellow} />
              <Text style={styles.bestLabel}>Personal best: {bestScore}</Text>
            </View>
          )}
        </GradientCard>

        <View style={{ height: 18 }} />
        <PrimaryButton title={`Start ${difficultyLabel}`} icon="play" size="lg" onPress={onStart} />
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 18,
    justifyContent: 'center',
  },
  sheet: {},
  title: { ...typography.display, color: '#fff', marginTop: 8 },
  description: { ...typography.body, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  sectionTitle: { ...typography.h3, color: palette.text },
  tipRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 8 },
  bullet: {
    width: 22,
    height: 22,
    borderRadius: 22,
    backgroundColor: 'rgba(124,92,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: { ...typography.tiny, color: palette.text, fontWeight: '800' },
  tipText: { ...typography.body, color: palette.textDim, flex: 1 },
  diffRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  diffChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  diffText: { ...typography.caption, color: palette.textDim, fontWeight: '700' },
  bestRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  bestLabel: { ...typography.caption, color: palette.textDim },
});

export default GameIntro;
