const USER_FRAGMENT = `
fragment User on User {
  id
  createdAt
  updatedAt
  verified
  name
  email
  username
  timezone
  role
  facebook
  twitter
  website
  mobile
  backgroundColor
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
  biography
  lastLogin {
    date
    action
  }
  sessionTypes {
    id
    sessions {
      id
    }
  }
  stripeAccount {
    stripe_user_id
    stripe_publishable_key
  }
}
`;

export default USER_FRAGMENT;
