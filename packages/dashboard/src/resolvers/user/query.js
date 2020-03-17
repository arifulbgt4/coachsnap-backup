import gql from 'graphql-tag';

import USER_FRAGMENT from './fragment';
import CUSTOMER_FRAGMENT from './customerFragment';

export const GET_USER = gql`
  query GET_USER($id: ID!) {
    user(id: $id) {
      token
      user {
        ...User
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_CUSTOMER = gql`
  query GET_CUSTOMER($id: ID!) {
    customer(id: $id) {
      token
      customer {
        ...Customer
      }
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

export const GET_COACH = gql`
  query GET_COACH($username: String!) {
    coach(username: $username) {
      ...User
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_ALL_CUSTOMERS = gql`
  query GET_ALL_CUSTOMERS {
    customers {
      customers {
        ...Customer
      }
      count
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

export const COACHES = gql`
  query COACHES {
    coaches {
      count
      coaches {
        ...User
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const CUSTOMERS_OF_COACH = gql`
  query CUSTOMERS_OF_COACH($coachId: ID!) {
    customersOfCoach(coachId: $coachId) {
      count
      customers {
        ...User
      }
    }
  }
  ${USER_FRAGMENT}
`;
