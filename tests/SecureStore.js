'use strict';

import { SecureStore } from 'expo';

export const name = 'SecureStore';

export function test(t) {
  const value = 'value-to-test';
  const longValue =
    'EAAT3TDAdWacBAMjZAq4clOJEOvf8JW5ZAxAsRnZCGRBNb1IRVFrzwiNqsM2I5MyogyPCc78TL1KZAFZAnZAFHeZCjkN8VMytKpcKD4HQEtVZBoAS54WkGbA2STjOe1vV3XOx3BY9OsDpDcD4yTZAv1OcI1wNlVvryiujZBeheVnELK6KTyzUgrPM8zZA42ZAB6SEcZADoj4MNsX5DqrJ3FtG0cxjFCD0lhKfBmTQMrZBCmuefRrQZDZDEAAT3TDAdWacBAMjZAq4clOJEOvf8JW5ZAxAsRnZCGRBNb1IRVFrzwiNqsM2I5MyogyPCc78TL1KZAFZAnZAFHeZCjkN8VMytKpcKD4HQEtVZBoAS54WkGbA2STjOe1vV3XOx3BY9OsDpDcD4yTZAv1OcI1wNlVvryiujZBeheVnELK6KTyzUgrPM8zZA42ZAB6SEcZADoj4MNsX5DqrJ3FtG0cxjFCD0lhKfBmTQMrZBCmuefRrQZDZDEAAT3TDAdWacBAMjZAq4clOJEOvf8JW5ZAxAsRnZCGRBNb1IRVFrzwiNqsM2I5MyogyPCc78TL1KZAFZAnZAFHeZCjkN8VMytKpcKD4HQEtVZBoAS54WkGbA2STjOe1vV3XOx3BY9OsDpDcD4yTZAv1OcI1wNlVvryiujZBeheVnELK6KTyzUgrPM8zZA42ZAB6SEcZADoj4MNsX5DqrJ3FtG0cxjFCD0lhKfBmTQMrZBCmuefRrQZDZDEAAT3TDAdWacBAMjZAq4clOJEOvf8JW5ZAxAsRnZCGRBNb1IRVFrzwiNqsM2I5MyogyPCc78TL1KZAFZAnZAFHeZCjkN8VMytKpcKD4HQEtVZBoAS54WkGbA2STjOe1vV3XOx3BY9OsDpDcD4yTZAv1OcI1wNlVvryiujZBeheVnELK6KTyzUgrPM8zZA42ZAB6SEcZADoj4MNsX5DqrJ3FtG0cxjFCD0lhKfBmTQMrZBCmuefRrQZDZD';
  const key = 'key-to-test';
  const emptyKey = null;
  const emptyValue = null;
  const optionsServiceA = { keychainService: 'service-A' };
  const optionsServiceB = { keychainService: 'service-B' };
  t.describe('SecureStore: store -> fetch -> delete -> fetch -> err:', () => {
    t.it('Sets a value with a key', async done => {
      try {
        const result = await SecureStore.setItemAsync(key, value, {});
        t.expect(result).toBe(undefined);
      } catch (e) {
        done.fail(e);
      }
    });
    t.it('Fetch the value stored with the key', async done => {
      try {
        const fetchedValue = await SecureStore.getItemAsync(key, {});
        t.expect(fetchedValue).toBe(value);
      } catch (e) {
        done.fail(e);
      }
    });
    t.it('Delete the value associated with the key', async done => {
      try {
        const result = await SecureStore.deleteItemAsync(key, {});
        t.expect(result).toBe(undefined);
      } catch (e) {
        done.fail(e);
      }
    });
    t.it(
      'Fetch the previously deleted key, expect no value error',
      async done => {
        try {
          const fetchedValue = await SecureStore.getItemAsync(key, {});
          done.fail(fetchedValue);
        } catch (e) {
          t.expect(e).toBeTruthy;
        }
      }
    );
  });
  t.describe(
    'SecureStore: store -> fetch -> delete -> fetch -> err with Options:',
    () => {
      t.it('Sets a value with a key and keychainService', async done => {
        try {
          const result = await SecureStore.setItemAsync(key, value, {
            keychainService: 'service',
          });
          t.expect(result).toBe(undefined);
        } catch (e) {
          done.fail(e);
        }
      });
      t.it(
        'Fetch the value stored with the key and keychainService',
        async done => {
          try {
            const fetchedValue = await SecureStore.getItemAsync(key, {
              keychainService: 'service',
            });
            t.expect(fetchedValue).toBe(value);
          } catch (e) {
            done.fail(e);
          }
        }
      );
      t.it('Delete the value associated with the key', async done => {
        try {
          const result = await SecureStore.deleteItemAsync(key, {
            keychainService: 'service',
          });
          t.expect(result).toBe(undefined);
        } catch (e) {
          done.fail(e);
        }
      });
      t.it(
        'Fetch the previously deleted key, expect no value error',
        async done => {
          try {
            const fetchedValue = await SecureStore.getItemAsync(key, {
              keychainService: 'service',
            });
            done.fail(fetchedValue);
          } catch (e) {
            t.expect(e).toBeTruthy;
          }
        }
      );
    }
  );
  t.describe('SecureStore: store with empty key -> err:', () => {
    t.it('Sets a value with an empty key, expect error', async done => {
      try {
        const result = await SecureStore.setItemAsync(emptyKey, value, {});
        done.fail(result);
      } catch (e) {
        t.expect(e).toBeTruthy;
      }
    });
  });
  t.describe('SecureStore: store with empty Value -> err:', () => {
    t.it('Sets an empty value with a key, expect error', async done => {
      try {
        const result = await SecureStore.setItemAsync(key, emptyValue, {});
        done.fail(result);
      } catch (e) {
        t.expect(e).toBeTruthy;
      }
    });
  });
  t.describe(
    'SecureStore: store value with keychainServiceA, fetch with keychainServiceB -> err:',
    () => {
      t.it('Sets a value with keychainServiceA', async done => {
        try {
          const result = await SecureStore.setItemAsync(
            key,
            value,
            optionsServiceA
          );
          t.expect(result).toBe(undefined);
        } catch (e) {
          done.fail(e);
        }
      });
      t.it('Fetch value with keychainServiceB, expect error', async done => {
        try {
          const result = await SecureStore.getItemAsync(key, optionsServiceB);
          done.fail(result);
        } catch (e) {
          t.expect(e).toBeTruthy;
        }
      });
    }
  );
  t.describe(
    'SecureStore: store long value, fetch long value -> Success:',
    () => {
      t.it('Set long value', async done => {
        try {
          const result = await SecureStore.setItemAsync(key, longValue);
          t.expect(result).toBe(undefined);
        } catch (e) {
          done.fail(e);
        }
      });
      t.it('Fetch long value', async done => {
        try {
          const result = await SecureStore.getItemAsync(key);
          t.expect(result).toBe(longValue);
        } catch (e) {
          done.fail(e);
        }
      });
    }
  );
}
