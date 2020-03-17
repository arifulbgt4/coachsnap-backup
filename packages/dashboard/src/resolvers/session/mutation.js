import gql from 'graphql-tag';

import SESSION_FRAGMENT from './fragment';

export const CREATE_SESSION = gql`
  mutation CREATE_SESSION(
    $id: ID!
    $name: String!
    $description: String
    $location: String!
    $link: String
    $maxSeats: Int!
    $cost: Int!
    $duration: Int!
    $startTime: DateTime!
    $endTime: DateTime!
    $coverImage: Upload
    $businessHour: BusinessHourCreateOneInput
    $singleEvent: Boolean
  ) {
    createSession(
      sessionTypeId: $id
      data: {
        name: $name
        description: $description
        location: $location
        link: $link
        maxSeats: $maxSeats
        cost: $cost
        duration: $duration
        availability: { create: { start: $startTime, end: $endTime } }
        businessHour: $businessHour
        singleEvent: $singleEvent
      }
      coverImage: $coverImage
    ) {
      ...Session
    }
  }
  ${SESSION_FRAGMENT}
`;

export const UPDATE_SESSION = gql`
  mutation UPDATE_SESSION(
    $id: ID!
    $name: String!
    $description: String
    $location: String!
    $link: String
    $recurring: Boolean
    $maxSeats: Int!
    $cost: Int!
    $duration: Int!
    $startTime: DateTime!
    $endTime: DateTime!
    $coverImage: Upload
    $businessHour: BusinessHourUpdateOneInput
    $singleEvent: Boolean
  ) {
    updateSession(
      id: $id
      data: {
        name: $name
        description: $description
        location: $location
        link: $link
        recurring: $recurring
        maxSeats: $maxSeats
        cost: $cost
        duration: $duration
        availability: { update: { start: $startTime, end: $endTime } }
        businessHour: $businessHour
        singleEvent: $singleEvent
      }
      coverImage: $coverImage
    ) {
      ...Session
    }
  }
  ${SESSION_FRAGMENT}
`;

export const DELETE_SESSION = gql`
  mutation DELETE_SESSION($id: ID!) {
    deleteSession(id: $id) {
      id
    }
  }
`;

export const DELETE_SESSION_IMAGE = gql`
  mutation DELETE_SESSION_IMAGE($id: ID!) {
    deleteSessionImage(id: $id) {
      ...Session
    }
  }
  ${SESSION_FRAGMENT}
`;

export const REMAINDER = gql`
  mutation REMAINDER($id: ID!) {
    sendRemainder(id: $id) {
      message
    }
  }
`;
