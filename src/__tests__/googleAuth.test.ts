import { describe, expect, it } from '@jest/globals';

import { googleSignInAvailable, iosGoogleRedirect } from '../config/googleAuth';

describe('google sign-in availability', () => {
  const all = { web: 'w', android: 'a', ios: 'i' };

  it('needs Firebase first', () => {
    expect(googleSignInAvailable('web', all, false)).toBe(false);
  });

  it('needs the client ID of the platform it runs on', () => {
    expect(googleSignInAvailable('web', { web: 'w' }, true)).toBe(true);
    expect(googleSignInAvailable('ios', { web: 'w' }, true)).toBe(false);
    expect(googleSignInAvailable('ios', { web: 'w', ios: 'i' }, true)).toBe(true);
    expect(googleSignInAvailable('android', { web: 'w', ios: 'i' }, true)).toBe(false);
    expect(googleSignInAvailable('android', all, true)).toBe(true);
  });

  it('keeps native sign-in behind its flag', () => {
    expect(googleSignInAvailable('ios', all, true, false)).toBe(false);
    expect(googleSignInAvailable('web', all, true, false)).toBe(true);
  });
});

describe('iOS Google redirect', () => {
  it('reverses the client ID', () => {
    expect(iosGoogleRedirect('123-abc.apps.googleusercontent.com')).toBe('com.googleusercontent.apps.123-abc:/oauthredirect');
    expect(iosGoogleRedirect(undefined)).toBeUndefined();
  });
});
