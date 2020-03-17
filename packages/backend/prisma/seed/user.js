const bcrypt = require('bcryptjs');

const { prisma } = require('../../src/generated/prisma-client');

const { ADMIN_PASSWORD, ADMIN_EMAIL, NODE_ENV } = process.env;

const emptyImage = { create: { url: '', width: 0, height: 0 } };

const users = [
  {
    email: ADMIN_EMAIL,
    name: 'Admin',
    password: ADMIN_PASSWORD,
    role: 'ADMIN',
  },
];

const createUsers = async () => {
  if (NODE_ENV === 'development') {
    users.push({
      email: 'coach@coachsnap.com',
      name: 'John',
      username: 'john',
      password: '123456',
      role: 'COACH',
      biography: 'I am the coach',
    });
  }
  const createUserPromise = users.map(async user => {
    const alreadyExists = await prisma.$exists.user({ email: user.email });
    if (!alreadyExists) {
      return prisma.createUser({
        ...user,
        password: await bcrypt.hash(user.password, 10),
        verified: true,
        profileImage: emptyImage,
        coverImage: emptyImage,
      });
    }
  });
  const createdUsers = await Promise.all(createUserPromise);
  return createdUsers;
};

module.exports = { users, createUsers };
