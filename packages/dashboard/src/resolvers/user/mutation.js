import gql from 'graphql-tag';

import USER_FRAGMENT from './fragment';
import CUSTOMER_FRAGMENT from './customerFragment';

export const SIGNUP_MUTATION = gql`
  mutation signup(
    $name: String!
    $email: String!
    $password: String!
    $username: String!
    $timezone: String
  ) {
    signup(
      name: $name
      email: $email
      password: $password
      username: $username
      timezone: $timezone
    )
  }
`;

export const CUSTOMER_SIGNUP_MUTATION = gql`
  mutation signupAsCustomer(
    $name: String!
    $email: String!
    $password: String!
    $username: String!
  ) {
    signupAsCustomer(
      name: $name
      email: $email
      password: $password
      username: $username
    )
  }
`;

export const CREATE_COACH = gql`
  mutation createCoach($name: String!, $email: String!) {
    createCoach(name: $name, email: $email) {
      ...User
    }
  }
  ${USER_FRAGMENT}
`;

export const VERIFY_EMAIL_MUTATION = gql`
  mutation VERIFY_EMAIL_MUTATION($emailToken: String!, $email: String) {
    verifyEmail(emailToken: $emailToken, email: $email) {
      token
      user {
        email
        verified
      }
    }
  }
`;

export const RESET_COACH_ACCOUNT = gql`
  mutation RESET_COACH_ACCOUNT(
    $inviteToken: String!
    $email: String!
    $username: String!
    $password: String!
  ) {
    resetCoachAccount(
      inviteToken: $inviteToken
      email: $email
      username: $username
      password: $password
    ) {
      email
      verified
    }
  }
`;

export const RESET_CUSTOMER_ACCOUNT = gql`
  mutation RESET_CUSTOMER_ACCOUNT(
    $inviteToken: String!
    $email: String!
    $username: String!
    $password: String!
  ) {
    resetCustomerAccount(
      inviteToken: $inviteToken
      email: $email
      username: $username
      password: $password
    ) {
      token
      customer {
        email
        verified
      }
    }
  }
`;

export const VERIFY_INVITATION_TOKEN = gql`
  mutation VERIFY_INVITATION_TOKEN($inviteToken: String!) {
    verifyInvitationToken(inviteToken: $inviteToken)
  }
`;

export const VERIFY_CUSTOMER_INVITATION_TOKEN = gql`
  mutation VERIFY_CUSTOMER_INVITATION_TOKEN(
    $inviteToken: String!
    $username: String!
  ) {
    verifyCustomerInvitationToken(
      inviteToken: $inviteToken
      username: $username
    )
  }
`;

export const CREATE_CUSTOMER = gql`
  mutation createCustomer($email: String!, $name: String!) {
    createCustomer(email: $email, name: $name) {
      ...Customer
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

export const DELETE_CUSTOMER = gql`
  mutation DELETE_CUSTOMER($id: ID!) {
    removeCustomer(customerId: $id) {
      id
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UPDATE_CUSTOMER($name: String!, $email: String!, $id: ID!) {
    updateCustomer(customerId: $id, email: $email, name: $name) {
      ...Customer
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

export const UPDATE_COACH = gql`
  mutation UPDATE_COACH($data: UserSettingsInput) {
    updateCoachByCoach(data: $data) {
      token
      user {
        ...User
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const REMOVE_COACH_IMAGE = gql`
  mutation REMOVE_COACH_IMAGE($type: String) {
    deleteCoachImage(type: $type) {
      token
      user {
        ...User
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const UPDATE_COACH_BY_ADMIN = gql`
  mutation UPDATE_COACH_BY_ADMIN($data: UserSettingsInput, $coachId: ID!) {
    updateCoach(data: $data, coachId: $coachId) {
      ...User
    }
  }
  ${USER_FRAGMENT}
`;

export const DELETE_COACH = gql`
  mutation deleteCoach($coachId: ID!) {
    deleteCoach(id: $coachId) {
      id
    }
  }
`;

export const SIGNIN_MUTATION = gql`
  mutation signin($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      token
      user {
        verified
      }
    }
  }
`;

export const CUSTOMER_SIGNIN_MUTATION = gql`
  mutation signinAsCustomer(
    $email: String!
    $password: String!
    $username: String!
  ) {
    signinAsCustomer(email: $email, password: $password, username: $username) {
      token
      customer {
        verified
        role
      }
    }
  }
`;

export const SEND_VERIFICATION = gql`
  mutation sendVerification($email: String!) {
    sendVerification(email: $email)
  }
`;

export const REQUEST_RESET = gql`
  mutation REQUEST_RESET($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`;

export const REQUEST_CUSTOMER_RESET = gql`
  mutation REQUEST_CUSTOMER_RESET($email: String!, $username: String!) {
    requestCustomerReset(email: $email, username: $username) {
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation RESET_PASSWORD(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      message
    }
  }
`;

export const RESET_CUSTOMER_PASSWORD = gql`
  mutation RESET_PASSWORD(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetCustomerPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      message
    }
  }
`;
