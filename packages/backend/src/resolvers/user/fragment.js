module.exports = `
fragment User on User {
  id
  createdAt
  updatedAt
  verified
  name
  email
  username
  timezone
  emailToken
  resetToken
  inviteToken
  verified
  role
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
  facebook
  twitter
  website
  mobile
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
  coaches {
    id
  }

  customers {
    id
    createdAt
    password
  updatedAt
  verified
  name
  email
  emailToken
  resetToken
  inviteToken
  role
  coach {
    id
    username
  }
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
 }
}
`;
