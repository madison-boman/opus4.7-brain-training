import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '../theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  gradient?: readonly [string, string];
}

const ScreenWrapper: React.FC<Props> = ({ children, scroll = true, contentStyle, edges = ['top', 'left', 'right'], gradient }) => {
  const Wrapper = scroll ? ScrollView : View;
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={gradient ?? ['#0B0B1F', '#13132B', '#0B0B1F']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowA} />
      <View style={styles.glowB} />
      <SafeAreaView style={{ flex: 1 }} edges={edges}>
        <Wrapper
          style={{ flex: 1 }}
          contentContainerStyle={[scroll && styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </Wrapper>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scrollContent: { padding: 18, paddingBottom: 110, gap: 18 },
  glowA: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 360,
    backgroundColor: '#7C5CFF',
    opacity: 0.18,
    top: -160,
    right: -120,
  },
  glowB: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: '#22D3EE',
    opacity: 0.12,
    bottom: -160,
    left: -120,
  },
});

export default ScreenWrapper;
