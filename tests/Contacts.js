'use strict';

import { Contacts, Permissions } from 'expo';
import * as TestUtils from '../TestUtils';

export const name = 'Contacts';

export function test(t) {
  t.fdescribe('Contacts', () => {
    let firstContact;
    t.describe('Contacts.getContactsAsync()', () => {
      t.it('gets permission and at least one result, all results of right shape', async () => {
        await TestUtils.acceptPermissionsAndRunCommandAsync(() => {
          return Permissions.askAsync(Permissions.CONTACTS);
        });
        let contacts = await Contacts.getContactsAsync({
          fields: [Contacts.PHONE_NUMBERS, Contacts.EMAILS],
          pageSize: 20,
        });
        t.expect(contacts.total > 0).toBe(true);
        t.expect(contacts.data.length > 0).toBe(true);
        contacts.data.forEach(({ id, name, phoneNumbers, emails }) => {
          t.expect(typeof id === 'string' || typeof id === 'number').toBe(true);
          t.expect(typeof name === 'string' || typeof name === 'undefined').toBe(true);
          t.expect(Array.isArray(phoneNumbers) || typeof phoneNumbers === 'undefined').toBe(true);
          t.expect(Array.isArray(emails) || typeof emails === 'undefined').toBe(true);
        });
        firstContact = contacts.data[0];
      });

      t.it('skips phone number if not asked', async () => {
        const contacts = await Contacts.getContactsAsync({
          fields: [Contacts.EMAILS],
        });
        t.expect(contacts.total > 0).toBe(true);
        t.expect(contacts.data.length > 0).toBe(true);
        contacts.data.forEach(({ id, name, phoneNumbers, emails }) => {
          t.expect(typeof phoneNumbers === 'undefined').toBe(true);
        });
      });

      t.it('skips email if not asked', async () => {
        const contacts = await Contacts.getContactsAsync({
          fields: [Contacts.PHONE_NUMBERS],
        });
        t.expect(contacts.total > 0).toBe(true);
        t.expect(contacts.data.length > 0).toBe(true);
        contacts.data.forEach(({ id, name, phoneNumbers, emails }) => {
          t.expect(typeof emails === 'undefined').toBe(true);
        });
      });

      t.it('skips additional properties if fields is empty', async () => {
        const contacts = await Contacts.getContactsAsync({
          fields: [],
        });
        t.expect(contacts.total > 0).toBe(true);
        t.expect(contacts.data.length > 0).toBe(true);
        contacts.data.forEach(contact => {
          const toSkip = [
            phoneNumbers,
            emails,
            addresses,
            socialProfiles,
            instantMessageAddresses,
            urls,
            dates,
            relationships,
            note,
            namePrefix,
            nameSuffix,
            phoneticFirstName,
            phoneticMiddleName,
            phoneticLastName,
          ];
          toSkip.forEach(entry => {
            t.expect(typeof entry === 'undefined').toBe(true);
          });
        });
      });

      t.it('returns consistent image data', async () => {
        const contacts = await Contacts.getContactsAsync({
          fields: [Contacts.IMAGE, Contacts.THUMBNAIL],
        });
        if (contacts.total > 0) {
          contacts.data.forEach(contact => {
            if (contact.imageAvailable) {
              t.expect(typeof contact.thumbnail === 'object').toBe(true);
              t.expect(typeof contact.thumbnail.uri === 'string').toBe(true);
              t.expect(typeof contact.image === 'object' || typeof contact.image === 'undefined');
              if (contact.image) {
                t.expect(typeof contact.image.uri === 'string').toBe(true);
              }
            } else {
              t.expect(contact.thumbnail.uri).toBe(null);
              if (contact.image) {
                t.expect(contact.image.uri).toBe(null);
              }
            }
          });
        }
      });

      t.it('respects the page size', async () => {
        const contacts = await Contacts.getContactsAsync({
          fields: [Contacts.PHONE_NUMBERS],
          pageOffset: 0,
          pageSize: 2,
        });
        if (contacts.total >= 2) {
          t.expect(contacts.data.length).toBe(2);
        }
      });

      t.it('respects the page offset', async () => {
        const firstPage = await Contacts.getContactsAsync({
          fields: [Contacts.PHONE_NUMBERS],
          pageOffset: 0,
          pageSize: 2,
        });
        console.log(`FIRST PAGE: ${JSON.stringify(firstPage)}`);
        const secondPage = await Contacts.getContactsAsync({
          fields: [Contacts.PHONE_NUMBERS],
          pageOffset: 1,
          pageSize: 2,
        });
        console.log(`SECOND PAGE: ${JSON.stringify(secondPage)}`);

        if (firstPage.total >= 3) {
          t.expect(firstPage.data.length).toBe(2);
          t.expect(secondPage.data.length).toBe(2);
          t.expect(firstPage.data[0].id).not.toBe(secondPage.data[0].id);
          t.expect(firstPage.data[1].id).not.toBe(secondPage.data[1].id);
          t.expect(firstPage.data[1].id).toBe(secondPage.data[0].id);
        }
      });
    });
    t.describe('Contacts.getContactByIdAsync()', () => {
      t.it('gets a result of right shape', async () => {
        if (firstContact) {
          const contact = await Contacts.getContactByIdAsync({
            fields: [
              Contacts.PHONE_NUMBERS,
              Contacts.EMAILS,
              Contacts.ADDRESSES,
              Contacts.NOTE,
              Contacts.BIRTHDAY,
              Contacts.NON_GREGORIAN_BIRTHDAY,
              Contacts.NAME_PREFIX,
              Contacts.NAME_SUFFIX,
              Contacts.PHONETIC_FIRST_NAME,
              Contacts.PHONETIC_MIDDLE_NAME,
              Contacts.PHONETIC_LAST_NAME,
              Contacts.SOCIAL_PROFILES,
              Contacts.IM_ADDRESSES,
              Contacts.URLS,
              Contacts.DATES,
              Contacts.RELATIONSHIPS,
            ],
            id: firstContact.id,
          });
          const {
            id,
            name,
            firstName,
            middleName,
            lastName,
            nickname,
            jobTitle,
            company,
            department,
            imageAvailable,
            previousLastName, // ios only
            phoneNumbers,
            emails,
            addresses,
            image,
            thumbnail,
            note,
            nonGregorianBirthday, // ios only
            namePrefix,
            nameSuffix,
            phoneticFirstName,
            phoneticMiddleName,
            phoneticLastName,
            socialProfiles, // ios only
            instantMessageAddresses,
            urls,
            dates,
            relationships,
            birthday,
          } = contact;

          t.expect(typeof id === 'string' || typeof id === 'number').toBe(true);
          t.expect(typeof name === 'string' || typeof name === 'undefined').toBe(true);
          t.expect(Array.isArray(phoneNumbers) || typeof phoneNumbers === 'undefined').toBe(true);
          t.expect(Array.isArray(emails) || typeof emails === 'undefined').toBe(true);

          t.expect(typeof id === 'string' || typeof id === 'number').toBe(true);
          t.expect(typeof name === 'string' || typeof name === 'undefined').toBe(true);
          t.expect(Array.isArray(phoneNumbers) || typeof phoneNumbers === 'undefined').toBe(true);
          t.expect(Array.isArray(emails) || typeof emails === 'undefined').toBe(true);
          t
            .expect(typeof imageAvailable === 'boolean' || typeof imageAvailable === 'undefined')
            .toBe(true);
          const strings = [
            name,
            firstName,
            middleName,
            lastName,
            previousLastName,
            nickname,
            company,
            jobTitle,
            department,
            note,
            namePrefix,
            nameSuffix,
            phoneticFirstName,
            phoneticMiddleName,
            phoneticLastName,
          ];
          strings.forEach(string => {
            t.expect(typeof string === 'string' || typeof string === 'undefined').toBe(true);
          });

          const arrays = [
            phoneNumbers,
            emails,
            addresses,
            socialProfiles,
            instantMessageAddresses,
            urls,
            dates,
            relationships,
          ];
          arrays.forEach(array => {
            t.expect(Array.isArray(array) || typeof array === 'undefined').toBe(true);
          });

          t.expect(typeof birthday === 'object' || typeof birthday === 'undefined').toBe(true);
          t
            .expect(
              typeof nonGregorianBirthday === 'object' ||
                typeof nonGregorianBirthday === 'undefined'
            )
            .toBe(true);
        }
      });
    });
  });
}
