const sortBy = require('lodash/sortBy');
const moment = require('custom-moment');

const {
  loginChecker,
  hasPermission,
  createHash,
} = require('../../utils/permission');

const { prisma, User, Session } = require('../../generated/prisma-client'); // eslint-disable-line no-unused-vars
const fragment = require('./fragment');

const sessionFragment = require('../session/fragment');

const parser = s => {
  const parts = s.split(':');
  return parts[0] * 60 + +parts[1];
};

const doesOverlap = (slot, booking) => {
  if (!slot) {
    throw new Error('`slot` cannot be null');
  }
  if (!booking) {
    return false;
  }
  return (
    (slot[0] <= booking[1] && slot[1] >= booking[0]) ||
    (booking[0] <= slot[1] && booking[1] >= slot[0])
  );
};

const render = t =>
  `${Math.floor(t / 60)
    .toString()
    .padStart(2, '0')}:${(t % 60).toString().padStart(2, '0')}`;

const getAvailableTime = ({
  start,
  end,
  blocks,
  duration = 15,
  roundBy = 15,
}) => {
  if (60 % roundBy !== 0) {
    throw new Error(`60 is not divisible by roundBy(${roundBy}) `);
  }
  /* eslint-disable no-param-reassign */
  blocks = blocks.map(b => b.map(parser));
  blocks = sortBy(blocks, '0');
  start = parser(start);
  end = parser(end);

  const genBlocks = [];
  let blockI = 0;
  for (let i = start; i <= end - duration + 1; i++) {
    if (i % roundBy) {
      i += roundBy - (i % roundBy);
    }
    const possibleBlock = [i, i + duration - 1];
    if (doesOverlap(possibleBlock, blocks[blockI])) {
      // eslint-disable-next-line prefer-destructuring
      i = blocks[blockI][1];
      blockI++;
    } else {
      genBlocks.push(possibleBlock);
      i += duration - 1;
    }
  }

  return genBlocks;
};

module.exports = {
  async booking(root, { id }) {
    return prisma.booking({ id }).$fragment(fragment);
  },
  async bookingsByCustomer(root, { customerId, username }, ctx) {
    if (username) {
      // user is customer
      // await loginChecker(ctx);
      const coach = await prisma.user({ username });
      // check if the user is logged in as coach
      // await hasPermission({ id: coach.id, level: 1 });
      // const { customers } = coach;

      // const isExist = customers.some(
      //   customer => customer.email === userData.email
      // );
      // if (isExist) {
      //   throw new Error('This email is already taken');
      // }

      // console.log(isExist);

      const where = {
        where: {
          customer: { id: customerId },
          session: { coach: { id: coach.id } },
        },
      };

      const count = await prisma
        .bookingsConnection(where)
        .aggregate()
        .count();

      return {
        count,
        bookings: await prisma.bookings(where).$fragment(fragment),
      };
    }

    // user is coach
    const user = await loginChecker(ctx);
    const where = {
      where: {
        customer: { id: customerId },
        session: { coach: { id: user.id } },
      },
    };
    const count = await prisma
      .bookingsConnection(where)
      .aggregate()
      .count();
    return {
      count,
      bookings: await prisma.bookings(where).$fragment(fragment),
    };
  },

  async bookingsBySession(root, { sessionId }, ctx) {
    const user = await loginChecker(ctx);
    const where = {
      where: {
        session: { id: sessionId, coach: { id: user.id } },
      },
    };
    const count = await prisma
      .bookingsConnection(where)
      .aggregate()
      .count();
    return {
      count,
      bookings: await prisma.bookings(where).$fragment(fragment),
    };
  },
  async availableTimes(
    root,
    { start, end, sessionId, coachId, date, blockSize, ignoreSessionId },
    ctx
  ) {
    /** @type {User} */
    let user;

    if (!coachId) {
      user = await loginChecker(ctx);
    }

    const session =
      sessionId &&
      (await prisma.session({ id: sessionId }).$fragment(`
        {
          businessHour {
            start
            end
          }
        }
      `));
    const businessHour = session && session.businessHour;
    start = start || (businessHour && businessHour.start) || '00:00';
    end = end || (businessHour && businessHour.end) || '24:00';

    const availableBlocks = getAvailableTime({
      start,
      end,
      blocks: [],
      duration: blockSize,
    });

    return availableBlocks.map(b => b.map(render));
  },
};
