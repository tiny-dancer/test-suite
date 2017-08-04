'use strict';

import { SecureStore } from 'expo';

export const name = 'SecureStore';

export function test(t) {
  const value = 'value-to-test';
  const key = 'key-to-test';
  const emptyKey = null;
  const emptyValue = null;
  const options = { keychainService: 'test-service' };
  const optionsServiceA = { keychainService: 'service-A' };
  const optionsServiceB = { keychainService: 'service-B' };
  t.describe('SecureStore: store -> fetch -> delete -> fetch -> err', () => {
    t.it('Sets a value with a key', async done => {
      try {
        const result = await SecureStore.setValueWithKeyAsync(value, key, {});
        t.expect(result).toBe(undefined);
      } catch (e) {
        done.fail(e);
      }
    });
    t.it('Fetch the value stored with the key', async done => {
      try {
        const fetchedValue = await SecureStore.getValueWithKeyAsync(key, {});
        t.expect(fetchedValue).toBe(value);
      } catch (e) {
        done.fail(e);
      }
    });
    t.it('Delete the value associated with the key', async done => {
      try {
        const result = await SecureStore.deleteValueWithKeyAsync(key, {});
        t.expect(result).toBe(undefined);
      } catch (e) {
        done.fail(e);
      }
    });
    t.it(
      'Fetch the previously deleted key, expect no value error',
      async done => {
        try {
          const fetchedValue = await SecureStore.getValueWithKeyAsync(key, {});
          done.fail(fetchedValue);
        } catch (e) {
          t.expect(e).toBeTruthy;
        }
      }
    );
  });
  t.describe(
    'SecureStore: store -> fetch -> delete -> fetch -> err with Options',
    () => {
      t.it('Sets a value with a key and keychainService', async done => {
        try {
          const result = await SecureStore.setValueWithKeyAsync(
            value,
            key,
            options
          );
          t.expect(result).toBe(undefined);
        } catch (e) {
          done.fail(e);
        }
      });
      t.it(
        'Fetch the value stored with the key and keychainService',
        async done => {
          try {
            const fetchedValue = await SecureStore.getValueWithKeyAsync(
              key,
              options
            );
            t.expect(fetchedValue).toBe(value);
          } catch (e) {
            done.fail(e);
          }
        }
      );
      t.it('Delete the value associated with the key', async done => {
        try {
          const result = await SecureStore.deleteValueWithKeyAsync(
            key,
            options
          );
          t.expect(result).toBe(undefined);
        } catch (e) {
          done.fail(e);
        }
      });
      t.it(
        'Fetch the previously deleted key, expect no value error',
        async done => {
          try {
            const fetchedValue = await SecureStore.getValueWithKeyAsync(
              key,
              options
            );
            done.fail(fetchedValue);
          } catch (e) {
            t.expect(e).toBeTruthy;
          }
        }
      );
    }
  );
  t.describe('SecureStore: store with empty key -> err', () => {
    t.it('Sets a value with an empty key, expect error', async done => {
      try {
        const result = await SecureStore.setValueWithKeyAsync(
          value,
          emptyKey,
          {}
        );
        done.fail(result);
      } catch (e) {
        t.expect(e).toBeTruthy;
      }
    });
  });
  t.describe('SecureStore: store with empty Value -> err', () => {
    t.it('Sets an empty value with a key, expect error', async done => {
      try {
        const result = await SecureStore.setValueWithKeyAsync(
          emptyValue,
          key,
          {}
        );
        done.fail(result);
      } catch (e) {
        t.expect(e).toBeTruthy;
      }
    });
  });
  t.describe(
    'SecureStore: store value with keychainServiceA, fetch with keychainServiceB -> err',
    () => {
      t.it('Sets a value with keychainServiceA', async done => {
        try {
          const result = await SecureStore.setValueWithKeyAsync(
            value,
            key,
            optionsServiceA
          );
          t.expect(result).toBe(undefined);
        } catch (e) {
          done.fail(e);
        }
      });
      t.it('Fetch value with keychainServiceB, expect error', async done => {
        try {
          const result = await SecureStore.getValueWithKeyAsync(
            key,
            optionsServiceB
          );
          done.fail(result);
        } catch (e) {
          t.expect(e).toBeTruthy;
        }
      });
    }
  );
}
