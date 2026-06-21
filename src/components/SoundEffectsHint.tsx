import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Sound effect placeholders - hooked into haptics on supported devices.
// The interface mirrors a real sound engine so it can be swapped later.
type SfxName =
  | 'tap'
  | 'success'
  | 'failure'
  | 'combo'
  | 'levelUp'
  | 'whoosh'
  | 'reward'
  | 'tick';

const playable: Record<SfxName, () => Promise<void> | void> = {
  tap: () => safe(() => Haptics.selectionAsync()),
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  failure: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  combo: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  levelUp: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  whoosh: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  reward: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  tick: () => safe(() => Haptics.selectionAsync()),
};

const safe = (fn: () => any) => {
  if (Platform.OS === 'web') return;
  try {
    fn();
  } catch {}
};

export const playSfx = (name: SfxName) => {
  // sfx placeholder: hook real audio later
  playable[name]?.();
};

export default playSfx;
