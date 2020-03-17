/**
 * Parvez M Robin
 * this@parvezmrobin.com
 * Date: Jan 25, 2020
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve('../../.env');
dotenv.config({ path: envPath });
const { signup } = require('../../src/resolvers/user/mutation');
const {
  createSessionType,
} = require('../../src/resolvers/session-type/mutation');
const { createSession } = require('../../src/resolvers/session/mutation');
const {
  createBooking,
  removeAttendee,
} = require('../../src/resolvers/booking/mutation');
const {
  prisma: {
    user,
    customer: cust,
    customers,
    updateUser,
    deleteManyUsers,
    deleteManySessionTypes,
    deleteManySessions,
    deleteManyBookings,
  },
} = require('../../src/generated/prisma-client');

chai.should();

/**
 * **Coach - can mutate attendee (Booking)**
 *
 * **Should not** be able to add attendee if the attendee has a conflicting schedule
 * **Should not** be able to add one attendee twice
 * **Should not** be able to add self as attendee
 * **Should not** be able to add admin as attendee
 * **Should not** be able to add another coach as attendee
 * **Should not** be able to add more attendee than `maxSeats`
 * **Should** be able to remove an attendee
 * **Should not** be able to remove other coach's attendee
 * **Should** be able to book without credit card detail if coach is not connected to stripe
 * **Should not** be able to book without credit card detail if coach is connected to stripe
 */

describe('Test mutate booking', function testSuit() {
  this.timeout(5000);

  let token1;
  let sessionType1;
  let session1;
  const dummyContext1 = {
    request: { get: () => token1 },
  };
  let token2;
  let sessionType2;
  let session2;
  const dummyContext2 = {
    request: { get: () => token2 },
  };

  let customer;

  async function genSessionType(ctx) {
    const sessionTypeData = {
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
    return createSessionType(null, { data: sessionTypeData }, ctx);
  }

  async function genSession(sessionType, ctx) {
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    const today8 = new Date(today);
    today8.setHours(8);
    const today9 = new Date(today);
    today9.setHours(9);
    const sessionData = {
      name: 'Session',
      cost: 12,
      maxSeats: 5,
      duration: 12,
      location: '',
      availability: {
        create: {
          start: today8.toISOString(),
          end: today9.toISOString(),
        },
      },
    };

    return createSession(
      null,
      { sessionTypeId: sessionType.id, data: sessionData },
      ctx
    );
  }

  before(async () => {
    token1 = await signup(null, {
      email: 'coach1@mail.com',
      password: 'password',
      name: 'coach one',
      username: 'coach1',
    });
    await updateUser({
      where: { email: 'coach1@mail.com' },
      data: { verified: true },
    });
    sessionType1 = await genSessionType(dummyContext1);
    session1 = await genSession(sessionType1, dummyContext1);

    token2 = await signup(null, {
      email: 'coach2@mail.com',
      password: 'password',
      name: 'coach two',
      username: 'coach2',
    });
    await updateUser({
      where: { email: 'coach2@mail.com' },
      data: { verified: true },
    });
    sessionType2 = await genSessionType(dummyContext2);
    session2 = await genSession(sessionType2, dummyContext2);
  });

  it('should not add same attendee to conflicting session', async () => {
    await createBooking(null, {
      sessionId: session1.id,
      userData: {
        name: 'Customer 1',
        email: 'customer1@mail.com',
      },
    }).should.be.fulfilled;

    await createBooking(null, {
      sessionId: session2.id,
      userData: {
        name: 'Customer 1',
        email: 'customer1@mail.com',
      },
    }).should.be.rejectedWith(Error, /session/i);
  });

  it('should not add same attendee twice', () => {
    return createBooking(null, {
      sessionId: session1.id,
      userData: {
        name: 'Customer 1',
        email: 'customer1@mail.com',
      },
    }).should.be.rejected;
  });

  it('should not add corresponding coach as attendee', () => {
    return createBooking(null, {
      sessionId: session1.id,
      userData: {
        name: 'Customer 1',
        email: 'coach1@mail.com',
      },
    }).should.be.rejected;
  });

  it('should not add attendees more than max seats', async () => {
    for (let i = 2; i < 6; i++) {
      await createBooking(null, {
        sessionId: session1.id,
        userData: {
          name: 'Customer 1',
          email: `customer${i}@mail.com`,
        },
      }).should.be.fulfilled;
    }

    // 5 attendees added, next booking should throw error
    return createBooking(null, {
      sessionId: session1.id,
      userData: {
        name: 'Customer 1',
        email: `customer6@mail.com`,
      },
    }).should.be.rejectedWith(Error, /seat/i);
  });

  // it("should not remove other coach's attendee", async () => {
  //   // customer = await cust({});
  //   // const coach = await prisma.user({ id: user.id }).$fragment(userFragment);
  //   // if (!coach) throw new Error('You are not able to remove the customer');
  //   const [customerI] = await customers({
  //     where: { email: 'customer1@mail.com' },
  //   });
  //   return removeAttendee(
  //     null,
  //     { customerId: customerI.id, sessionId: session1.id },
  //     dummyContext2
  //   ).should.be.rejectedWith(Error, /permission|customer/i);
  // });

  it('should remove attendee', async () => {
    const [customerI] = await customers({
      where: { email: 'customer1@mail.com' },
    });
    return removeAttendee(
      null,
      { customerId: customerI.id, sessionId: session1.id },
      dummyContext1
    ).should.be.fulfilled;
  });

  /**
   * creating booking while coach is not connected to stripe is tested at this point
   * now testing creating booking while coach is connected to stripe
   */
  // it('should not create booking without token', async () => {
  //   const stripeAccount = {
  //     stripe_user_id: 'stripe_user_id',
  //     access_token: 'access_token',
  //     scope: 'scope',
  //     livemode: false,
  //     token_type: 'token_type',
  //     refresh_token: 'refresh_token',
  //     stripe_publishable_key: 'stripe_publishable_key',
  //   };

  //   await updateUser({
  //     where: { email: 'coach1@mail.com' },
  //     data: { stripeAccount: { create: stripeAccount } },
  //   });

  //   return createBooking(null, {
  //     sessionId: session1.id,
  //     userData: {
  //       name: 'Customer 1',
  //       email: `customer1@mail.com`,
  //     },
  //   }).should.be.fulfilled;
  // });

  // it('name should not contain invalid character', async () => {
  //   const args = {};
  //   args.data = data;
  //   await updateCoachByCoach(null, args, dummyContext1).should.be.rejectedWith(
  //     Error,
  //     /name/i
  //   );
  // });

  after(async () => {
    await deleteManyBookings();
    await deleteManySessions();
    await deleteManySessionTypes();
    await deleteManyUsers();
  });
});
