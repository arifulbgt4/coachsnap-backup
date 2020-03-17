import gql from 'graphql-tag';

import SESSION_TYPES_FRAGMENT from './fragment';

export const CREATE_SESSION_TYPES = gql`
  mutation CREATE_SESSION_TYPES($data: SessionTypeCreateInput!) {
    createSessionType(data: $data) {
      ...SessionType
    }
  }
  ${SESSION_TYPES_FRAGMENT}
`;

export const DELETE_SESSION_TYPES = gql`
  mutation DELETE_SESSION_TYPES($id: ID!) {
    deleteSessionType(id: $id) {
      id
    }
  }
`;

export const UPDATE_SESSION_TYPES = gql`
  mutation UPDATE_SESSION_TYPES($id: ID!, $data: SessionTypeUpdateInput!) {
    updateSessionType(id: $id, data: $data) {
      ...SessionType
    }
  }
  ${SESSION_TYPES_FRAGMENT}
`;
