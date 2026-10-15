import { useEffect, useState } from 'react';

import { instamart, liveAvailable, swiggyFood, vendorMode } from '../services/vendors';
import { CHECKOUT_LIVE } from '../services/vendors/config';
import { serverHealth } from '../services/vendors/liveSwiggy';
import { useStore } from './store';

/**
 * Which Swiggy the screens talk to. Sample mode everywhere by default (the
 * website, friends and family); live only where the local FitPlate server is
 * set up and the user switched it on in Shopping & vendors.
 */
export function useVendors() {
  const { settings } = useStore();
  const mode = vendorMode(settings.featureToggles.swiggyLive);
  const [server, setServer] = useState<{ running: boolean; checkoutLive: boolean } | null>(null);
  useEffect(() => {
    if (mode !== 'live') return;
    let alive = true;
    serverHealth().then((h) => alive && setServer(h));
    return () => {
      alive = false;
    };
  }, [mode]);
  return {
    mode,
    liveAvailable: liveAvailable(),
    im: instamart(mode),
    food: swiggyFood(mode),
    /** Live: the local server's health; null while checking (or in sample mode). */
    server,
    /** A real order may be placed: live mode, the app flag AND the server flag on. */
    ordersLive: mode === 'live' && CHECKOUT_LIVE && Boolean(server?.checkoutLive),
  };
}
