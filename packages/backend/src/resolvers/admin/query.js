const { prisma, Booking } = require('../../generated/prisma-client'); // eslint-disable-line no-unused-vars
const { loginChecker, hasPermission } = require('../../utils/permission');

const bookingsFragment = require('../booking/fragment');
const activityFragment = require('../activity/fragment');
const paymentFragment = require('../payment/fragment');

module.exports = {
  async bookingsByCoach(root, { coachId }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 2 });
    const where = { where: { session: { coach: { id: coachId } } } };
    const count = await prisma
      .bookingsConnection(where)
      .aggregate()
      .count();
    return {
      count,
      bookings: await prisma.bookings(where).$fragment(bookingsFragment),
    };
  },
  async customersOfCoach(root, { coachId }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 2 });
    const where = { where: { coaches_some: { id: coachId } } };
    const count = await prisma
      .usersConnection(where)
      .aggregate()
      .count();
    return {
      count,
      customers: await prisma.users(where),
    };
  },
  async coachActivities(parent, { coachId }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 2 });
    return prisma
      .activities({ where: { user: { id: coachId } } })
      .$fragment(activityFragment);
  },

  async adminSummary(parent, _, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 2 });

    /** @type {Booking[]} */
    const bookings = await prisma
      .bookings({
        where: { charge: { id_not: null, refunded: false } },
      })
      .$fragment(paymentFragment);
    const sumCharges = (total, booking) =>
      total + booking.charge.application_fee_amount;
    const totalEarning = bookings.reduce(sumCharges, 0);
    const totalRefund = bookings
      .filter(booking => !booking.charge.refunded)
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
