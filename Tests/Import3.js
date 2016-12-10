'use strict';

import { Constants } from 'exponent';

export const name = 'Import1';

export function test(t) {
  t.describe(`import { Constants } from 'exponent';`, () => {
    t.it(`use Constants`, () => {
      t.expect(Constants.exponentVersion).toBeDefined();
    });
  });
}
