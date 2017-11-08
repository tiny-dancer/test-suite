// @flow

import React from 'react';
import { forEach, isMatch } from 'lodash';
import asyncRetry from 'async-retry';

export const waitFor = millis => new Promise(resolve => setTimeout(resolve, millis));

export const testPropValues = (
  component: React.Node,
  propName: string,
  values: Array<*>,
  moreTests: ?Function,
  { t, mountAndWaitFor }
) =>
  t.describe(`${component.type.name}.props.${propName}`, () => {
    forEach(values, value =>
      t.it(`sets it to \`${value}\``, async () => {
        let instance = null;
        const refSetter = ref => {
          instance = ref;
        };
        const clonedElement = React.cloneElement(component, { ref: refSetter, [propName]: value });
        await mountAndWaitFor(clonedElement, 'onLoad');
        await retryForStatus(instance, { [propName]: value });
      })
    );

    if (moreTests) {
      moreTests();
    }
  });

export const testPropSetter = (
  component,
  propName,
  propSetter,
  values,
  moreTests,
  { t, mountAndWaitFor }
) =>
  t.describe(`Video.${propSetter}`, () => {
    forEach(values, value =>
      t.it(`sets it to \`${value}\``, async () => {
        let instance = null;
        const refSetter = ref => {
          instance = ref;
        };
        const clonedElement = React.cloneElement(component, { ref: refSetter, [propName]: value });
        await mountAndWaitFor(clonedElement);
        await instance[propSetter](value);
        const status = await instance.getStatusAsync();
        t.expect(status).toEqual(t.jasmine.objectContaining({ [propName]: value }));
      })
    );

    if (moreTests) {
      moreTests();
    }
  });

export const testNoCrash = (component, propName, values, { t, mountAndWaitFor }) =>
  t.describe(`${component.type.name}.props.${propName}`, () => {
    forEach(values, value =>
      t.it(`setting to \`${value}\` doesn't crash`, async () => {
        const clonedElement = React.cloneElement(component, { [propName]: value });
        await mountAndWaitFor(clonedElement, 'onLoad');
      })
    );
  });

export const retryForStatus = (object, status) =>
  asyncRetry(
    async (bail, retriesCount) => {
      const readStatus = await object.getStatusAsync();
      if (isMatch(readStatus, status)) {
        return true;
      } else {
        const stringifiedStatus = JSON.stringify(status);
        const desiredError = `The A/V instance has not entered desired state (${stringifiedStatus}) after ${retriesCount} retries.`;
        const lastKnownError = `Last known state: ${JSON.stringify(readStatus)}.`;
        throw new Error(`${desiredError} ${lastKnownError}`);
      }
    },
    { retries: 5, minTimeout: 100 }
  );

export const mountAndWaitFor = (
  child: React.Node,
  propName = 'ref',
  setPortalChild: React.Node => void
) =>
  new Promise(resolve => {
    // `ref` prop is set directly in the child, not in the `props` object.
    // https://github.com/facebook/react/issues/8873#issuecomment-275423780
    const previousPropFunc = propName === 'ref' ? child.ref : child[propName];
    const newPropFunc = val => {
      previousPropFunc && previousPropFunc(val);
      resolve(val);
    };
    const clonedChild = React.cloneElement(child, { [propName]: newPropFunc });
    setPortalChild(clonedChild);
  });

export default {
  waitFor,
  testNoCrash,
  retryForStatus,
  testPropValues,
  testPropSetter,
  mountAndWaitFor,
};
