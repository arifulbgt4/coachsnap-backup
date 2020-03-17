module.exports = `
  fragment Activity on Activity {
    id
    createdAt
    content {
      type
      message
    }
  }
`;
