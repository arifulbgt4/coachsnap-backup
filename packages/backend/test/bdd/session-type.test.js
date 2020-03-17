/**
 * Parvez M Robin
 * this@parvezmrobin.com
 * Date: Jan 25, 2020
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const dotenv = require('dotenv');
const path = require('path');
const faker = require('faker');

const email1 = faker.internet.email();
const email2 = faker.internet.email();

const envPath = path.resolve('../../.env');
dotenv.config({ path: envPath });
const { signup } = require('../../src/resolvers/user/mutation');
const {
  createSessionType,
  updateSessionType,
  deleteSessionType,
} = require('../../src/resolvers/session-type/mutation');
const {
  prisma: {
    deleteManyUsers,
    updateUser,
    deleteManySessionTypes,
    sessionTypes,
    $exists,
  },
  // eslint-disable-next-line no-unused-vars
  DurationUpdateOneRequiredInput,
} = require('../../src/generated/prisma-client');

chai.should();

/**
 * **Coach - can mutate session type**
 *
 * **Should not** be able to create session type if coach is not verified
 * **Should not** be able to create a session type without providing all required values
 * **Should** be able to create session type with conflicting business hour
 * `cost`, `duration` and `seats` **should** be positive
 * **Should** be able to edit the session type
 * **Should** be able to delete the session type
 */
describe('Test session type', () => {
  let token1;
  let token2;
  const dummyContext1 = {
    request: { get: () => token1 },
  };
  const dummyContext2 = {
    request: { get: () => token2 },
  };

  let sessionType1Ids;
  let sessionType2Ids;

  // a regular expression that check each word in k is present in a string
  const makeRegEx = k => new RegExp(k.replace(/[A-Z]/g, '.*$&'), 'i');
  /** @type {DurationUpdateOneRequiredInput[]} */

  before(async function beforeHook() {
    // using anonymous function to `this` be available
    this.timeout(10000);
    const args = {
      email: email1,
      password: 'password',
      name: 'name',
      username: 'username1',
    };

    token1 = await signup(null, args);
    token2 = await signup(null, {
      ...args,
      email: email2,
      username: 'username2',
    });
  });

  describe('Test session type validations', () => {
    it('should not create session type with unverified coach', async () => {
      await createSessionType(null, {}, dummyContext1).should.be.rejectedWith(
        /permission/i
      );

      await updateUser({
        where: { email: email1 },
        data: { verified: true },
      });

      await updateUser({
        where: { email: email2 },
        data: { verified: true },
      });
    });

    it('should not create session type without all required fields', async () => {
      const baseSessionType = {
        name: 'Session Type',
        cost: 12,
      };

      for (const key of Object.keys(baseSessionType)) {
        const sessionType = { ...baseSessionType, [key]: null };
        await createSessionType(
          null,
          { data: sessionType },
          dummyContext1
        ).should.be.rejectedWith(Error, makeRegEx(key));
      }
    });

    it('should not create session type with non-positive int values', async () => {
      const baseSessionType = {
        name: 'Session Type',
        cost: 12,
        duration: 12,
        maxSeats: 12,
      };

      for (const key of ['cost', 'duration', 'maxSeats']) {
        const sessionType = { ...baseSessionType, [key]: -1 };
        await createSessionType(
          null,
          { data: sessionType },
          dummyContext1
        ).should.be.rejectedWith(Error, makeRegEx(key));
      }
    });
  });

  describe('Test session type creation', () => {
    const sessionType = {
      name: 'Session Type',
      cost: 12,
      duration: 12,
      maxSeats: 12,
    };

    before(async () => {
      // delete session types that created because of failed tests in previous describe block
      await deleteManySessionTypes();
    });
    it('should create a session type', async () => {
      await createSessionType(null, { data: sessionType }, dummyContext1).should
        .be.fulfilled;
      await createSessionType(null, { data: sessionType }, dummyContext2).should
        .be.fulfilled;
    });
  });

  describe('Test session type edit', () => {
    before(async () => {
      sessionType1Ids = (
        await sessionTypes({
          where: {
            coach: { email: email1 },
          },
        })
      ).map(st => st.id);
      sessionType2Ids = (
        await sessionTypes({
          where: {
            coach: { email: email2 },
          },
        })
      ).map(st => st.id);
    });

    // it('should not edit session type with invalid business hour', async () => {
    //   for (const sessionTypeId of sessionType1Ids) {
    //     for (const invalidBusinessHour of invalidBusinessHours) {
    //       await updateSessionType(
    //         null,
    //         { id: sessionTypeId, businessHour: invalidBusinessHour },
    //         dummyContext1
    //       ).should.be.rejectedWith(Error, /(?=.*business)(?=.*hour)/i);
    //     }
    //   }
    // });

    it('should not edit session with non-positive int values', async () => {
      for (const sessionTypeId of sessionType1Ids) {
        for (const key of ['cost', 'duration', 'maxSeats']) {
          await updateSessionType(
            null,
            { id: sessionTypeId, data: { [key]: -1 } },
            dummyContext1
          ).should.be.rejectedWith(Error, makeRegEx(key));
        }
      }
    });

    it('should edit all session types', async () => {
      for (const sessionTypeId of sessionType1Ids) {
        await updateSessionType(
          null,
          { id: sessionTypeId, data: { name: 'Session Type Edited' } },
          dummyContext1
        ).should.be.fulfilled;
      }
    });

    it('should not edit any session type of other coach', async () => {
      for (const sessionTypeId of sessionType2Ids) {
        await updateSessionType(
          null,
          { id: sessionTypeId, data: { name: 'Session Type Edited' } },
          dummyContext1
        ).should.be.rejectedWith(/permission/i);
      }
    });
  });

  describe('Test session type delete', () => {
    it('should not delete any session type of other coach', async () => {
      for (const sessionTypeId of sessionType2Ids) {
        await deleteSessionType(
          null,
          { id: sessionTypeId },
          dummyContext1
        ).should.be.rejectedWith(/permission/i);
      }
    });

    it('should delete all session types', async () => {
      for (const sessionTypeId of sessionType1Ids) {
        await deleteSessionType(null, { id: sessionTypeId }, dummyContext1)
          .should.be.fulfilled;
      }
      for (const sessionTypeId of sessionType2Ids) {
        await deleteSessionType(null, { id: sessionTypeId }, dummyContext2)
          .should.be.fulfilled;
      }
    });

    it('should verify that there is no session type', () => {
      return $exists.sessionType().should.eventually.be.false;
    });
  });

  after(async () => {
    await deleteManyUsers();
  });
});
