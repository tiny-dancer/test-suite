'use strict';

import { Contacts } from 'exponent';

export const name = 'Contacts';

export function test(t) {
  t.describe('Contacts', () => {
    t.describe('Contacts.getContactsAsync()', () => {
      t.it(
        'gets at least one result, all results of right shape',
        async () => {
          const contacts = await Contacts.getContactsAsync([
            Contacts.PHONE_NUMBER,
            Contacts.EMAIL,
          ]);
          t.expect(contacts.length > 0).toBe(true);
          contacts.forEach(({ id, name, phoneNumber, email}) => {
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
          const contacts = await Contacts.getContactsAsync([
            Contacts.EMAIL,
          ]);
          t.expect(contacts.length > 0).toBe(true);
          contacts.forEach(({ id, name, phoneNumber, email}) => {
            t.expect(typeof phoneNumber === 'undefined').toBe(true);
          });
        },
      );

      t.it(
        'skips email if not asked',
        async () => {
          const contacts = await Contacts.getContactsAsync([
            Contacts.PHONE_NUMBER,
          ]);
          t.expect(contacts.length > 0).toBe(true);
          contacts.forEach(({ id, name, phoneNumber, email}) => {
            t.expect(typeof email === 'undefined').toBe(true);
          });
        },
      );
    });
  });
}
