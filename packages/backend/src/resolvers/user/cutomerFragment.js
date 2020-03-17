module.exports = `
fragment Customer on Customer {
  id
  createdAt
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
`;
