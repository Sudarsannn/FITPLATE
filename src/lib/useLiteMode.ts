import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import { featureFlags } from '../config/featureFlags';
import { shouldUseLite } from '../services/liteMode';

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

function webConnection(): NetworkInformation {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return {};
  return (navigator as Navigator & { connection?: NetworkInformation }).connection ?? {};
}

/** True when background videos should be replaced by a still backdrop. */
export function useLiteMode(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (!featureFlags.liteMode) return;
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => alive && setReduceMotion(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  if (!featureFlags.liteMode) return false;
  const c = webConnection();
  return shouldUseLite({ reduceMotion, saveData: c.saveData, effectiveType: c.effectiveType });
}
