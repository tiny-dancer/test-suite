import { Log, XDL } from 'ci';

import JsonFile from '@exponent/json-file';
import spawnAsync from '@exponent/spawn-async';
import path from 'path';

import TestSuiteCI from './ci/TestSuiteCI';

export default {
  config: {
    name: 'Publish Test Suite',
    shortname: 'publish-test-suite',
    description: 'Publishes Test Suite',
    allowPRs: true,
    branches: 'master',
    regions: ['apps/test-suite/**', 'libraries/exponent-sdk/**'],
  },
  steps: (branch, tag) => [publishTestSuite(branch, tag)],
};

const publishTestSuite = (branch, tag) => ({
  name: 'Publish Test Suite',
  agents: {
    queue: 'builder',
  },
  async command() {
    await spawnAsync('sysctl', ['-p']);

    await TestSuiteCI.installNodeModulesAsync();

    Log.collapsed('Modifying slug...');
    let expJsonFile = new JsonFile(
      path.join(TestSuiteCI.testSuitePath, 'exp.json')
    );
    let expJson = await expJsonFile.readAsync();
    expJson.slug = `test-suite-${process.env.UNIVERSE_BUILD_ID}`;
    await expJsonFile.writeAsync(expJson);

    await XDL.publishProjectAsync(TestSuiteCI.testSuitePath);
  },
});
