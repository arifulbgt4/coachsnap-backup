import gql from 'graphql-tag';

import SESSION_FRAGMENT from './fragment';

export const COACH_SESSIONS = gql`
  query COACH_SESSIONS($where: SessionWhereInput!, $skip: Int, $first: Int) {
    getCoachSessions(
      where: $where
      orderBy: createdAt_DESC
      skip: $skip
      first: $first
    ) {
      count
      sessions {
        ...Session
      }
    }
  }
  ${SESSION_FRAGMENT}
`;

export const SESSION = gql`
  query SESSION($id: ID!) {
    session(id: $id) {
      ...Session
    }
  }
  ${SESSION_FRAGMENT}
`;

export const UNASSIGNED_TIMES = gql`
  query UNASSIGNED_TIMES($date: DateTime!, $ignoreSessionId: ID) {
    unassignedTimes(date: $date, ignoreSessionId: $ignoreSessionId)
  }
`;

export const SESSIONS = gql`
  query SESSIONS($sessionTypeId: ID!) {
    sessions(sessionTypeId: $sessionTypeId) {
      count
      sessions {
        ...Session
      }
    }
  }
  ${SESSION_FRAGMENT}
`;
