const SESSION_TYPES_FRAGMENT = `
  fragment SessionType on SessionType {
    id
    createdAt
    name
    description
    duration
    maxSeats
    cost
  }
`;

export default SESSION_TYPES_FRAGMENT;
