/*
 * Config for this on CI
 */

import {
  Constants,
  Log,
  XDL,
} from 'ci';

import JsonFile from '@exponent/json-file';
import spawnAsync from '@exponent/spawn-async';
import path from 'path';

const XDL_LOGIN_USERPASS = {
  username: 'exponent_ci_bot',
  password: 'imabot2017',
};

const universePath = Constants.CODE_UNIVERSE_DIR;
const testSuitePath = path.join(universePath, 'apps', 'test-suite');

export default {
  config: {
    name: 'Publish Test Suite',
    shortname: 'publish-test-suite',
    description: 'Publishes Test Suite',
    allowPRs: true,
    regions: [
      'apps/test-suite/**',
    ],
  },
  steps: (branch, tag) => ([
    publishTestSuite(branch, tag),
  ]),
};

async function sleepAsync(timeout) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, timeout);
  });
}

const publishTestSuite = (branch, tag) => ({
  name: 'Publish Test Suite',
  agents: {
    queue: 'ubuntu',
  },
  async command() {
    await spawnAsync('sysctl', ['-p']);
    // :|
    try {
      await spawnAsync('mv', ['/usr/local/bin/watchman', '/usr/local/bin/watchman2']);
    } catch (e) {}

    // Use `npm` because `yarn` is being weird about using the latest
    // local `exponent-sdk` package
    Log.collapsed('Running `npm install` in test-suite...');
    await spawnAsync('npm', ['install'], {
      stdio: 'inherit',
      cwd: testSuitePath,
    });

    // Install exponent-sdk from its code in the same commit.
    Log.collapsed('Installing exponent-sdk in test-suite...');
    await spawnAsync('npm', ['remove', '--save', 'exponent'], {
      stdio: 'inherit',
      cwd: testSuitePath,
    });
    await spawnAsync('npm', [
      'install', '--save',
      `file://${path.join(universePath, 'libraries', 'exponent-sdk')}`,
    ], {
      stdio: 'inherit',
      cwd: testSuitePath,
    });

    Log.collapsed('Building XDL...');
    const xdl = await XDL.requireAsync();

    Log.collapsed('Logging in...');
    await xdl.User.loginAsync('user-pass', XDL_LOGIN_USERPASS);

    Log.collapsed('Modifying slug...');
    let expJsonFile = new JsonFile(path.join(testSuitePath, 'exp.json'));
    let expJson = await expJsonFile.readAsync();
    expJson.slug = `test-suite-${process.env.UNIVERSE_BUILD_ID}`;
    await expJsonFile.writeAsync(expJson);

    Log.collapsed('Starting project...');
    await xdl.Project.startAsync(testSuitePath);

    await sleepAsync(5000);

    Log.collapsed('Publishing...');
    await xdl.Project.publishAsync(testSuitePath);

    Log.collapsed('Stopping project...');
    await xdl.Project.stopAsync(testSuitePath);
    Log.collapsed('Done...');
  },
});
