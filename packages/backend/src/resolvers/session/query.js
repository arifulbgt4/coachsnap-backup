const sortBy = require('lodash/sortBy');

// eslint-disable-next-line no-unused-vars
const { prisma, Session } = require('../../generated/prisma-client');
const fragment = require('./fragment');

module.exports = {
  async session(root, { id }, ctx, info) {
    return prisma.session({ id }, info).$fragment(fragment);
  },
  async sessions(root, { sessionTypeId }) {
    const where = { where: { sessionType: { id: sessionTypeId } } };
    const count = await prisma
      .sessionsConnection(where)
      .aggregate()
      .count();
    return {
      count,
      sessions: await prisma.sessions(where).$fragment(fragment),
    };
  },
  async getCoachSessions(root, args) {
    const count = await prisma
      .sessionsConnection(args)
      .aggregate()
      .count();
    return {
      count,
      sessions: await prisma.sessions(args).$fragment(fragment),
    };
  },

  /**
   * @param root
   * @param {String} coachId
   * @param ignoreSessionId
   * @returns {Promise<Array<{start: Date, end: Date}>>}
   */
  async getBookedTimes(root, { coachId, ignoreSessionId }) {
    /** @type {Session[]} */
    const sessions = await prisma
      .sessions({
        where: {
          sessionType: { coach: { id: coachId } },
          id_not: ignoreSessionId,
        },
      })
      .$fragment(fragment);

    /** @type {Array<{start: Date, end: Date}>} */
    const bookedSlots = sessions
      .map(s => s.availability)
      .map(({ start, end }) => ({
        start: new Date(start),
        end: new Date(end),
      }));

    /** @type {Array<{start: Date, end: Date}>} */
    const sortedSlots = sortBy(bookedSlots, ['start', 'end']);
    // merge slots
    for (let i = 1; i < sortedSlots.length; i++) {
      const lastSlot = sortedSlots[i - 1];
      const currentSlot = sortedSlots[i];
      // it is guaranteed that `currentSlot` is started at the same time or after `lastSlot`
      if (currentSlot.start <= lastSlot.end) {
        // if `currentSlot` is started before ending `lastSlot`, these two can be merged
        const mergedSlot = {
          start: lastSlot.start,
          // choose the maximum ending time
          end: currentSlot.end > lastSlot.end ? currentSlot.end : lastSlot.end,
        };
        sortedSlots.splice(i - 1, 2, mergedSlot);
        i--; // as we deleted two items and added one, a new item is placed at `sortedSlots[i]`
      }
    }

    return sortedSlots;
  },
};
