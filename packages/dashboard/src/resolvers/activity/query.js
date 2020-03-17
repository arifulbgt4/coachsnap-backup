import gql from 'graphql-tag';

import ACTIVITY_FRAGMENT from './fragment';

export const COACH_ACTIVITIES = gql`
  query activities($skip: Int, $first: Int, $where: ActivityWhereInput!) {
    activities(
      orderBy: createdAt_DESC
      skip: $skip
      first: $first
      where: $where
    ) {
      ...Activity
    }
  }
  ${ACTIVITY_FRAGMENT}
`;
