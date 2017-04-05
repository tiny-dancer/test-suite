import { Constants, Log, XDL } from 'ci';

import JsonFile from '@exponent/json-file';
import spawnAsync from '@exponent/spawn-async';
import path from 'path';

const universePath = Constants.CODE_UNIVERSE_DIR;
const testSuitePath = path.join(universePath, 'apps', 'test-suite');

export default {
  config: {
    name: 'Publish Test Suite',
    shortname: 'publish-test-suite',
    description: 'Publishes Test Suite',
    allowPRs: true,
    branches: 'master',
    regions: ['apps/test-suite/**'],
  },
  steps: (branch, tag) => [publishTestSuite(branch, tag)],
};

const publishTestSuite = (branch, tag) => ({
  name: 'Publish Test Suite',
  async command() {
    await spawnAsync('sysctl', ['-p']);

    // Run yarn install -- it leverages install-universe-deps
    // as a preinstall script, so local expo-sdk is linked in
    Log.collapsed('Running `yarn install` in test-suite...');
    await spawnAsync('yarn', ['install'], {
      stdio: 'inherit',
      cwd: testSuitePath,
    });

    Log.collapsed('Modifying slug...');
    let expJsonFile = new JsonFile(path.join(testSuitePath, 'exp.json'));
    let expJson = await expJsonFile.readAsync();
    expJson.slug = `test-suite-${process.env.UNIVERSE_BUILD_ID}`;
    await expJsonFile.writeAsync(expJson);

    await XDL.publishProjectAsync(testSuitePath);
  },
});
