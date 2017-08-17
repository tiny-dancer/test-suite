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
    Log.collapsed('Packing exponent-sdk');
    await spawnAsync('yarn', ['pack', '--filename', expoSdkPackPath], {
      stdio: 'inherit',
      cwd: expoSdkPath,
    });

    // Install exponent-sdk from the packed package
    Log.collapsed('Installing exponent-sdk in test-suite');
    await spawnAsync('yarn', ['add', `file:${expoSdkPackPath}`], {
      stdio: 'inherit',
      cwd: testSuitePath,
    });
  },
};
