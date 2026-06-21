import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { gradients, palette, radii, shadow, typography } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  title: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'ghost' | 'danger' | 'success';
  size?: 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
}

const variantGradient: Record<string, readonly [string, string]> = {
  primary: gradients.primary,
  danger: gradients.fire,
  success: gradients.forest,
  ghost: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)'] as const,
};

const PrimaryButton: React.FC<Props> = ({
  title,
  onPress,
  icon,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  style,
}) => {
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        { borderRadius: radii.lg },
        pressed && !disabled && { transform: [{ scale: 0.97 }] },
        disabled && { opacity: 0.5 },
        shadow.card,
        style,
      ]}
    >
      <LinearGradient
        colors={variantGradient[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.btn,
          { paddingVertical: size === 'lg' ? 18 : 14 },
        ]}
      >
        <View style={styles.row}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              {icon ? <Ionicons name={icon} size={18} color="#fff" /> : null}
              <Text style={styles.label}>{title}</Text>
            </>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 22,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { ...typography.h3, color: palette.text, letterSpacing: 0.2 },
});

export default PrimaryButton;
