'use strict';

export const name = 'FileSystem';

import { NativeModules } from 'react-native';

export function test(t) {
  t.fdescribe('FileSystem', () => {
    t.it(
      'delete(idempotent) -> !exists -> download(md5, uri) -> exists ' +
        '-> delete -> !exists',
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
      },
      9000
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

    t.it(
      'download(md5, uri) -> read -> delete -> !exists -> read[error]',
      async () => {
        const filename = 'download1.txt';

        const {
          md5,
          uri,
        } = await NativeModules.ExponentFileSystem.downloadAsync(
          'https://s3-us-west-1.amazonaws.com/test-suite-data/text-file.txt',
          filename,
          { md5: true }
        );
        t.expect(md5).toBe('86d73d2f11e507365f7ea8e7ec3cc4cb');

        const string = await NativeModules.ExponentFileSystem.readAsStringAsync(
          filename,
          {}
        );
        t.expect(string).toBe('hello, world\nthis is a test file\n');

        await NativeModules.ExponentFileSystem.deleteAsync(filename, {
          idempotent: true,
        });

        let error;
        try {
          await NativeModules.ExponentFileSystem.readAsStringAsync(
            filename,
            {}
          );
        } catch (e) {
          error = e;
        }
        t.expect(error).toBeTruthy();
      },
      9000
    );

    t.it(
      'delete(idempotent) -> !exists -> write -> read -> write -> read',
      async () => {
        const filename = 'write1.txt';

        await NativeModules.ExponentFileSystem.deleteAsync(filename, {
          idempotent: true,
        });

        const { exists } = await NativeModules.ExponentFileSystem.getInfoAsync(
          filename,
          {}
        );
        t.expect(exists).not.toBeTruthy();

        const writeAndVerify = async expected => {
          await NativeModules.ExponentFileSystem.writeAsStringAsync(
            filename,
            expected,
            {}
          );
          const string = await NativeModules.ExponentFileSystem.readAsStringAsync(
            filename,
            {}
          );
          t.expect(string).toBe(expected);
        };

        await writeAndVerify('hello, world');
        await writeAndVerify('hello, world!!!!!!');
      }
    );

    t.it(
      'delete(new) -> 2 * [write -> move -> !exists(orig) -> read(new)]',
      async () => {
        const from = 'from.txt';
        const to = 'to.txt';
        const contents = ['contents 1', 'contents 2'];

        await NativeModules.ExponentFileSystem.deleteAsync(to, {
          idempotent: true,
        });

        // Move twice to make sure we can overwrite
        for (let i = 0; i < 2; ++i) {
          await NativeModules.ExponentFileSystem.writeAsStringAsync(
            from,
            contents[i],
            {}
          );

          await NativeModules.ExponentFileSystem.moveAsync({ from, to });

          const {
            exists,
          } = await NativeModules.ExponentFileSystem.getInfoAsync(from, {});
          t.expect(exists).not.toBeTruthy();

          t
            .expect(
              await NativeModules.ExponentFileSystem.readAsStringAsync(to, {})
            )
            .toBe(contents[i]);
        }
      }
    );

    t.it(
      'delete(new) -> 2 * [write -> copy -> exists(orig) -> read(new)]',
      async () => {
        const from = 'from.txt';
        const to = 'to.txt';
        const contents = ['contents 1', 'contents 2'];

        await NativeModules.ExponentFileSystem.deleteAsync(to, {
          idempotent: true,
        });

        // Copy twice to make sure we can overwrite
        for (let i = 0; i < 2; ++i) {
          await NativeModules.ExponentFileSystem.writeAsStringAsync(
            from,
            contents[i],
            {}
          );

          await NativeModules.ExponentFileSystem.copyAsync({ from, to });

          const {
            exists,
          } = await NativeModules.ExponentFileSystem.getInfoAsync(from, {});
          t.expect(exists).toBeTruthy();

          t
            .expect(
              await NativeModules.ExponentFileSystem.readAsStringAsync(to, {})
            )
            .toBe(contents[i]);
        }
      }
    );

    t.it(
      'delete(dir) -> write(dir/file)[error] -> mkdir(dir) ->' +
      'mkdir(dir)[error] -> write(dir/file) -> read',
      async () => {
        let error;
        const path = 'dir/file';
        const dir = 'dir';
        const contents = 'hello, world';

        await NativeModules.ExponentFileSystem.deleteAsync(dir, {
          idempotent: true,
        });

        error = null;
        try {
          await NativeModules.ExponentFileSystem.writeAsStringAsync(
            path,
            contents,
            {}
          );
        } catch (e) {
          error = e;
        }
        t.expect(error).toBeTruthy();

        await NativeModules.ExponentFileSystem.makeDirectoryAsync(dir, {});

        error = null;
        try {
          await NativeModules.ExponentFileSystem.makeDirectoryAsync(dir, {});
        } catch (e) {
          error = e;
        }
        t.expect(error).toBeTruthy();

        await NativeModules.ExponentFileSystem.writeAsStringAsync(
          path,
          contents,
          {}
        );

        t
          .expect(
            await NativeModules.ExponentFileSystem.readAsStringAsync(path, {})
          )
          .toBe(contents);
      }
    );

    t.it(
      'delete(dir) -> write(dir/dir2/file)[error] -> ' +
      'mkdir(dir/dir2, intermediates) -> ' +
      'mkdir(dir/dir2, intermediates) -> write(dir/dir2/file) -> read',
      async () => {
        let error;
        const path = 'dir/dir2/file';
        const dir = 'dir/dir2';
        const contents = 'hello, world';

        await NativeModules.ExponentFileSystem.deleteAsync('dir', {
          idempotent: true,
        });

        error = null;
        try {
          await NativeModules.ExponentFileSystem.writeAsStringAsync(
            path,
            contents,
            {}
          );
        } catch (e) {
          error = e;
        }
        t.expect(error).toBeTruthy();

        await NativeModules.ExponentFileSystem.makeDirectoryAsync(dir, {
          intermediates: true,
        });

        error = null;
        try {
          await NativeModules.ExponentFileSystem.makeDirectoryAsync(dir, {});
        } catch (e) {
          error = e;
        }
        t.expect(error).toBeTruthy();

        await NativeModules.ExponentFileSystem.writeAsStringAsync(
          path,
          contents,
          {}
        );

        t
          .expect(
            await NativeModules.ExponentFileSystem.readAsStringAsync(path, {})
          )
          .toBe(contents);
      }
    );

    t.it(
      'delete(dir, idempotent) -> make tree -> check contents ' +
      '-> check directory listings',
      async () => {
        let error;

        await NativeModules.ExponentFileSystem.deleteAsync('dir', {
          idempotent: true,
        });

        await NativeModules.ExponentFileSystem.makeDirectoryAsync('dir/child1', {
          intermediates: true,
        });
        await NativeModules.ExponentFileSystem.makeDirectoryAsync('dir/child2', {
          intermediates: true,
        });

        await NativeModules.ExponentFileSystem.writeAsStringAsync(
          'dir/file1', 'contents1', {});
        await NativeModules.ExponentFileSystem.writeAsStringAsync(
          'dir/file2', 'contents2', {});

        await NativeModules.ExponentFileSystem.writeAsStringAsync(
          'dir/child1/file3', 'contents3', {});

        await NativeModules.ExponentFileSystem.writeAsStringAsync(
          'dir/child2/file4', 'contents4', {});
        await NativeModules.ExponentFileSystem.writeAsStringAsync(
          'dir/child2/file5', 'contents5', {});

        const checkContents = async (path, contents) => (
          t
            .expect(
              await NativeModules.ExponentFileSystem.readAsStringAsync(path, {})
            )
            .toBe(contents)
        );

        await checkContents('dir/file1', 'contents1');
        await checkContents('dir/file2', 'contents2');
        await checkContents('dir/child1/file3', 'contents3');
        await checkContents('dir/child2/file4', 'contents4');
        await checkContents('dir/child2/file5', 'contents5');

        const checkDirectory = async (path, expected) => {
          const list =
            await NativeModules.ExponentFileSystem.readDirectoryAsync(path, {});
          t.expect(list.sort()).toEqual(expected.sort());
        };

        await checkDirectory('dir', ['file1', 'file2', 'child1', 'child2']);
        await checkDirectory('dir/child1', ['file3']);
        await checkDirectory('dir/child2', ['file4', 'file5']);

        error = null;
        try {
          await checkDirectory('dir/file1', ['nope']);
        } catch (e) {
          error = e;
        }
        t.expect(error).toBeTruthy();
      }
    );
  });
}
