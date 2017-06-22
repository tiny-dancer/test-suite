'use strict';

export const name = 'FileSystem';

import { NativeModules } from 'react-native';

export function test(t) {
  t.describe('FileSystem', () => {
    t.it(
      'delete(idempotent) -> !exists -> download(md5, uri) --> exists ' +
        '--> delete --> !exists',
      async () => {
        const filename = 'download1.png';

        const assertExists = async expectedToExist => {
          let { exists } = await NativeModules.ExponentFileSystem.getInfoAsync(
            filename,
            {}
          );
          if (expectedToExist) {
            t.expect(exists).toBeTruthy();
          } else {
            t.expect(exists).not.toBeTruthy();
          }
        };

        await NativeModules.ExponentFileSystem.deleteAsync(filename, {
          idempotent: true,
        });
        await assertExists(false);

        const {
          md5,
          uri,
        } = await NativeModules.ExponentFileSystem.downloadAsync(
          'https://s3-us-west-1.amazonaws.com/test-suite-data/avatar2.png',
          filename,
          { md5: true }
        );
        t.expect(md5).toBe('1e02045c10b8f1145edc7c8375998f87');
        // NOTE: Is the below a sensible invariant to check?
        t.expect(uri.slice(-filename.length)).toBe(filename);
        await assertExists(true);

        await NativeModules.ExponentFileSystem.deleteAsync(filename, {});
        await assertExists(false);
      }
    );

    t.it('delete(idempotent) -> delete[error]', async () => {
      const filename = 'willDelete.png';

      await NativeModules.ExponentFileSystem.deleteAsync(filename, {
        idempotent: true,
      });

      let error;
      try {
        await NativeModules.ExponentFileSystem.deleteAsync(filename, {});
      } catch (e) {
        error = e;
      }
      t.expect(error.message).toMatch(/not.*found/);
    });
  });
}
