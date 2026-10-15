import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { featureFlags } from '../config/featureFlags';
import { applyResearchSnapshot, researchInfo } from '../data/research';
import { createFirestoreResearchSource } from '../services/research/firestoreResearch';
import { syncResearch } from '../services/research/researchRemote';
import { getDb } from '../services/storage/firestoreRemote';
import { firebaseConfigured, getFirebaseAuth } from './firebase';

/** P2-c: once per app start, use the server's research library when it is newer than the bundle. */
export function useServerResearch() {
  useEffect(() => {
    if (!featureFlags.serverResearch) return;
    // getFirebaseAuth() also initialises the Firebase app that getDb() needs.
    const db = firebaseConfigured && getFirebaseAuth() ? getDb() : null;
    syncResearch({
      source: db ? createFirestoreResearchSource(db) : null,
      cache: Platform.OS === 'web' ? null : AsyncStorage,
      currentVersion: researchInfo().version,
      apply: applyResearchSnapshot,
    }).catch(() => {});
  }, []);
}
