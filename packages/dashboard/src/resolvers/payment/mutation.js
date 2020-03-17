import gql from 'graphql-tag';
import CHARGE_FRAGMENT from './fragment';

export const CONNECT_STRIPE = gql`
  mutation CONNECT_STRIPE($code: String!) {
    connectStripe(code: $code) {
      token
      user {
        id
      }
    }
  }
`;

export const DISCONNECT_STRIPE = gql`
  mutation DISCONNECT_STRIPE {
    disconnectStripe {
      token
      user {
        id
      }
    }
  }
`;

export const REFUND = gql`
  mutation REFUND($chargeId: String!) {
    refund(chargeId: $chargeId) {
      ...Charge
    }
  }
  ${CHARGE_FRAGMENT}
`;
