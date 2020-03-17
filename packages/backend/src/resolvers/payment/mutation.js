const Stripe = require('stripe');
const jwt = require('jsonwebtoken');

const { loginChecker, hasPermission } = require('../../utils/permission');
const { prisma } = require('../../generated/prisma-client');
const { formatCharge } = require('../../utils');
const { signToken } = require('../../utils/auth');
const userFragment = require('../user/fragment');

const { STRIPE_SECRET_KEY, APP_SECRET, STRIPE_CLIENT_ID } = process.env;

module.exports = {
  async connectStripe(root, { code }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id });
    const stripeClient = new Stripe(STRIPE_SECRET_KEY);
    const stripeResponse = await stripeClient.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    const updatedUser = await prisma
      .updateUser({
        where: { id: user.id },
        data: {
          stripeAccount: {
            ...(!user.stripeAccount && { create: stripeResponse }),
            ...(user.stripeAccount && { update: stripeResponse }),
          },
        },
      })
      .$fragment(userFragment);

    return { token: signToken(updatedUser), user: updatedUser };
  },

  async disconnectStripe(root, _, ctx) {
    const user = await loginChecker(ctx);
    if (!user.stripeAccount) {
      throw new Error('Not connected to stripe');
    }
    await hasPermission({ id: user.id });

    const stripeClient = new Stripe(STRIPE_SECRET_KEY);
    // Disconnect from stripe
    await stripeClient.oauth.deauthorize({
      client_id: STRIPE_CLIENT_ID,
      stripe_user_id: user.stripeAccount.stripe_user_id,
    });

    // Delete stripe from profile
    const updatedUser = await prisma
      .updateUser({
        where: { id: user.id },
        data: {
          stripeAccount: { delete: true },
        },
      })
      .$fragment(userFragment);

    return { token: signToken(updatedUser), user: updatedUser };
  },

  async refund(root, { chargeId }, ctx) {
    const user = await loginChecker(ctx);
    if (!user.stripeAccount) {
      throw new Error('Not connected to stripe');
    }
    await hasPermission({ id: user.id });
    const chargeExists = await prisma.$exists.charge({
      id: chargeId,
    });

    if (!chargeExists) {
      throw new Error('Invalid chargeId');
    }

    const stripeClient = new Stripe(STRIPE_SECRET_KEY);
    let refundResponse;
    try {
      refundResponse = await stripeClient.refunds.create(
        {
          charge: chargeId,
          refund_application_fee: true,
          expand: ['charge'],
        },
        {
          stripe_account: user.stripeAccount.stripe_user_id,
        }
      );
    } catch (e) {
      if (e.code === 'charge_already_refunded') {
        return prisma.updateCharge({
          where: { id: chargeId },
          data: { refunded: true },
        });
      }
      throw e;
    }

    const formattedRes = formatCharge(refundResponse.charge);
    return prisma.updateCharge({
      where: { id: chargeId },
      data: formattedRes,
    });
  },
};
