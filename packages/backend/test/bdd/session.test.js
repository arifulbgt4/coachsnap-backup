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
} = require('../../src/resolvers/session-type/mutation');
const {
  createSession,
  updateSession,
  deleteSession,
} = require('../../src/resolvers/session/mutation');
const {
  prisma: {
    deleteManyUsers,
    deleteManySessionTypes,
    updateUser,
    deleteManySessions,
    sessions,
    $exists,
  },
} = require('../../src/generated/prisma-client');

chai.should();

/**
 * **Coach - can mutate session**
 *
 * **Should not** be able to create a session if the coach is not verified
 * **Should not** be able to create a session without required values
 * **Should not** be able to create session with conflicting business hour
 * `cost`, `duration` and `seats` **should** be positive
 * `time` + `duration` **should not** exceed the businessHour.end of corresponding sessionType.
 * `time` + `duration` **should not** conflict with any other sessions of the coach
 * **Should not** be able to create a session in past date/time
 * **Should** be able to edit session
 * **Should** be able to delete session
 * **Should not** be able to edit other coachs' session
 * **Should not** be able to delete other coachs' session
 */
describe('Test session', () => {
  let token1;
  let token2;
  const dummyContext1 = {
    request: { get: () => token1 },
  };
  const dummyContext2 = {
    request: { get: () => token2 },
  };

  let sessionType1;
  let sessionType2;
  let session1Ids;
  let session2Ids;

  // a regular expression that check each word in k is present in a string
  const makeRegEx = k => new RegExp(k.replace(/[A-Z]/g, '.*$&'), 'i');
  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  const today8 = new Date(today);
  today8.setHours(8);
  const today9 = new Date(today);
  today9.setHours(9);
  const today730 = new Date(today);
  today730.setHours(7);
  today730.setMinutes(30);
  const today830 = new Date(today730);
  today830.setHours(8);
  const today930 = new Date(today730);
  today930.setHours(9);
  const tomorrow230 = new Date(today730);
  tomorrow230.setHours(26);
  const invalidAvailabilities = [
    {
      start: today8.toISOString(),
      end: today8.toISOString(),
    },
    {
      start: today9.toISOString(),
      end: today8.toISOString(),
    },
    {
      start: today9.toISOString(),
      end: tomorrow230.toISOString(),
    },
  ];

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

  describe('Test session creation with unverified coach', () => {
    it('should not create session with unverified coach', () => {
      return createSession(null, {}, dummyContext1).should.be.rejectedWith(
        /permission/i
      );
    });

    after(async () => {
      await updateUser({
        where: { email: email1 },
        data: { verified: true },
      });

      await updateUser({
        where: { email: email2 },
        data: { verified: true },
      });
    });
  });

  describe('Test session validations', () => {
    before(async () => {
      const sessionType = {
        name: 'Session Type',
        cost: 12,
        duration: 12,
        maxSeats: 12,
        // businessHour: {
        //   create: {
        //     start: '8:00',
        //     end: '9:00',
        //   },
        // },
      };

      sessionType1 = await createSessionType(
        null,
        { data: sessionType },
        dummyContext1
      );
      sessionType2 = await createSessionType(
        null,
        { data: sessionType },
        dummyContext2
      );
    });

    it('should not create session with invalid availability', async () => {
      for (const invalidAvailability of invalidAvailabilities) {
        await createSession(
          null,
          {
            sessionTypeId: sessionType1.id,
            data: { availability: { create: invalidAvailability } },
          },
          dummyContext1
        ).should.be.rejectedWith(Error, /availability|time/i);
      }
    });

    it('should not create session without all required fields', async () => {
      const baseSession = {
        name: 'Session',
        cost: 12,
        availability: {
          create: {
            start: today8.toISOString(),
            end: today9.toISOString(),
          },
        },
      };

      for (const key of ['name', 'cost']) {
        const session = { ...baseSession, [key]: null };
        await createSession(
          null,
          { sessionTypeId: sessionType1.id, data: session },
          dummyContext1
        ).should.be.rejectedWith(Error, makeRegEx(key));
      }
    });

    it('should not create session with non-positive int values', async () => {
      const baseSession = {
        name: 'Session',
        cost: 12,
        maxSeats: 12,
        availability: {
          create: {
            start: today8.toISOString(),
            end: today9.toISOString(),
          },
        },
      };

      for (const key of ['cost', 'maxSeats']) {
        const session = { ...baseSession, [key]: -1 };
        await createSession(
          null,
          { sessionTypeId: sessionType1.id, data: session },
          dummyContext1
        ).should.be.rejectedWith(Error, makeRegEx(key));
      }
    });

    it('should not create session with availability outside business hour', async () => {
      const baseSession = {
        name: 'Session',
        cost: 12,
        maxSeats: 12,
        availability: {
          create: {},
        },
      };

      const availabilities = [
        { start: today730.toISOString(), end: today830.toISOString() },
        { start: today830.toISOString(), end: today930.toISOString() },
      ];

      for (const availability of availabilities) {
        const session = {
          ...baseSession,
          availability: { create: availability },
        };
        await createSession(
          null,
          { sessionTypeId: sessionType1.id, data: session },
          dummyContext1
        ).should.be.rejectedWith(Error, /availability/i);
      }
    });
  });

  describe('Test session creation', () => {
    const session = {
      name: 'Session',
      cost: 12,
      maxSeats: 12,
      location: 'Dhaka, Bangladesh',
      duration: 30,
      availability: {
        create: {
          start: today8.toISOString(),
          end: today9.toISOString(),
        },
      },
    };

    before(async () => {
      // delete sessions that created because of failed tests in previous describe blocks
      await deleteManySessions();
    });

    it('should create a session', async () => {
      await createSession(
        null,
        { sessionTypeId: sessionType1.id, data: session },
        dummyContext1
      ).should.be.fulfilled;
      await createSession(
        null,
        { sessionTypeId: sessionType2.id, data: session },
        dummyContext2
      ).should.be.fulfilled;
    });

    it('should not create session with conflicting availability', async () => {
      await createSession(
        null,
        { sessionTypeId: sessionType1.id, data: session },
        dummyContext1
      ).should.be.rejectedWith(Error, /availability|time/i);
      await createSession(
        null,
        { sessionTypeId: sessionType2.id, data: session },
        dummyContext2
      ).should.be.rejectedWith(Error, /availability|time/i);

      let conflictingSession = {
        ...session,
        availability: {
          create: {
            start: today830.toISOString(),
            end: today930.toISOString(),
          },
        },
      };
      await createSession(
        null,
        { sessionTypeId: sessionType1.id, data: conflictingSession },
        dummyContext1
      ).should.be.rejectedWith(Error, /availability|time/i);
      await createSession(
        null,
        { sessionTypeId: sessionType2.id, data: conflictingSession },
        dummyContext2
      ).should.be.rejectedWith(Error, /availability|time/i);

      conflictingSession = {
        ...session,
        businessHour: {
          create: {
            start: today730.toISOString(),
            end: today830.toISOString(),
          },
        },
      };
      await createSession(
        null,
        { sessionTypeId: sessionType1.id, data: conflictingSession },
        dummyContext1
      ).should.be.rejectedWith(Error, /availability|time/i);
      await createSession(
        null,
        { sessionTypeId: sessionType2.id, data: conflictingSession },
        dummyContext2
      ).should.be.rejectedWith(Error, /availability|time/i);
    });
  });

  describe('Test session edit', () => {
    before(async () => {
      session1Ids = (
        await sessions({
          where: {
            coach: { email: email1 },
          },
        })
      ).map(st => st.id);
      session2Ids = (
        await sessions({
          where: {
            coach: { email: email2 },
          },
        })
      ).map(st => st.id);
    });

    it('should not edit session with invalid availability', async () => {
      for (const sessionId of session1Ids) {
        for (const invalidAvailability of invalidAvailabilities) {
          await updateSession(
            null,
            {
              id: sessionId,
              data: { availability: { create: invalidAvailability } },
            },
            dummyContext1
          ).should.be.rejectedWith(Error, /availability|time/i);
        }
      }
    });

    it('should not edit session with non-positive int values', async () => {
      for (const sessionId of session1Ids) {
        for (const key of ['cost', 'maxSeats']) {
          await updateSession(
            null,
            {
              id: sessionId,
              data: {
                [key]: -1,
                // availability: { update: { start: today8.toISOString(), end: today9.toISOString() } },
              },
            },
            dummyContext1
          ).should.be.rejectedWith(Error, makeRegEx(key));
        }
      }
    });

    it('should edit all sessions', async () => {
      for (const sessionId of session1Ids) {
        await updateSession(
          null,
          {
            id: sessionId,
            data: {
              name: 'Session Edited',
              // availability: { update: { start: today8.toISOString(), end: today9.toISOString() } },
            },
          },
          dummyContext1
        ).should.be.fulfilled;
      }
    });

    it('should not edit any session of other coach', async () => {
      for (const sessionId of session2Ids) {
        await updateSession(
          null,
          { id: sessionId, data: { name: 'Session Edited' } },
          dummyContext1
        ).should.be.rejectedWith(/permission/i);
      }
    });
  });

  describe('Test session delete', () => {
    it('should not delete any session of other coach', async () => {
      for (const sessionId of session2Ids) {
        await deleteSession(
          null,
          { id: sessionId },
          dummyContext1
        ).should.be.rejectedWith(/permission/i);
      }
    });

    it('should delete all sessions', async () => {
      for (const sessionId of session1Ids) {
        await deleteSession(null, { id: sessionId }, dummyContext1).should.be
          .fulfilled;
      }
      for (const sessionId of session2Ids) {
        await deleteSession(null, { id: sessionId }, dummyContext2).should.be
          .fulfilled;
      }
    });

    it('should verify that there is no session', () => {
      return $exists.session().should.eventually.be.false;
    });
  });

  after(async () => {
    await deleteManyUsers();
    await deleteManySessionTypes();
  });
});
