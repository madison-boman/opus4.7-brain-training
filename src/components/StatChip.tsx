import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette, radii, typography } from '../theme';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
  emoji?: string;
}

const StatChip: React.FC<Props> = ({ icon, label, value, color = palette.primary, emoji }) => {
  return (
    <View style={styles.chip}>
      <View style={[styles.iconWrap, { backgroundColor: color + '22', borderColor: color + '55' }]}>
        {emoji ? (
          <Text style={{ fontSize: 16 }}>{emoji}</Text>
        ) : (
          icon && <Ionicons name={icon} size={16} color={color} />
        )}
      </View>
      <View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    flex: 1,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  value: { ...typography.h3, color: palette.text },
  label: { ...typography.tiny, color: palette.textDim, textTransform: 'uppercase' },
});

export default StatChip;
