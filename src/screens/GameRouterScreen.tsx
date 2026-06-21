import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import { RootStackParamList } from '../navigation/types';
import LightSequenceScreen from './games/LightSequenceScreen';
import ShadowMatcherScreen from './games/ShadowMatcherScreen';
import PeekABooGridScreen from './games/PeekABooGridScreen';
import NumberSortScreen from './games/NumberSortScreen';
import MathSprintScreen from './games/MathSprintScreen';

const GameRouterScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Game'>>();
  switch (route.params.gameId) {
    case 'lightSequence':
      return <LightSequenceScreen />;
    case 'shadowMatcher':
      return <ShadowMatcherScreen />;
    case 'peekABoo':
      return <PeekABooGridScreen />;
    case 'numberSort':
      return <NumberSortScreen />;
    case 'mathSprint':
      return <MathSprintScreen />;
    default:
      return null;
  }
};

export default GameRouterScreen;
