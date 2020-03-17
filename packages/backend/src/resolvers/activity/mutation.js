const { prisma } = require('../../generated/prisma-client');
const pubsub = require('../common/pubsub');
const { ACTIVITY_UPDATED } = require('../activity/subscription/constants');

const fragment = require('./fragment');

const mutations = {
  /**
   * Create activity
   * @param {string} content - Type and message as object
   * @param {Object} user - User data
   * @param {Object} data - The data that has changed or created (Optional)
   * @param {string} type - Which data changed (Optional)
   */
  async createActivity({ content, user, data, type }) {
    const activity = await prisma
      .createActivity({
        user: { connect: { id: user.id } },
        content: { create: content },
      })
      .$fragment(fragment);
    pubsub.publish(ACTIVITY_UPDATED, {
      activity,
      userId: user.id,
      mutation: ACTIVITY_UPDATED,
      ...(type && { type }),
      ...(data && { data }),
    });
    return activity;
  },
};

module.exports = mutations;
