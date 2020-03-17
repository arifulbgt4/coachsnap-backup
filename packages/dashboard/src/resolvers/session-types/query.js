import gql from 'graphql-tag';

import SESSION_TYPES_FRAGMENT from './fragment';

export const SESSION_TYPES = gql`
  query SESSION_TYPES($coachId: ID!) {
    sessionTypes(coachId: $coachId) {
      count
      sessionTypes {
        ...SessionType
      }
    }
  }
  ${SESSION_TYPES_FRAGMENT}
`;
