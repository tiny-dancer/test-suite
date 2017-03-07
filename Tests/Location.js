'use strict';

import { Platform } from 'react-native';

import { Location, Permissions } from 'expo';
import * as TestUtils from '../TestUtils';

export const name = 'Location';

export function test(t) {
  t.describe('Location', () => {
    t.describe('Location.getCurrentPositionAsync()', () => {
      // Manual interaction:
      //   1. Just try
      //   2. iOS Settings --> General --> Reset --> Reset Location & Privacy,
      //      try gain and "Allow"
      //   3. Retry from experience restart.
      //   4. Retry from app restart.
      //   5. iOS Settings --> General --> Reset --> Reset Location & Privacy,
      //      try gain and "Don't Allow"
      //   6. Retry from experience restart.
      //   7. Retry from app restart.

      const testShapeOrUnauthorized = (options) => async () => {
        const { status } = await TestUtils.acceptPermissionsAndRunCommandAsync(() => {
          return Permissions.askAsync(Permissions.LOCATION);
        });
        if (status === 'granted') {
          const {
            coords: {
              latitude,
              longitude,
              altitude,
              accuracy,
              altitudeAccuracy,
              heading,
              speed,
            },
            timestamp,
          } = await Location.getCurrentPositionAsync(options);
          t.expect(typeof latitude === 'number').toBe(true);
          t.expect(typeof longitude === 'number').toBe(true);
          t.expect(typeof altitude === 'number').toBe(true);
          t.expect(typeof accuracy === 'number').toBe(true);
          t.expect(Platform.OS !== 'ios' ||
                   typeof altitudeAccuracy === 'number').toBe(true);
          t.expect(typeof heading === 'number').toBe(true);
          t.expect(typeof speed === 'number').toBe(true);
          t.expect(typeof timestamp === 'number').toBe(true);
        } else {
          let error;
          try {
            await Location.getCurrentPositionAsync(options);
          } catch (e) {
            error = e;
          }
          t.expect(error.message).toMatch(/Not authorized/);
        }
      };

      const second = 1000;
      const timeout = 20 * second; // Allow manual touch on permissions dialog

      t.it(
        'gets a result of the correct shape (without high accuracy), or ' +
        'throws error if no permission',
        testShapeOrUnauthorized({ enableHighAccuracy: false }),
        timeout,
      );
      t.it(
        'gets a result of the correct shape (without high accuracy), or ' +
        'throws error if no permission (when trying again immediately)',
        testShapeOrUnauthorized({ enableHighAccuracy: false }),
        timeout,
      );
      t.it(
        'gets a result of the correct shape (with high accuracy), or ' +
        'throws error if no permission (when trying again immediately)',
        testShapeOrUnauthorized({ enableHighAccuracy: true }),
        timeout,
      );

      t.it(
        'gets a result of the correct shape (without high accuracy), or ' +
        'throws error if no permission (when trying again after 1 second)',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await testShapeOrUnauthorized({ enableHighAccuracy: false })();
        },
        timeout + second,
      );

      t.it(
        'gets a result of the correct shape (with high accuracy), or ' +
        'throws error if no permission (when trying again after 1 second)',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await testShapeOrUnauthorized({ enableHighAccuracy: true })();
        },
        timeout + second,
      );
    });
  });
}
