'use strict';

import { Permissions } from 'expo';
import { Platform } from 'react-native';

export const name = 'Permissions';

export function test(t) {
  t.describe('Permissions.getAsync', () => {
    t.describe('of Permissions.NOTIFICATIONS', () => {
      t.it('has proper shape', async () => {
        const result = await Permissions.getAsync(Permissions.NOTIFICATIONS);
        const keys = Object.keys(result);
        t.expect(keys).toContain('status');
        t.expect(keys).toContain('expires');
        if (Platform.OS === 'ios') {
          t.expect(keys).toContain('allowsSound');
          t.expect(keys).toContain('allowsAlert');
          t.expect(keys).toContain('allowsBadge');
        }
      });
    });

    t.describe('of Permissions.REMOTE_NOTIFICATIONS', () => {
      t.it('has proper shape', async () => {
        const result = await Permissions.getAsync(Permissions.REMOTE_NOTIFICATIONS);
        const keys = Object.keys(result);
        t.expect(keys).toContain('status');
        t.expect(keys).toContain('expires');
        if (Platform.OS === 'ios') {
          t.expect(keys).toContain('allowsSound');
          t.expect(keys).toContain('allowsAlert');
          t.expect(keys).toContain('allowsBadge');
        }
      });

      if (Platform.OS === 'android') {
        t.it('is equal to status of notifications permission', async () => {
          const localResult = await Permissions.getAsync(Permissions.NOTIFICATIONS);
          const remoteResult = await Permissions.getAsync(Permissions.REMOTE_NOTIFICATIONS);

          t.expect(remoteResult).toEqual(localResult);
        });
      }
    });
  });
}
