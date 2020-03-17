const { loginChecker, hasPermission } = require('../../utils/permission');
const { prisma } = require('../../generated/prisma-client');
const fragment = require('./fragment');

const { STRIPE_CLIENT_ID, STRIPE_PUBLIC_KEY } = process.env;

const filterCharges = bookings => {
  const charges = bookings
    .filter(booking => booking.charge)
    .map(booking => booking.charge);
  return {
    count: charges.length,
    charges,
  };
};

module.exports = {
  async stripeClient(root, _, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id });

    return {
      id: STRIPE_CLIENT_ID,
      publicKey: STRIPE_PUBLIC_KEY,
    };
  },

  async coachPayments(root, args, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, verify: false });
    const count = await prisma
      .chargesConnection(args)
      .aggregate()
      .count();
    const where = { ...args.where, coach: { id: user.id } };
    const charges = await prisma.charges({ where });
    return {
      count,
      charges: charges.map(c => ({
        ...c,
        amount: c.amount - c.application_fee_amount,
      })),
    };
  },

  async adminPayments(root, args, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 2 });

    const count = await prisma
      .chargesConnection(args)
      .aggregate()
      .count();
    const where = { ...args.where };
    const charges = await prisma.charges({ where });

    return { count, charges };
  },

  async coachSummary(parent, { coachId }, ctx) {
    const user = await loginChecker(ctx);
    const where = {
      session: {
        sessionType: {
          coach: { id: user.id },
        },
      },
      charge: { id_not: null, refunded: false },
    };
    if (coachId) {
      // If coachId provided that means this is the request from admin. So we need to check permission for admin
      await hasPermission({ id: user.id, level: 2 });
      where.session.sessionType.coach.id = coachId;
    } else {
      await hasPermission({ id: user.id, level: 1, verify: false });
    }

    /** @type {Booking[]} */
    const bookings = await prisma
      .bookings({
        where,
      })
      .$fragment(fragment);
    const sumCharges = (total, booking) =>
      total + booking.charge.amount - booking.charge.application_fee_amount;
    const totalEarning = bookings.reduce(sumCharges, 0);
    const totalRefund = bookings
      .filter(booking => booking.charge.refunded)
      .reduce(sumCharges, 0);
    const before30Day = new Date().setDate(new Date().getDate() - 30);
    const last30DaysEarning = bookings
      .filter(booking => new Date(booking.charge.createdAt) > before30Day)
      .reduce(sumCharges, 0);

    return {
      totalBookings: bookings.length,
      totalEarning: totalEarning / 100,
      last30DaysEarning: last30DaysEarning / 100,
      totalRefund: totalRefund / 100,
    };
  },
};
