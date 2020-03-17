import gql from 'graphql-tag';
import CHARGE_FRAGMENT from './fragment';

export const STRIPE_CLIENT_ID = gql`
  query STRIPE_CLIENT_ID {
    stripeClient {
      id
      publicKey
    }
  }
`;

export const COACH_PAYMENTS = gql`
  query COACH_PAYMENTS($where: ChargeWhereInput, $skip: Int, $first: Int) {
    coachPayments(
      where: $where
      orderBy: createdAt_DESC
      skip: $skip
      first: $first
    ) {
      charges {
        ...Charge
      }
    }
  }
  ${CHARGE_FRAGMENT}
`;

export const ADMIN_PAYMENTS = gql`
  query ADMIN_PAYMENTS($where: ChargeWhereInput, $skip: Int, $first: Int) {
    adminPayments(
      where: $where
      orderBy: createdAt_DESC
      skip: $skip
      first: $first
    ) {
      charges {
        ...Charge
      }
    }
  }
  ${CHARGE_FRAGMENT}
`;

export const ADMIN_SUMMARY = gql`
  query ADMIN_SUMMARY {
    adminSummary {
      totalBookings
      totalEarning
      last30DaysEarning
    }
  }
`;

export const COACH_SUMMARY = gql`
  query COACH_SUMMARY($coachId: ID) {
    coachSummary(coachId: $coachId) {
      totalBookings
      totalEarning
      last30DaysEarning
      totalRefund
    }
  }
`;
