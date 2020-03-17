const jwt = require('jsonwebtoken');

const { APP_SECRET } = process.env;

const removeProperty = prop => ({ [prop]: _, ...rest }) => rest;

const removePassword = removeProperty('password');

const signToken = user => {
  const userToSign = removePassword(user);
  return jwt.sign(userToSign, APP_SECRET);
};

const jwtValidator = token => jwt.verify(token, process.env.APP_SECRET);

module.exports = { signToken, jwtValidator };
