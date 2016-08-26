'use strict';

import { Platform } from 'react-native';

import { Location, Permissions } from 'exponent';

export const name = 'Location';

export function test(t) {
  t.describe('Location', () => {
    t.describe('Location.getCurrentPositionAsync()', () => {
      const testShapeOrUnauthorized = (options) => async () => {
        const { status } = await Permissions.askAsync(
          Permissions.LOCATION);
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

      t.it(
        'gets a result of the correct shape (without high accuracy), or ' +
        'throws error if no permission',
        testShapeOrUnauthorized({ enableHighAccuracy: false }),
        10000,
      );
      t.it(
        'gets a result of the correct shape (without high accuracy), or ' +
        'throws error if no permission (when trying again immediately)',
        testShapeOrUnauthorized({ enableHighAccuracy: false }),
        10000,
      );
      t.it(
        'gets a result of the correct shape (with high accuracy), or ' +
        'throws error if no permission (when trying again immediately)',
        testShapeOrUnauthorized({ enableHighAccuracy: true }),
        10000,
      );

      t.it(
        'gets a result of the correct shape (without high accuracy), or ' +
        'throws error if no permission (when trying again after 1 second)',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await testShapeOrUnauthorized({ enableHighAccuracy: false });
        },
        11000,
      );

      t.it(
        'gets a result of the correct shape (with high accuracy), or ' +
        'throws error if no permission (when trying again after 1 second)',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await testShapeOrUnauthorized({ enableHighAccuracy: true });
        },
        11000,
      );
    });
  });
}
