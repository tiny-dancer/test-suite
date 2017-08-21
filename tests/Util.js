'use strict';

import { Util } from 'expo';

export const name = 'Util';

export function test(t) {
  t.describe(`Test Util Functions`, () => {
    t.it('Gets the current device country correctly', async () => {
      const result = await Util.getCurrentDeviceCountryAsync();
      t.expect(result).not.toBe(undefined);
    });
    t.it('Gets the current locale correctly', async () => {
      const result = await Util.getCurrentLocaleAsync();
      t.expect(result).not.toBe(undefined);
    });
    t.it('Gets the current timzezone correctly', async () => {
      const result = await Util.getCurrentTimeZoneAsync();
      t.expect(result).not.toBe(undefined);
    });
  });
}
