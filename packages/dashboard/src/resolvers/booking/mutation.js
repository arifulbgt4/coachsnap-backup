import gql from 'graphql-tag';

import BOOKING_FRAGMENT from './fragment';

export const CREATE_BOOKING = gql`
  mutation CREATE_BOOKING(
    $sessionId: ID!
    $token: String
    $timeSlot: String
    $userData: UserCreateInput
    $customerId: ID
  ) {
    createBooking(
      sessionId: $sessionId
      token: $token
      timeSlot: $timeSlot
      userData: $userData
      customerId: $customerId
    ) {
      ...Booking
    }
  }
  ${BOOKING_FRAGMENT}
`;

export const UPDATE_BOOKING = gql`
  mutation UPDATE_BOOKING($id: ID!, $data: BookingUpdateInput!) {
    updateBooking(id: $id, data: $data) {
      ...Booking
    }
  }
  ${BOOKING_FRAGMENT}
`;

export const REMOVE_ATTENDEE = gql`
  mutation REMOVE_ATTENDEE($sessionId: ID!, $customerId: ID!) {
    removeAttendee(sessionId: $sessionId, customerId: $customerId) {
      ...Booking
    }
  }
  ${BOOKING_FRAGMENT}
`;
