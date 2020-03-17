/**
 * Parvez M Robin
 * this@parvezmrobin.com
 * Date: Jan 10, 2020
 */
/* eslint-disable no-console */

const { prisma } = require('../src/generated/prisma-client');
const { availableTimes } = require('../src/resolvers/booking/query');

const shouldLog = false;

const coaches = [];

async function f() {
  const number = Math.floor(Math.random() * 1e7);
  const coachUsername = `coach${number}`;
  const coach = await prisma.createUser({
    name: coachUsername,
    username: coachUsername,
    email: `${coachUsername}@mail.com`,
    password: coachUsername,
    role: 'COACH',
  });
  shouldLog && console.log('coach', coach.id, coach.name, coach.email);
  coaches.push(coach);

  const customerUsername = `customer${number}`;
  const customer = await prisma.createUser({
    name: customerUsername,
    username: customerUsername,
    email: `${customerUsername}@mail.com`,
    password: customerUsername,
    role: 'CUSTOMER',
  });
  shouldLog && console.log('customer', customer.name, customer.email);

  const sessionType = await prisma.createSessionType({
    coach: { connect: { id: coach.id } },
    name: '5 minutes session type',
    description: '5 minutes session type',
    duration: 5,
    maxSeats: 20,
    cost: 20,
    businessHour: {
      create: {
        start: '00:00',
        end: '23:59',
      },
    },
  });

  shouldLog && console.log('sessionType', sessionType.id, sessionType.name);

  const start = new Date();
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  start.setMilliseconds(0);
  start.setDate(start.getDate());

  const tomorrow = new Date();
  tomorrow.setHours(0);
  tomorrow.setMinutes(0);
  tomorrow.setSeconds(0);
  tomorrow.setMilliseconds(0);
  tomorrow.setDate(start.getDate() + 1);

  const sessionIds = [];
  const sessionErrors = [];
  for (; start < tomorrow; start.setMinutes(start.getMinutes() + 5)) {
    const end = new Date(start.getTime());
    end.setMinutes(end.getMinutes() + 4);

    try {
      const session = await prisma.createSession({
        sessionType: { connect: { id: sessionType.id } },
        coach: { connect: { id: coach.id } },
        name: '5 minutes session',
        description: '5 minutes session',
        location: 'no-where',
        availability: {
          create: {
            start: start.toISOString(),
            end: end.toISOString(),
          },
        },
        recurring: false,
        maxSeats: 20,
        cost: 20,
      });
      sessionIds.push(session.id);
    } catch (e) {
      sessionErrors.push(e);
    }
  }

  shouldLog && console.log('sessionIds.length', sessionIds.length);
  if (sessionErrors.length) {
    shouldLog && console.log('sessionErrors.length', sessionErrors.length);
    shouldLog && console.log('sessionErrors', sessionErrors.slice(0, 6));
  }

  const bookingIds = [];
  const bookingErrors = [];
  for (const sessionId of sessionIds) {
    try {
      const booking = await prisma.createBooking({
        customer: { connect: { id: customer.id } },
        session: { connect: { id: sessionId } },
      });
      bookingIds.push(booking.id);
    } catch (e) {
      bookingErrors.push(e);
    }
  }

  shouldLog && console.log('bookingIds.length', bookingIds.length);
  if (bookingErrors.length) {
    shouldLog && console.log('bookingErrors.length', bookingErrors.length);
    shouldLog && console.log('bookingErrors', bookingErrors.slice(0, 6));
  }
}

async function g(coach) {
  console.time(coach.name);
  const availableTimeResponse = await availableTimes(
    null,
    {
      start: '00:00',
      end: '23:59',
      date: new Date().toISOString(),
      blockSize: 5,
    },
    { testUser: coach }
  );
  console.timeEnd(coach.name);

  shouldLog &&
    console.log('availableTimeResponse.length', availableTimeResponse.length);
}

async function h() {
  for (let i = 0; i < 10; i++) {
    await f();
    console.log('completed', i + 1);
  }
  return Promise.all(coaches.map(g));
}

h()
  .then(() => {
    console.log('completed');
    process.exit();
  })
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
