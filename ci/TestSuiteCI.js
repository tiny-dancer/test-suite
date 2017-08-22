import { Constants, Log } from 'ci';
import path from 'path';
import spawnAsync from '@expo/spawn-async';

const universePath = Constants.CODE_UNIVERSE_DIR;
const testSuitePath = path.join(universePath, 'apps', 'test-suite');
const expoSdkPath = path.join(universePath, 'libraries', 'exponent-sdk');
const expoSdkPackPath = path.join(testSuitePath, 'expo.tgz');

export default {
  testSuitePath,

  async installNodeModulesAsync() {
    Log.collapsed('Running `yarn install` in test-suite');
    await spawnAsync('yarn', ['install'], {
      stdio: 'inherit',
      cwd: testSuitePath,
    });

    // Pack exponent-sdk with its code in the same commit
    Log.collapsed('Installing local version of exponent-sdk');
    await spawnAsync('./install-to-directory.sh', [testSuitePath], {
      stdio: 'inherit',
      cwd: expoSdkPath,
    });
  },
};
