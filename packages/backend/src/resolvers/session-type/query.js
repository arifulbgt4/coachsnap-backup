const { prisma } = require('../../generated/prisma-client');
const fragment = require('./fragment');

module.exports = {
  async sessionType(root, { id }) {
    return prisma.sessionType({ id });
  },
  async sessionTypes(root, { coachId }) {
    if (!coachId) throw new Error('Provide coach id');

    const where = { coach: { id: coachId } };
    const sessionTypes = await prisma
      .sessionTypes({ where })
      .$fragment(fragment);
    const count = await prisma
      .sessionTypesConnection({ where })
      .aggregate()
      .count();
    return { count, sessionTypes };
  },
};
