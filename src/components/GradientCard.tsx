import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { gradients, radii, shadow } from '../theme';

interface Props {
  colors?: readonly [string, string];
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
  borderless?: boolean;
  radius?: number;
}

const GradientCard: React.FC<Props> = ({
  colors = gradients.card,
  style,
  children,
  borderless,
  radius = radii.lg,
}) => {
  return (
    <View style={[shadow.card, { borderRadius: radius }]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          { borderRadius: radius },
          !borderless && styles.border,
          style,
        ]}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 18, overflow: 'hidden' },
  border: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
});

export default GradientCard;
