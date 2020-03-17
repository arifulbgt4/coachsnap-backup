const SESSION_FRAGMENT = `
  fragment Session on Session {
    id
    duration
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
    singleEvent
    businessHour {
      start
      end
    }
    maxSeats
    bookings {
      id
      timeSlot
      customer {
        id
        name
        email
      }
    }
    cost
    coverImage {
      url
      width
      height
    }
    sessionType {
      id
      name
    }
    coach {
      id
      name
      email
      username
      timezone
      profileImage {
        url
        width
        height
      }
      coverImage {
        url
        width
        height
      }
      stripeAccount {
        stripe_user_id
        stripe_publishable_key
      }
    }
  }
`;

export default SESSION_FRAGMENT;
