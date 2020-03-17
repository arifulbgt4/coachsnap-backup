const CUSTOMER_FRAGMENT = `
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
export default CUSTOMER_FRAGMENT;
