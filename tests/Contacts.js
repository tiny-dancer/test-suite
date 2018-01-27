'use strict';

import { Contacts, Permissions } from 'expo';
import * as TestUtils from '../TestUtils';

export const name = 'Contacts';

export function test(t) {
  t.fdescribe('Contacts', () => {
    let firstContact;
    let phoneContact;
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
        phoneContact = contacts.data.find(
          contact => contact.phoneNumbers && contact.phoneNumbers.length
        );
        firstContact = contacts.data[0];
      });

      t.it('should return phone label', () => {
        console.log(JSON.stringify(phoneContact.phoneNumbers));
        t.expect(phoneContact.phoneNumbers[0].label).toBeDefined();
      });

      t.it('should return phone id', () => {
        t.expect(phoneContact.phoneNumbers[0].id).toBeDefined();
      });

      t.it('should return phone number', () => {
        t.expect(phoneContact.phoneNumbers[0].number).toBeDefined();
      });

      t.it('should return phone primary', () => {
        t.expect(phoneContact.phoneNumbers[0].primary).toBeDefined();
      });

      t.it('should return emails', async () => {
        let contacts = await Contacts.getContactsAsync({
          fields: [Contacts.EMAILS],
          pageSize: 10000,
        });
        t.expect(contacts.total > 0).toBe(true);
        t.expect(contacts.data.length > 0).toBe(true);
        t
          .expect(
            contacts.data.some(
              ({ emails }) =>
                emails &&
                emails.length &&
                emails[0].id &&
                emails[0].label &&
                emails[0].email &&
                typeof emails[0].primary !== 'undefined'
            )
          )
          .toBe(true);
      });

      t.it('should return note', async () => {
        await TestUtils.acceptPermissionsAndRunCommandAsync(() => {
          return Permissions.askAsync(Permissions.CONTACTS);
        });
        let contacts = await Contacts.getContactsAsync({
          fields: [Contacts.NOTE],
          pageSize: 10000,
        });
        t.expect(contacts.total > 0).toBe(true);
        t.expect(contacts.data.length > 0).toBe(true);
        t.expect(contacts.data.some(({ note }) => note && note.length)).toBe(true);
      });

      t.it('should return dates and birthday', async () => {
        await TestUtils.acceptPermissionsAndRunCommandAsync(() => {
          return Permissions.askAsync(Permissions.CONTACTS);
        });
        let contacts = await Contacts.getContactsAsync({
          fields: [Contacts.DATES, Contacts.BIRTHDAY],
          pageSize: 10000,
        });
        t.expect(contacts.total > 0).toBe(true);
        t.expect(contacts.data.length > 0).toBe(true);
        t
          .expect(
            contacts.data.some(
              ({ dates }) =>
                dates && dates.length && dates[0].day && dates[0].month && dates[0].year
            )
          )
          .toBe(true);
        t
          .expect(
            contacts.data.some(
              ({ birthday }) => birthday && birthday.day && birthday.month && birthday.year
            )
          )
          .toBe(true);
      });

      t.it('should return instantMessageAddresses', async () => {
        await TestUtils.acceptPermissionsAndRunCommandAsync(() => {
          return Permissions.askAsync(Permissions.CONTACTS);
        });
        let contacts = await Contacts.getContactsAsync({
          fields: [Contacts.IM_ADDRESSES],
          pageSize: 10000,
        });
        t.expect(contacts.total > 0).toBe(true);
        t.expect(contacts.data.length > 0).toBe(true);
        t
          .expect(
            contacts.data.some(
              ({ instantMessageAddresses }) =>
                instantMessageAddresses &&
                instantMessageAddresses.length &&
                instantMessageAddresses[0].service &&
                instantMessageAddresses[0].username
            )
          )
          .toBe(true);
      });

      t.it('should return urlAddresses', async () => {
        await TestUtils.acceptPermissionsAndRunCommandAsync(() => {
          return Permissions.askAsync(Permissions.CONTACTS);
        });
        let contacts = await Contacts.getContactsAsync({
          fields: [Contacts.URLS],
          pageSize: 10000,
        });
        t.expect(contacts.total > 0).toBe(true);
        t.expect(contacts.data.length > 0).toBe(true);
        t
          .expect(
            contacts.data.some(
              ({ urlAddresses }) => urlAddresses && urlAddresses.length && urlAddresses[0].url
            )
          )
          .toBe(true);
      });

      t.it('should return relationships', async () => {
        let contacts = await Contacts.getContactsAsync({
          fields: [Contacts.RELATIONSHIPS],
          pageSize: 10000,
        });
        t.expect(contacts.total > 0).toBe(true);
        t.expect(contacts.data.length > 0).toBe(true);
        t
          .expect(
            contacts.data.some(
              ({ relationships }) =>
                relationships &&
                relationships.length &&
                relationships[0].name &&
                relationships[0].id &&
                relationships[0].label
            )
          )
          .toBe(true);
      });

      t.it('skips additional properties if fields is empty', async () => {
        const contacts = await Contacts.getContactsAsync({
          fields: [],
        });
        t.expect(contacts.total > 0).toBe(true);
        t.expect(contacts.data.length > 0).toBe(true);
        contacts.data.forEach(contact => {
          const toSkip = [
            contact.phoneNumbers,
            contact.emails,
            contact.addresses,
            contact.socialProfiles,
            contact.instantMessageAddresses,
            contact.urls,
            contact.dates,
            contact.relationships,
            contact.note,
            contact.namePrefix,
            contact.nameSuffix,
            contact.phoneticFirstName,
            contact.phoneticMiddleName,
            contact.phoneticLastName,
          ];
          toSkip.forEach(entry => {
            t.expect(typeof entry === 'undefined').toBe(true);
          });
        });
      });

      t.it('should returns consistent image data', async () => {
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
        const secondPage = await Contacts.getContactsAsync({
          fields: [Contacts.PHONE_NUMBERS],
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
      });
    });
    t.describe('Contacts.getContactByIdAsync()', () => {
      let contact;
      t.it('should retrieve a contact', async () => {
        contact = await Contacts.getContactByIdAsync({
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

        t.expect(contact).toBeDefined();
      });

      // const {
      //   id,
      //   name,
      //   firstName,
      //   middleName,
      //   lastName,
      //   nickname,
      //   jobTitle,
      //   company,
      //   department,
      //   imageAvailable,
      //   previousLastName, // ios only
      //   phoneNumbers,
      //   emails,
      //   addresses,
      //   image,
      //   thumbnail,
      //   note,
      //   nonGregorianBirthday, // ios only
      //   namePrefix,
      //   nameSuffix,
      //   phoneticFirstName,
      //   phoneticMiddleName,
      //   phoneticLastName,
      //   socialProfiles, // ios only
      //   instantMessageAddresses,
      //   urls,
      //   dates,
      //   relationships,
      //   birthday,
      // } = contact;

      t.it('should return id', () => {
        t.expect(typeof contact.id === 'string' || typeof contact.id === 'number').toBe(true);
      });

      t.it('should return name', () => {
        t.expect(contact.name).toBeDefined();
        t.expect(typeof contact.name === 'string').toBe(true);
      });

      t.it('should return firstName', () => {
        t.expect(contact.firstName).toBeDefined();
        t.expect(typeof contact.firstName === 'string').toBe(true);
      });

      t.it('should return lastName', () => {
        t.expect(contact.firstName).toBeDefined();
        t.expect(typeof contact.firstName === 'string').toBe(true);
      });
    });
  });
}
