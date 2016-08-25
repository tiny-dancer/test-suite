'use strict';

import { Constants } from 'exponent';

export const name = 'Constants';

export function test(t) {
  t.describe('Constants', () => {
    [
      'exponentVersion',
      'deviceId',
      'deviceName',
      'deviceYearClass',
      'sessionId',
      'manifest',
      'linkingUri',
    ].forEach(v => t.it(`has ${v}`, () => {
      t.expect(Constants[v]).toBeDefined();
    }));
  });
}
