const userQuery = require('./user/query');
const userMutation = require('./user/mutation');
const sessionQuery = require('./session/query');
const sessionMutation = require('./session/mutation');
const sessionTypeQuery = require('./session-type/query');
const sessionTypeMutation = require('./session-type/mutation');
const bookingQuery = require('./booking/query');
const bookingMutation = require('./booking/mutation');
const paymentQueries = require('./payment/query');
const paymentMutations = require('./payment/mutation');
const adminMutation = require('./admin/mutation');
const adminQuery = require('./admin/query');
const activityQuery = require('./activity/query');
const activitySubscription = require('./activity/subscription');

const resolvers = {
  Mutation: {
    ...userMutation,
    ...sessionMutation,
    ...sessionTypeMutation,
    ...bookingMutation,
    ...paymentMutations,
    ...adminMutation,
  },
  Query: {
    ...userQuery,
    ...sessionQuery,
    ...sessionTypeQuery,
    ...bookingQuery,
    ...paymentQueries,
    ...adminQuery,
    ...activityQuery,
  },
  Subscription: activitySubscription,
};

module.exports = resolvers;
