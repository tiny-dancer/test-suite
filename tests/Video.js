'use strict';

import React from 'react';
import { Asset, Video } from 'expo';
import { Platform } from 'react-native';
import { flatten, filter, takeRight, map } from 'lodash';

import {
  waitFor,
  retryForStatus,
  testNoCrash as originalTestNoCrash,
  testPropSetter as originalTestPropSetter,
  testPropValues as originalTestPropValues,
  mountAndWaitFor as originalMountAndWaitFor,
} from './helpers';

export const name = 'Video';
const imageRemoteSource = { uri: 'http://via.placeholder.com/350x150' };
const videoRemoteSource = { uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' };
const imageSource = require('../assets/black-128x256.png');
const source = require('../assets/big_buck_bunny.mp4');
const style = { width: 200, height: 200 };

export function test(t, { setPortalChild, cleanupPortal }) {
  t.describe('Video', () => {
    let instance = null;
    const refSetter = ref => {
      instance = ref;
    };

    t.afterEach(async () => {
      instance = null;
      await cleanupPortal();
    });

    const mountAndWaitFor = (child, propName = 'onLoad') =>
      originalMountAndWaitFor(child, propName, setPortalChild);

    const testOptions = { t, mountAndWaitFor };

    const testPropValues = (propName, values, moreTests) =>
      originalTestPropValues(
        <Video style={style} source={source} />,
        propName,
        values,
        moreTests,
        testOptions
      );

    const testNoCrash = (propName, values) =>
      originalTestNoCrash(<Video style={style} source={source} />, propName, values, testOptions);

    const testPropSetter = (propName, propSetter, values, moreTests) =>
      originalTestPropSetter(
        <Video style={style} source={source} />,
        propName,
        propSetter,
        values,
        moreTests,
        testOptions
      );

    t.describe('Video.props.onLoadStart', () => {
      t.it('gets called when the source starts loading', async () => {
        await mountAndWaitFor(<Video style={style} source={source} />, 'onLoadStart');
      });
    });

    t.describe('Video.props.onLoad', () => {
      t.it('gets called when the source loads', async () => {
        await mountAndWaitFor(<Video style={style} source={source} />, 'onLoad');
      });
    });

    t.describe('Video.props.source', () => {
      t.it('mounts even when the source is undefined', async () => {
        await mountAndWaitFor(<Video style={style} />, 'ref');
      });

      t.it('loads `require` source', async () => {
        const status = await mountAndWaitFor(<Video style={style} source={source} />);
        t.expect(status).toEqual(t.jasmine.objectContaining({ isLoaded: true }));
      });

      t.it('loads `Asset` source', async () => {
        const status = await mountAndWaitFor(
          <Video style={style} source={Asset.fromModule(source)} />
        );
        t.expect(status).toEqual(t.jasmine.objectContaining({ isLoaded: true }));
      });

      t.it('loads `uri` source', async () => {
        const status = await mountAndWaitFor(<Video style={style} source={videoRemoteSource} />);
        t.expect(status).toEqual(t.jasmine.objectContaining({ isLoaded: true }));
      });

      if (Platform.OS === 'ios') {
        t.it('calls onError when given image source', async () => {
          const error = await mountAndWaitFor(
            <Video style={style} source={imageSource} />,
            'onError'
          );
          t.expect(error).toBeDefined();
        });
      }
    });

    testNoCrash('useNativeControls', [true, false]);
    testNoCrash('usePoster', [true, false]);
    testNoCrash('resizeMode', [
      Video.RESIZE_MODE_COVER,
      Video.RESIZE_MODE_CONTAIN,
      Video.RESIZE_MODE_STRETCH,
    ]);

    t.describe(`Video.props.posterSource`, () => {
      t.it("doesn't crash if is set to required image", async () => {
        const props = {
          style,
          source,
          posterSource: imageSource,
        };
        await mountAndWaitFor(<Video {...props} />);
      });

      t.it("doesn't crash if is set to uri", async () => {
        const props = {
          style,
          source,
          posterSource: imageRemoteSource,
        };
        await mountAndWaitFor(<Video {...props} />);
      });
    });

    t.describe(`Video.props.onReadyForDisplay`, () => {
      t.it('gets called with the `naturalSize` object', async () => {
        const props = {
          style,
          source,
        };
        const status = await mountAndWaitFor(<Video {...props} />, 'onReadyForDisplay');
        t.expect(status.naturalSize).toBeDefined();
        t.expect(status.naturalSize.width).toBeDefined();
        t.expect(status.naturalSize.height).toBeDefined();
        t.expect(status.naturalSize.orientation).toBeDefined();
      });

      t.it('gets called with the `status` object', async () => {
        const props = {
          style,
          source,
        };
        const status = await mountAndWaitFor(<Video {...props} />, 'onReadyForDisplay');
        t.expect(status.status).toBeDefined();
        t.expect(status.status.isLoaded).toBe(true);
      });
    });

    if (Platform.OS === 'ios') {
      t.describe(`Video iOS fullscreen player`, () => {
        t.it('presents the player and calls callback func', async () => {
          const onIOSFullscreenUpdate = t.jasmine.createSpy('onIOSFullscreenUpdate');
          await mountAndWaitFor(
            <Video
              style={style}
              source={source}
              ref={refSetter}
              onIOSFullscreenUpdate={onIOSFullscreenUpdate}
            />,
            'onReadyForDisplay'
          );
          const expectUpdate = fullscreenUpdate =>
            t.expect(onIOSFullscreenUpdate).toHaveBeenCalledWith(
              t.jasmine.objectContaining({
                fullscreenUpdate,
              })
            );
          await instance.presentIOSFullscreenPlayer();
          expectUpdate(Video.IOS_FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT);
          expectUpdate(Video.IOS_FULLSCREEN_UPDATE_PLAYER_DID_PRESENT);
          await instance.dismissIOSFullscreenPlayer();
          expectUpdate(Video.IOS_FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS);
          expectUpdate(Video.IOS_FULLSCREEN_UPDATE_PLAYER_DID_DISMISS);
        });
      });
    }

    // Actually values 2.0 and -0.5 shouldn't be allowed, however at the moment
    // it is possible to set them through props successfully.
    testPropValues('volume', [0.5, 1.0, 2.0, -0.5]);
    testPropSetter('volume', 'setVolumeAsync', [0, 0.5, 1], () => {
      t.it('errors when trying to set it to 2', async () => {
        let error = null;
        try {
          const props = { style, source, ref: refSetter };
          await mountAndWaitFor(<Video {...props} />);
          await instance.setVolumeAsync(2);
        } catch (err) {
          error = err;
        }
        t.expect(error).toBeDefined();
        t.expect(error.toString()).toMatch(/value .+ between/);
      });

      t.it('errors when trying to set it to -0.5', async () => {
        let error = null;
        try {
          const props = { style, source, ref: refSetter };
          await mountAndWaitFor(<Video {...props} />);
          await instance.setVolumeAsync(-0.5);
        } catch (err) {
          error = err;
        }
        t.expect(error).toBeDefined();
        t.expect(error.toString()).toMatch(/value .+ between/);
      });
    });

    testPropValues('isMuted', [true, false]);
    testPropSetter('isMuted', 'setIsMutedAsync', [true, false]);

    testPropValues('isLooping', [true, false]);
    testPropSetter('isLooping', 'setIsLoopingAsync', [true, false]);

    // Actually values 34 and -0.5 shouldn't be allowed, however at the moment
    // it is possible to set them through props successfully.
    testPropValues('rate', [0.5, 1.0, 2, 34, -0.5]);
    testPropSetter('rate', 'setRateAsync', [0, 0.5, 1], () => {
      t.it('errors when trying to set it above 32', async () => {
        let error = null;
        try {
          const props = { style, source, ref: refSetter };
          await mountAndWaitFor(<Video {...props} />);
          await instance.setRateAsync(34);
        } catch (err) {
          error = err;
        }
        t.expect(error).toBeDefined();
        t.expect(error.toString()).toMatch(/value .+ between/);
      });

      t.it('errors when trying to set it under 0', async () => {
        let error = null;
        try {
          const props = { style, source, ref: refSetter };
          await mountAndWaitFor(<Video {...props} />);
          await instance.setRateAsync(-0.5);
        } catch (err) {
          error = err;
        }
        t.expect(error).toBeDefined();
        t.expect(error.toString()).toMatch(/value .+ between/);
      });
    });

    testPropValues('shouldPlay', [true, false]);
    testPropValues('shouldCorrectPitch', [true, false]);

    t.describe('Video.onPlaybackStatusUpdate', () => {
      t.it('gets called with `didJustFinish = true` when video is done playing', async () => {
        const onPlaybackStatusUpdate = t.jasmine.createSpy('onPlaybackStatusUpdate');
        const props = {
          onPlaybackStatusUpdate,
          source,
          style,
          ref: refSetter,
        };
        await mountAndWaitFor(<Video {...props} />);
        await retryForStatus(instance, { isBuffering: false, isLoaded: true });
        const status = await instance.getStatusAsync();
        await instance.setStatusAsync({
          shouldPlay: true,
          positionMillis: status.durationMillis - 500,
        });
        await retryForStatus(instance, { isPlaying: true });
        await new Promise(resolve => {
          setTimeout(() => {
            t
              .expect(onPlaybackStatusUpdate)
              .toHaveBeenCalledWith(t.jasmine.objectContaining({ didJustFinish: true }));
            resolve();
          }, 1000);
        });
      });
    });

    // It should work, but it doesn't.
    // TODO: fix.
    /* t.describe('Video.setOnPlaybackStatusUpdate', () => {
      t.it('sets the update callback func which is called during playing', async () => {
        const onPlaybackStatusUpdate = t.jasmine.createSpy('onPlaybackStatusUpdate');
        const props = {
          style,
          source,
          ref: refSetter,
          shouldPlay: true,
        };
        await mountAndWaitFor(<Video {...props} />);
        instance.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        await instance.setProgressUpdateIntervalAsync(100);
        await new Promise(resolve => {
          setTimeout(() => {
            t.expect(onPlaybackStatusUpdate).toHaveBeenCalled();
            t.expect(onPlaybackStatusUpdate.calls.count()).toBeGreaterThan(5);
            resolve();
          }, 800);
        });
      });
    }); */

    t.describe('Video.setProgressUpdateIntervalAsync', () => {
      t.it('sets frequence of the progress updates', async () => {
        const onPlaybackStatusUpdate = t.jasmine.createSpy('onPlaybackStatusUpdate');
        const props = {
          style,
          source,
          ref: refSetter,
          shouldPlay: true,
          onPlaybackStatusUpdate,
        };
        await mountAndWaitFor(<Video {...props} />);
        const updateInterval = 100;
        await instance.setProgressUpdateIntervalAsync(updateInterval);
        await new Promise(resolve => {
          setTimeout(() => {
            const expectedArgsCount = Platform.OS === 'android' ? 5 : 9;
            t.expect(onPlaybackStatusUpdate.calls.count()).toBeGreaterThan(expectedArgsCount);

            const realMillis = map(
              takeRight(filter(flatten(onPlaybackStatusUpdate.calls.allArgs()), 'isPlaying'), 4),
              'positionMillis'
            );

            for (let i = 3; i > 0; i--) {
              const difference = Math.abs(realMillis[i] - realMillis[i - 1] - updateInterval);
              t.expect(difference).toBeLessThan(updateInterval / 2 + 1);
            }

            resolve();
          }, 1500);
        });
      });
    });

    t.describe('Video.setPositionAsync', () => {
      t.it('sets position of the video', async () => {
        const props = { style, source, ref: refSetter };
        await mountAndWaitFor(<Video {...props} />);
        await retryForStatus(instance, { isBuffering: false });
        const status = await instance.getStatusAsync();
        await retryForStatus(instance, { playableDurationMillis: status.durationMillis });
        const positionMillis = 500;
        await instance.setPositionAsync(positionMillis);
        await retryForStatus(instance, { positionMillis });
      });
    });

    t.describe('Video.loadAsync', () => {
      t.it('loads the video', async () => {
        const props = { style };
        const instance = await mountAndWaitFor(<Video {...props} />, 'ref');
        await instance.loadAsync(source);
        await retryForStatus(instance, { isLoaded: true });
      });

      // better positionmillis check
      t.it('sets the initial status', async () => {
        const props = { style };
        const instance = await mountAndWaitFor(<Video {...props} />, 'ref');
        const initialStatus = { volume: 0.5, isLooping: true, rate: 0.5 };
        await instance.loadAsync(source, { ...initialStatus, positionMillis: 1000 });
        await retryForStatus(instance, { isLoaded: true, ...initialStatus });
        const status = await instance.getStatusAsync();
        t.expect(status.positionMillis).toBeLessThan(1100);
        t.expect(status.positionMillis).toBeGreaterThan(900);
      });
    });

    t.describe('Video.unloadAsync', () => {
      t.it('unloads the video', async () => {
        const props = { style, source, ref: refSetter };
        await mountAndWaitFor(<Video {...props} />);
        await retryForStatus(instance, { isLoaded: true });
        await instance.unloadAsync();
        await retryForStatus(instance, { isLoaded: false });
      });
    });

    t.describe('Video.pauseAsync', () => {
      t.it('pauses the video', async () => {
        const props = { style, source, shouldPlay: true, ref: refSetter };
        await mountAndWaitFor(<Video {...props} />);
        await retryForStatus(instance, { isPlaying: true });
        await new Promise(r => setTimeout(r, 500));
        await instance.pauseAsync();
        await retryForStatus(instance, { isPlaying: false });
        const { positionMillis } = await instance.getStatusAsync();
        t.expect(positionMillis).toBeGreaterThan(0);
      });
    });

    t.describe('Video.playAsync', () => {
      t.it('plays the stopped video', async () => {
        const props = { style, source, ref: refSetter };
        await mountAndWaitFor(<Video {...props} />);
        await retryForStatus(instance, { isLoaded: true });
        await instance.playAsync();
        await retryForStatus(instance, { isPlaying: true });
      });

      t.it('plays the paused video', async () => {
        const props = { style, source, ref: refSetter };
        await mountAndWaitFor(<Video {...props} />);
        await retryForStatus(instance, { isLoaded: true });
        await instance.playAsync();
        await retryForStatus(instance, { isPlaying: true });
        await instance.pauseAsync();
        await retryForStatus(instance, { isPlaying: false });
        await instance.playAsync();
        await retryForStatus(instance, { isPlaying: true });
      });
    });

    t.describe('Video.replayAsync', () => {
      t.it('replays the video', async () => {
        await mountAndWaitFor(<Video source={source} ref={refSetter} style={style} shouldPlay />);
        await retryForStatus(instance, { isPlaying: true });
        await waitFor(500);
        const statusBefore = await instance.getStatusAsync();
        await instance.replayAsync();
        await retryForStatus(instance, { isPlaying: true });
        const statusAfter = await instance.getStatusAsync();
        t.expect(statusAfter.positionMillis).toBeLessThan(statusBefore.positionMillis);
      });

      t.it('calls the onPlaybackStatusUpdate with hasJustBeenInterrupted = true', async () => {
        const onPlaybackStatusUpdate = t.jasmine.createSpy('onPlaybackStatusUpdate');
        const props = {
          style,
          source,
          ref: refSetter,
          shouldPlay: true,
          onPlaybackStatusUpdate,
        };
        await mountAndWaitFor(<Video {...props} />);
        await retryForStatus(instance, { isPlaying: true });
        await waitFor(500);
        await instance.replayAsync();
        t
          .expect(onPlaybackStatusUpdate)
          .toHaveBeenCalledWith(t.jasmine.objectContaining({ hasJustBeenInterrupted: true }));
      });
    });

    t.describe('Video.stopAsync', () => {
      t.it('stops a playing video', async () => {
        const props = { style, source, shouldPlay: true, ref: refSetter };
        await mountAndWaitFor(<Video {...props} />);
        await retryForStatus(instance, { isPlaying: true });
        await instance.stopAsync();
        await retryForStatus(instance, { isPlaying: false, positionMillis: 0 });
      });

      t.it('stops a paused video', async () => {
        const props = { style, source, shouldPlay: true, ref: refSetter };
        await mountAndWaitFor(<Video {...props} />);
        await retryForStatus(instance, { isPlaying: true });
        await instance.pauseAsync();
        await retryForStatus(instance, { isPlaying: false });
        await instance.stopAsync();
        await retryForStatus(instance, { isPlaying: false, positionMillis: 0 });
      });
    });
  });
}
