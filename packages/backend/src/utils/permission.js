const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');

const nodemailer = require('nodemailer');
const { prisma } = require('../generated/prisma-client');
const fragment = require('../resolvers/user/fragment');
const customerFragment = require('../resolvers/user/cutomerFragment');

const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, APP_SECRET } = process.env;

const denied = 'Permission denied';
const notAuthorized = 'Not authorized';

const loginChecker = async ({ request, testUser }) => {
  if (testUser) {
    return testUser;
  }
  const token = request.get('Authorization');

  if (token) {
    let user;
    const userInJwt = jwt.verify(token, APP_SECRET);
    if (userInJwt.role !== 'CUSTOMER') {
      user = await prisma.user({ id: userInJwt.id }).$fragment(fragment);
    } else {
      user = await prisma
        .customer({ id: userInJwt.id })
        .$fragment(customerFragment);
    }
    if (!user) throw new Error(notAuthorized);
    delete user.password;
    return user;
  }
  throw new Error(notAuthorized);
};

// const loginCheckerForCustomer = async({request, })

/**
 *
 * @param {Object} args - Arguments
 * @param {string} args.id - User ID
 * @param {number} args.level - Level of user. There is 3 level of user in this app. 0 for customers, 1 for coaches, 2 for admin. By default the level is 1.
 * @returns {boolean}
 */
const hasPermission = async ({ id, level = 1, verify = true }) => {
  const coach = await prisma.user({ id });
  if (!coach) throw new Error(denied);
  if (verify) {
    if (!coach.verified) throw new Error(denied);
  }
  const role = level === 1 ? 'COACH' : level === 2 ? 'ADMIN' : 'CUSTOMER';
  if (coach.role !== role) throw new Error(denied);
  return true;
};

const isOwns = (userId, targetId) => {
  if (userId !== targetId) throw new Error(denied);
  return true;
};

const createHash = async () => {
  const randomBytesPromise = promisify(randomBytes);
  const hash = (await randomBytesPromise(20)).toString('hex');
  return hash;
};

const transport = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

module.exports = {
  loginChecker,
  isOwns,
  hasPermission,
  createHash,
  transport,
};
