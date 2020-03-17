const BOOKING_FRAGMENT = `
  fragment Booking on Booking {
    id
    timeSlot
    customer {
      id
      name
      email
    }
    session {
      id
      createdAt
      updatedAt
      name
      description
      location
      link
      recurring
      coverImage {
        url
        width
        height
      }
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
      }
      cost
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
      }
    }
    charge {
      id
      amount
      amount_refunded
      refunded
      application_fee_amount
      currency
      description
      createdAt
      updatedAt
    }
  }
`;

export default BOOKING_FRAGMENT;
