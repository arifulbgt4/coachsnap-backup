module.exports = `
  fragment SessionType on SessionType {
    id
    createdAt
    updatedAt
    name
    description
    maxSeats
    cost
    duration
    sessions {
      id
      createdAt
      updatedAt
      name
      description
      location
      link
      recurring
      availability {
        start
        end
      }
      coverImage {
        url
        width
        height
      }
      maxSeats
      cost
      bookings {
        id
        customer {
          id
          name
          email
        }
      }
    }
  }
`;
