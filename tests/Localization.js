'use strict';

import { Localization } from 'expo';

export const name = 'Localization';

export function test(t) {
  t.describe(`Test Localization Functions`, () => {
    t.it('Gets the current device country correctly', async () => {
      const result = await Localization.getCurrentDeviceCountryAsync();
      t.expect(result).not.toBe(undefined);
    });
    t.it('Gets the current locale correctly', async () => {
      const result = await Localization.getCurrentLocaleAsync();
      t.expect(result).not.toBe(undefined);
    });
    // TODO: getPreferredLocales
    // TODO: getISOCurrencyCodes
    t.it('Gets the current timzezone correctly', async () => {
      const result = await Localization.getCurrentTimeZoneAsync();
      t.expect(result).not.toBe(undefined);
    });
  });
}
