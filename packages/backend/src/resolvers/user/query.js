const jwt = require('jsonwebtoken');
const { prisma } = require('../../generated/prisma-client');
const { loginChecker, hasPermission } = require('../../utils/permission');
const { signToken } = require('../../utils/auth');
const fragment = require('./fragment');
const customerFragment = require('./cutomerFragment');

const { APP_SECRET } = process.env;

module.exports = {
  async user(root, { id }, ctx) {
    const token = await ctx.request.get('Authorization');
    const userInJwt = jwt.verify(token, APP_SECRET);
    const user = await prisma.user({ id }).$fragment(fragment);
    if (userInJwt.role === 'COACH' && userInJwt.id === user.id) {
      const jwtUserToken = signToken(user);
      return { token: jwtUserToken, user };
    }
    return { user, token: '' };
  },
  // NOTE: we need to check login status for customer
  async customer(root, { id }) {
    const user = await prisma.customer({ id }).$fragment(customerFragment);

    return { customer: user, token: '' };
  },
  async customers(root, args, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1, verify: false });

    const count = user.customers.length;

    // find all customers of a the coach
    const coachCustomers = await prisma
      .customers({
        where: {
          coach: {
            id: user.id,
          },
        },
      })
      .$fragment(customerFragment);

    return { count, customers: coachCustomers };
  },
  async coaches() {
    const query = { where: { role: 'COACH' } };
    const coaches = await prisma.users(query).$fragment(fragment);
    const count = await prisma
      .usersConnection(query)
      .aggregate()
      .count();

    return { count, coaches };
  },
  async coach(root, args) {
    return prisma.user({ ...args }).$fragment(fragment);
  },
};
