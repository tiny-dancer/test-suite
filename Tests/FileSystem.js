'use strict';

export const name = 'FileSystem';

import { NativeModules } from 'react-native';

export function test(t) {
  t.fdescribe('FileSystem', () => {
    t.describe('ExponentFileSystem.downloadAsync()', () => {
      t.it('downloads an image with correct MD5 hash, file name', async () => {
        const filename = 'download1.png';
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
      });
    });
  });
}
