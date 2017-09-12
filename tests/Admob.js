/*
Admob.js
Jasmine tests for the Admob module.
Tests run on iOS and Android via Expo.

Jeffrey Da, Expo Inc., Aug 2018
*/
'use strict';

import { NativeModules, requireNativeComponent } from 'react-native';

export const name = 'Admob';

export function test(t) {
  const AdMobRewarded = NativeModules.RNAdMobRewarded;
  const AdMobInterstitials = NativeModules.RNAdMobInterstitial;

  t.describe('Admob', () => {
    t.it('suscessfully sets Ad Unit ID for rewarded ads', () => {
      t.expect(AdMobRewarded.setTestDeviceID('EMULATOR')).not.toBeNull();
    });
    t.it('suscessfully sets Test Device ID for rewarded ads', () => {
      t.expect(AdMobRewarded.setAdUnitID('id')).not.toBeNull();
    });
    t.it('suscessfully sets Ad Unit ID for interstitial ads', () => {
      t.expect(AdMobInterstitials.setAdUnitID('id')).not.toBeNull();
    });
    t.it('suscessfully sets Test Device ID for interstitial ads', () => {
      t.expect(AdMobInterstitials.setTestDeviceID('EMULATOR')).not.toBeNull();
    });
  });
}
