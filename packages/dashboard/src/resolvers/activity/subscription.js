import gql from 'graphql-tag';

import ACTIVITY_FRAGMENT from './fragment';

export const ACTIVITIES = gql`
  subscription ACTIVITIES($coachId: ID) {
    activityPubSub(coachId: $coachId) {
      activity {
        ...Activity
      }
      mutation
      type
      data
    }
  }
  ${ACTIVITY_FRAGMENT}
`;
