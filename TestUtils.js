'use strict';

import {
  NativeModules,
} from 'react-native';

let {
  ExponentTest,
} = NativeModules;

export async function acceptPermissionsAsync() {
  if (!ExponentTest) {
    return;
  }

  await ExponentTest.action({
    selectorType: 'text',
    selectorValue: 'Allow',
    actionType: 'click',
    delay: 1000,
  });
}
