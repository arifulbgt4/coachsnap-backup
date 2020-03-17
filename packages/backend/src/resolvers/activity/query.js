const { loginChecker } = require('../../utils/permission');
const { prisma } = require('../../generated/prisma-client');

const fragment = require('./fragment');

module.exports = {
  async activities(parent, args, ctx) {
    const user = await loginChecker(ctx);
    const where = { ...args.where, user: { id: user.id } };
    return prisma
      .activities({ where, orderBy: args.orderBy })
      .$fragment(fragment);
  },
};
