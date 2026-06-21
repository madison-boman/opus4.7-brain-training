import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { palette } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import GamesScreen from '../screens/GamesScreen';
import ProgressScreen from '../screens/ProgressScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GameRouterScreen from '../screens/GameRouterScreen';
import GameResultScreen from '../screens/GameResultScreen';
import AchievementDetailScreen from '../screens/AchievementDetailScreen';
import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: palette.bg,
    card: palette.bg,
    border: 'transparent',
    primary: palette.primary,
    text: palette.text,
    notification: palette.accent,
  },
};

const Tabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: true,
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabLabel,
      tabBarActiveTintColor: palette.text,
      tabBarInactiveTintColor: palette.textDim,
      tabBarBackground: () => (
        <LinearGradient
          colors={['rgba(11,11,31,0.85)', 'rgba(19,19,43,0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ),
      tabBarIcon: ({ focused, color }) => {
        const icon: Record<string, keyof typeof Ionicons.glyphMap> = {
          Home: focused ? 'home' : 'home-outline',
          Games: focused ? 'game-controller' : 'game-controller-outline',
          Progress: focused ? 'stats-chart' : 'stats-chart-outline',
          Achievements: focused ? 'trophy' : 'trophy-outline',
          Profile: focused ? 'person-circle' : 'person-circle-outline',
        };
        return (
          <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
            <Ionicons name={icon[route.name]} size={focused ? 24 : 22} color={color} />
          </View>
        );
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Games" component={GamesScreen} />
    <Tab.Screen name="Progress" component={ProgressScreen} />
    <Tab.Screen name="Achievements" component={AchievementsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen
          name="Game"
          component={GameRouterScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="GameResult"
          component={GameResultScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="AchievementDetail"
          component={AchievementDetailScreen}
          options={{ animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 84 : 70,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: Platform.OS === 'ios' ? 12 : 10,
    overflow: 'hidden',
    elevation: 22,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  tabLabel: { fontSize: 10, fontWeight: '700', marginTop: 2, letterSpacing: 0.4 },
  iconWrap: {
    width: 38,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  iconWrapActive: { backgroundColor: 'rgba(124,92,255,0.15)' },
});

export default RootNavigator;
