'use strict';

import { Contacts, Permissions } from 'expo';
import * as TestUtils from '../TestUtils';

export const name = 'Contacts';

export function test(t) {
  t.describe('Contacts', () => {
    t.describe('Contacts.getContactsAsync()', () => {
      t.it(
        'gets permission and at least one result, all results of right shape',
        async () => {
          await TestUtils.acceptPermissionsAndRunCommandAsync(() => {
            return Permissions.askAsync(Permissions.CONTACTS);
          });

          let contacts = await Contacts.getContactsAsync({
            fields: [
              Contacts.PHONE_NUMBER,
              Contacts.EMAIL,
            ],
          });
          t.expect(contacts.total > 0).toBe(true);
          t.expect(contacts.data.length > 0).toBe(true);
          contacts.data.forEach(({ id, name, phoneNumber, email}) => {
            t.expect(typeof id === 'number').toBe(true);
            t.expect(typeof name === 'string' ||
                     typeof name === 'undefined').toBe(true);
            t.expect(typeof phoneNumber === 'string' ||
                     typeof phoneNumber === 'undefined').toBe(true);
            t.expect(typeof email === 'string' ||
                     typeof email === 'undefined').toBe(true);
          });
        },
      );

      t.it(
        'skips phone number if not asked',
        async () => {
          const contacts = await Contacts.getContactsAsync({
            fields: [
              Contacts.EMAIL,
            ],
          });
          t.expect(contacts.total > 0).toBe(true);
          t.expect(contacts.data.length > 0).toBe(true);
          contacts.data.forEach(({ id, name, phoneNumber, email}) => {
            t.expect(typeof phoneNumber === 'undefined').toBe(true);
          });
        },
      );

      t.it(
        'skips email if not asked',
        async () => {
          const contacts = await Contacts.getContactsAsync({
            fields: [
              Contacts.PHONE_NUMBER,
            ],
          });
          t.expect(contacts.total > 0).toBe(true);
          t.expect(contacts.data.length > 0).toBe(true);
          contacts.data.forEach(({ id, name, phoneNumber, email}) => {
            t.expect(typeof email === 'undefined').toBe(true);
          });
        },
      );

      t.it(
        'respects the page size',
        async () => {
          const contacts = await Contacts.getContactsAsync({
            fields: [
              Contacts.PHONE_NUMBER,
            ],
            pageOffset: 0,
            pageSize: 2,
          });
          if (contacts.total >= 2) {
            t.expect(contacts.data.length).toBe(2);
          }
        },
      );

      t.it(
        'respects the page offset',
        async () => {
          const firstPage = await Contacts.getContactsAsync({
            fields: [
              Contacts.PHONE_NUMBER,
            ],
            pageOffset: 0,
            pageSize: 2,
          });
          const secondPage = await Contacts.getContactsAsync({
            fields: [
              Contacts.PHONE_NUMBER,
            ],
            pageOffset: 1,
            pageSize: 2,
          });

          if (firstPage.total >= 3) {
            t.expect(firstPage.data.length).toBe(2);
            t.expect(secondPage.data.length).toBe(2);
            t.expect(firstPage.data[0].id).not.toBe(secondPage.data[0].id);
            t.expect(firstPage.data[1].id).not.toBe(secondPage.data[1].id);
            t.expect(firstPage.data[1].id).toBe(secondPage.data[0].id);
          }
        },
      );
    });
  });
}
