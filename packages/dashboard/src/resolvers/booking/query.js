import gql from 'graphql-tag';

import BOOKING_FRAGMENT from './fragment';

export const BOOKING = gql`
  query BOOKING($id: ID!) {
    booking(id: $id) {
      ...Booking
    }
  }
  ${BOOKING_FRAGMENT}
`;

export const AVAILABLE_TIMES = gql`
  query AVAILABLE_TIMES(
    $date: DateTime!
    $sessionId: ID
    $coachId: ID
    $ignoreSessionId: ID
  ) {
    availableTimes(
      sessionId: $sessionId
      coachId: $coachId
      date: $date
      blockSize: 15
      ignoreSessionId: $ignoreSessionId
    )
  }
`;

export const BOOKINGS_BY_CUSTOMER = gql`
  query BOOKINGS_BY_CUSTOMER($customerId: ID!, $username: String) {
    bookingsByCustomer(customerId: $customerId, username: $username) {
      count
      bookings {
        ...Booking
      }
    }
  }
  ${BOOKING_FRAGMENT}
`;
