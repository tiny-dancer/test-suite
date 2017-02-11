'use strict';

import {
  NativeModules,
} from 'react-native';

let {
  ExponentTest,
} = NativeModules;

export async function acceptPermissionsAndRunCommandAsync(fn) {
  if (!ExponentTest) {
    return await fn();
  }

  let results = await Promise.all([
    ExponentTest.action({
      selectorType: 'text',
      selectorValue: 'Allow',
      actionType: 'click',
      delay: 1000,
      timeout: 100,
    }),
    fn(),
  ]);

  return results[1];
}
