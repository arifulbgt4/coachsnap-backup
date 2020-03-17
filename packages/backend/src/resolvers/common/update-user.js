const validator = require('validator');
const { prisma } = require('../../generated/prisma-client'); // eslint-disable-line no-unused-vars
const userFragment = require('../user/fragment');

/**
 *
 * @param {object} args - Arguments
 * @param {string} args.user - User
 * @param {object} args.data - Update input
 * @returns {object} User
 */
const updateUser = async ({ userId, data }) => {
  const { backgroundColor, username } = data;

  if (backgroundColor && !validator.isHexColor(backgroundColor)) {
    throw new Error('Background color is invalid');
  }
  if (username) {
    const existsUser = await prisma.user({ username });
    if (existsUser && existsUser.id !== userId) {
      throw new Error('Username is already taken');
    }
  }
  return prisma
    .updateUser({
      where: { id: userId },
      data,
    })
    .$fragment(userFragment);
};
module.exports = updateUser;
