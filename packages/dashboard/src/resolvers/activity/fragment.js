const ACTIVITY_FRAGMENT = `
fragment Activity on Activity {
  id
  createdAt
  content {
    type
    message
  }
}
`;

export default ACTIVITY_FRAGMENT;
