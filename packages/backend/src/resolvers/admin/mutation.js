const validator = require('validator');
const bcrypt = require('bcryptjs');

const { prisma } = require('../../generated/prisma-client'); // eslint-disable-line no-unused-vars
const userFragment = require('../user/fragment');
const {
  loginChecker,
  hasPermission,
  createHash,
} = require('../../utils/permission');
const { hasSpecialChars } = require('../../utils');
const { cloudinary } = require('../../utils/image-uploader');
const updateUser = require('../common/update-user');
const { sendCoachInvitation } = require('../mail-templates/index');
const { createActivity } = require('../activity/mutation');

const verifyToken = async ({ email, inviteToken }) => {
  const [coach] = await prisma.users({
    where: {
      ...(email && { email }),
      inviteToken,
      inviteTokenExpiry_gte: Date.now() - 3600000, // NOTE: The token expiry time is hard coded everywhere. Move this time in a config.
    },
  });
  if (!coach) throw new Error('Invalid invitation token ');
  return coach;
};

module.exports = {
  async createCoach(root, args, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 2 });
    const data = { ...args };
    const { email, name } = args;
    // Validations
    if (!validator.isEmail(email)) throw new Error('Please enter valid email');
    if (hasSpecialChars(name))
      throw new Error('Name should not contain any special characters.');
    // Invitation tokens
    const inviteToken = await createHash();
    const inviteTokenExpiry = Date.now() + 3600000;

    const emptyImage = { create: { url: '', width: 0, height: 0 } };

    const newCoach = await prisma
      .createUser({
        ...data,
        role: 'COACH',
        inviteToken,
        inviteTokenExpiry,
        profileImage: emptyImage,
        coverImage: emptyImage,
      })
      .$fragment(userFragment);
    // After creating coach send invitation to that email
    sendCoachInvitation({
      name,
      email,
      inviteToken: newCoach.inviteToken,
    });
    return newCoach;
  },

  async resetCoachAccount(root, { inviteToken, email, username, password }) {
    // Check if the token is valid or not
    const coach = await verifyToken({ email, inviteToken });

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedCoach = await prisma.updateUser({
      where: { id: coach.id },
      data: {
        username,
        password: hashedPassword,
        verified: true,
        inviteToken: '',
        inviteTokenExpiry: Date.now(), // Expire the token immediately so that user can't use this token again
      },
    });
    return updatedCoach;
  },

  async verifyInvitationToken(root, { inviteToken }) {
    // Check if the token in valid or not
    await verifyToken({ inviteToken });
    return 'ok';
  },
  async deleteCoach(root, { id }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 2 });

    const coachPath = `coaches/${id}`;
    // Deleting session type will delete the sessions, bookings and session related stuff cascading
    await prisma.deleteManySessionTypes({ coach: { id } });
    // Delete every images regarding this coach from clodinary
    cloudinary.api.delete_resources_by_prefix(coachPath, err => {
      if (!err) cloudinary.api.delete_folder(coachPath, () => {});
    });
    return prisma.deleteUser({ id });
  },

  async updateCoach(root, { data, coachId }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 2 });
    const input = { ...data };
    if (data.password) {
      input.password = await bcrypt.hash(data.password, 10);
    }
    const updatedUser = updateUser({ data: input, userId: coachId });
    await createActivity({
      content: {
        type: 'Profile Updated.',
        message: `Your account has been updated.`,
      },
      user,
      type: 'PROFILE',
      data: updatedUser,
    });
    return updatedUser;
  },
};
