import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, typography } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const SectionHeader: React.FC<Props> = ({ title, subtitle, actionLabel, onAction }) => (
  <View style={styles.row}>
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    {actionLabel && (
      <Pressable hitSlop={8} onPress={onAction}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    )}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  title: { ...typography.h2, color: palette.text },
  subtitle: { ...typography.caption, color: palette.textDim, marginTop: 4 },
  action: { ...typography.caption, color: palette.accent, fontWeight: '700' },
});

export default SectionHeader;
