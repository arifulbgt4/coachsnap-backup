const { withFilter } = require('graphql-yoga');

const pubsub = require('../../common/pubsub');
const { ACTIVITY_UPDATED } = require('./constants');

module.exports = {
  activityPubSub: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([ACTIVITY_UPDATED]),
      (payload, variables) =>
        payload.userId && variables.coachId === payload.userId
    ),
    resolve: payload => payload,
  },
};
