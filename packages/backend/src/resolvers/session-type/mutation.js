const { prisma } = require('../../generated/prisma-client');
const {
  loginChecker,
  hasPermission,
  isOwns,
} = require('../../utils/permission');

const isNumeric = require('../../utils/isNumeric');
const { createActivity } = require('../activity/mutation');
const fragment = require('./fragment');

module.exports = {
  async createSessionType(root, { data }, ctx) {
    // Permissions
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1 });

    delete data.coach;

    for (const key in data) {
      if (isNumeric(data[key])) {
        if (data[key] < 0) throw new Error(`value of ${key} must be positive `);
      }
    }

    const newSessionType = await prisma
      .createSessionType({
        ...data,
        coach: { connect: { id: user.id } },
      })
      .$fragment(fragment);
    await createActivity({
      content: {
        type: 'Created',
        message: `${newSessionType.name} session type have been created`,
      },
      user,
    });
    return newSessionType;
  },

  async updateSessionType(root, { id, data }, ctx) {
    // Permissions
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1 });
    const coach = await prisma.sessionType({ id }).coach();
    // Coach owns the session type
    await isOwns(user.id, coach.id);

    for (const key in data) {
      if (isNumeric(data[key])) {
        if (data[key] < 0) throw new Error(`value of ${key} must be positive `);
      }
    }

    const updatedSessionType = await prisma
      .updateSessionType({
        where: { id },
        data,
      })
      .$fragment(fragment);
    await createActivity({
      content: {
        type: 'Updated',
        message: `${updatedSessionType.name} session type details have been updated`,
      },
      user,
    });
    return updatedSessionType;
  },
  async deleteSessionType(root, { id }, ctx) {
    // Permissions
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1 });
    const coach = await prisma.sessionType({ id }).coach();
    // Coach owns the session type
    await isOwns(user.id, coach.id);

    const deletedSessionType = await prisma.deleteSessionType({ id });

    await createActivity({
      content: {
        type: 'Deleted',
        message: `${deletedSessionType.name} session type have been deleted`,
      },
      user,
    });
    return deletedSessionType;
  },
};
