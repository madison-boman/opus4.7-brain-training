import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette, shadow, typography } from '../theme';

interface Props {
  initials: string;
  gradient: readonly [string, string];
  size?: number;
  level?: number;
}

const AvatarOrb: React.FC<Props> = ({ initials, gradient, size = 64, level }) => {
  return (
    <View style={[shadow.glow(gradient[0]), { width: size, height: size, borderRadius: size }]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.orb,
          { width: size, height: size, borderRadius: size },
        ]}
      >
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
      </LinearGradient>
      {level !== undefined && (
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  orb: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  initials: { ...typography.h2, color: '#fff', fontWeight: '800' },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    minWidth: 26,
    height: 26,
    paddingHorizontal: 6,
    borderRadius: 26,
    backgroundColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.bg,
  },
  levelText: { color: palette.bg, fontWeight: '900', fontSize: 12 },
});

export default AvatarOrb;
