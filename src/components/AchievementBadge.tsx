import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { palette, radii, shadow, typography } from '../theme';
import { AchievementDef } from '../data/achievements';

interface Props {
  achievement: AchievementDef;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
  pinned?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

const sizeMap = {
  sm: { box: 78, icon: 22 },
  md: { box: 96, icon: 28 },
  lg: { box: 116, icon: 34 },
};

const AchievementBadge: React.FC<Props> = ({
  achievement,
  unlocked,
  size = 'md',
  pinned,
  onPress,
  onLongPress,
  style,
}) => {
  const { box, icon } = sizeMap[size];
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        { opacity: pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <View style={[styles.shadowWrap, shadow.card]}>
        <LinearGradient
          colors={unlocked ? achievement.gradient : ['#202043', '#13132B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.badge,
            { width: box, height: box, borderRadius: box * 0.32 },
          ]}
        >
          <Ionicons
            name={achievement.icon as any}
            size={icon}
            color={unlocked ? '#fff' : palette.textDim}
          />
          {achievement.trophy && unlocked && (
            <View style={[styles.trophy, { backgroundColor: trophyColor(achievement.trophy) }]}>
              <Ionicons name="trophy" size={10} color="#1a1a1a" />
            </View>
          )}
          {pinned && (
            <View style={styles.pin}>
              <Ionicons name="bookmark" size={10} color={palette.bg} />
            </View>
          )}
        </LinearGradient>
      </View>
      <Text numberOfLines={1} style={[styles.title, !unlocked && { color: palette.textDim }]}>
        {achievement.title}
      </Text>
    </Pressable>
  );
};

const trophyColor = (t: 'bronze' | 'silver' | 'gold' | 'platinum') =>
  t === 'platinum' ? '#E5E4E2' : t === 'gold' ? '#FFD166' : t === 'silver' ? '#C9CDD4' : '#CD7F32';

const styles = StyleSheet.create({
  shadowWrap: { borderRadius: radii.lg, alignItems: 'center' },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  title: {
    ...typography.tiny,
    color: palette.text,
    textTransform: 'none',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 100,
  },
  trophy: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0B0B1F',
  },
  pin: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 18,
    height: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD166',
  },
});

export default AchievementBadge;
