import { Linking, Platform } from 'react-native';
import { Constants, WebBrowser } from 'expo';

import { waitFor } from './helpers';

const validHttpUrl = 'http://expo.io/';
const validHttpsUrl = 'https://expo.io/';
const validExpUrl = 'exp://expo.io/@community/native-component-list';
const redirectingBackendUrl = 'https://backend-xxswjknyfi.now.sh/?linkingUri=';

export const name = 'Linking';

export function test(t) {
  t.describe('Linking', () => {
    t.describe('canOpenUrl', () => {
      t.it('can open exp:// URLs', async () => {
        t.expect(await Linking.canOpenURL(validExpUrl)).toBe(true);
      });

      t.it('can open its own URLs', async () => {
        t.expect(await Linking.canOpenURL(Constants.linkingUri)).toBe(true);
      });

      t.it('can open http:// URLs', async () => {
        t.expect(await Linking.canOpenURL(validHttpUrl)).toBe(true);
      });

      t.it('can open https:// URLs', async () => {
        t.expect(await Linking.canOpenURL(validHttpsUrl)).toBe(true);
      });
    });

    t.describe('addListener', () => {
      let previousInterval = 0;
      t.beforeAll(() => {
        previousInterval = t.jasmine.DEFAULT_TIMEOUT_INTERVAL;
        t.jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      });
      t.afterAll(() => {
        t.jasmine.DEFAULT_TIMEOUT_INTERVAL = previousInterval;
      });

      if (Platform.OS === 'android') {
        // We can't run this test on iOS since iOS it fails with an exception
        // "The specified URL has an unsupported scheme. Only HTTP and HTTPS URLs are supported."
        t.it('listener gets called with a proper URL when opened from a web modal', async () => {
          let handlerCalled = false;
          const testUrl = `${Constants.linkingUri}+message=hello`;
          const handler = ({ url }) => {
            t.expect(url).toEqual(testUrl);
            handlerCalled = true;
          };
          Linking.addEventListener('url', handler);
          await WebBrowser.openBrowserAsync(testUrl);
          t.expect(handlerCalled).toBe(true);
          Linking.removeListener('url', handler);
        });

        // We can't run this test on iOS since iOS asks "whether to open this link in Expo"
        // and we can't programmatically tap "Open".
        t.it('listener gets called with a proper URL when opened from a web browser', async () => {
          let handlerCalled = false;
          const handler = ({ url }) => {
            t
              .expect(url)
              .toEqual(`${Constants.linkingUri}+message=Redirected%20automatically%20by%20timer`);
            handlerCalled = true;
          };
          Linking.addEventListener('url', handler);
          await Linking.openURL(`${redirectingBackendUrl}${Constants.linkingUri}+`);
          await waitFor(8000);
          t.expect(handlerCalled).toBe(true);
          Linking.removeListener('url', handler);
        });
      }

      t.it('listener gets called with a proper URL when opened from a web modal', async () => {
        let handlerCalled = false;
        const handler = ({ url }) => {
          t
            .expect(url)
            .toEqual(`${Constants.linkingUri}+message=Redirected%20automatically%20by%20timer`);
          handlerCalled = true;
          WebBrowser.dismissBrowser();
        };
        Linking.addEventListener('url', handler);
        await WebBrowser.openBrowserAsync(`${redirectingBackendUrl}${Constants.linkingUri}+`);
        await waitFor(1000);
        t.expect(handlerCalled).toBe(true);
        Linking.removeListener('url', handler);
      });

      t.it('listener gets called with a proper URL when opened with Linking.openURL', async () => {
        let handlerCalled = false;
        const handler = ({ url }) => {
          handlerCalled = true;
        };
        Linking.addEventListener('url', handler);
        await Linking.openURL(`${Constants.linkingUri}+`);
        await waitFor(500);
        t.expect(handlerCalled).toBe(true);
        Linking.removeListener('url', handler);
      });
    });
  });
}
