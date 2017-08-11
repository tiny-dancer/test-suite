import { Constants, Log } from 'ci';
import path from 'path';
import spawnAsync from '@expo/spawn-async';

const universePath = Constants.CODE_UNIVERSE_DIR;
const testSuitePath = path.join(universePath, 'apps', 'test-suite');

export default {
  testSuitePath,

  async installNodeModulesAsync() {
    // Use `npm` because `yarn` is being weird about using the latest local `exponent-sdk` package
    Log.collapsed('Running `npm install` in test-suite');
    await spawnAsync('npm', ['install'], {
      stdio: 'inherit',
      cwd: testSuitePath,
    });

    // Install exponent-sdk from its code in the same commit.
    Log.collapsed('Installing exponent-sdk in test-suite');
    await spawnAsync(
      'npm',
      [
        'install',
        `file://${path.join(universePath, 'libraries', 'exponent-sdk')}`,
      ],
      {
        stdio: 'inherit',
        cwd: testSuitePath,
      }
    );
  },
};
