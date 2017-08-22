import { TestSuite } from 'ci';

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
    await TestSuite.publishTestSuiteAsync();
  },
});
