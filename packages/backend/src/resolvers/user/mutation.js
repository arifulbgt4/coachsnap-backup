const bcrypt = require('bcryptjs');
const validator = require('validator');
const moment = require('moment-timezone');

const { prisma, User } = require('../../generated/prisma-client'); // eslint-disable-line no-unused-vars
const { createActivity } = require('../activity/mutation');

const fragment = require('./fragment');
const customerFragment = require('./cutomerFragment');
const bookingFragment = require('../booking/fragment');
const {
  loginChecker,
  hasPermission,
  createHash,
} = require('../../utils/permission');
const { hasSpecialChars } = require('../../utils');
const { signToken } = require('../../utils/auth');
const { uploadImage } = require('../../utils/image-uploader');
const updateUser = require('../common/update-user');
const {
  sendEmailVerification,
  sendResetPassword,
  sendPostPonedMail,
  sendCustomerResetPassword,
  sendCustomerInvitation,
} = require('../mail-templates/index');

module.exports = {
  async signup(root, args) {
    const { password, email, name } = args;

    if (!validator.isEmail(email)) throw new Error('Please enter valid email');
    if (hasSpecialChars(name))
      throw new Error('Name should not contain any special characters.');

    if (!args.username) throw new Error('Username must be provided');

    const data = { ...args };

    if (password.length < 6) {
      throw new Error('Password must be minimum 6 character');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const emailToken = await createHash();
    const emailTokenExpiry = Date.now() + 3600000;

    const emptyImage = { create: { url: '', width: 0, height: 0 } };

    const user = await prisma
      .createUser({
        ...data,
        role: 'COACH',
        password: hashedPassword,
        emailToken,
        emailTokenExpiry,
        profileImage: emptyImage,
        coverImage: emptyImage,
      })
      .$fragment(fragment);

    await sendEmailVerification(user);
    return signToken(user);
  },

  async signupAsCustomer(parent, args) {
    const coach = await prisma
      .user({ username: args.username })
      .$fragment(fragment);
    const { password, email, name } = args;
    const { customers } = coach;
    const isExist = customers.some(customer => customer.email === email);
    if (isExist) {
      throw new Error('This email is already taken');
    }

    if (coach.email === args.email) {
      throw new Error('Coach can not be an attendee!');
    }
    // console.log(isExist);

    // check if the user is logged in as coach
    await hasPermission({ id: coach.id, level: 1 });

    if (!validator.isEmail(email)) throw new Error('Please enter valid email');
    if (hasSpecialChars(name)) {
      throw new Error('Name should not contain any special characters');
    }
    delete args.username;
    const data = { ...args };

    if (password.length < 6) {
      throw new Error('Password must be minimum 6 character');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailToken = await createHash();
    const emailTokenExpiry = Date.now() + 3600000;

    const emptyImage = { create: { url: '', width: 0, height: 0 } };

    const user = await prisma
      .createCustomer({
        ...data,
        password: hashedPassword,
        emailToken,
        emailTokenExpiry,
        profileImage: emptyImage,
        coverImage: emptyImage,
        coach: {
          connect: { id: coach.id },
        },
      })
      .$fragment(customerFragment);
    await sendEmailVerification(user);
    return signToken(user);
  },

  async signin(root, { email, password }) {
    const where = { email };
    // Check user id exists
    const user = await prisma.user(where);
    if (!user) throw new Error('No such user found');
    if (user.role === 'CUSTOMER') {
      throw new Error('Customer login is disabled for now.');
    }
    // Validating password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid password');
    // generate token and update user last login
    const updatedUser = await prisma
      .updateUser({
        where,
        data: { lastLogin: { create: { action: 'login ' } } },
      })
      .$fragment(fragment);
    return {
      token: signToken(updatedUser),
      user: updatedUser,
    };
  },

  async signinAsCustomer(root, { email, password, username }) {
    const coach = await prisma.user({ username }).$fragment(fragment);

    const { customers } = coach;
    const customer = customers.find(c => c.email === email);
    // check if the user is logged in as coach
    // await hasPermission({ id: coach.id, level: 1 });

    // const where = { email };
    // Check user id exists
    // const customer = await prisma.customer();
    // const [customer] = await prisma.customers({ where: { email } });

    if (!customer) throw new Error('No such user found');
    // Validating password
    const valid = await bcrypt.compare(password, customer.password);
    delete customer.password;
    if (!valid) throw new Error('Invalid password');
    return {
      token: signToken(customer),
      customer,
    };
  },

  async verifyEmail(root, { emailToken, email }) {
    const [user] = await prisma.users({
      where: {
        email,
        emailToken,
        emailTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!user) {
      throw new Error('This link is either invalid or expired!');
    }

    const verifiedUser = await prisma
      .updateUser({
        where: { id: user.id },
        data: {
          verified: true,
          emailToken: '',
          emailTokenExpiry: Date.now(),
        },
      })
      .$fragment(fragment);
    return {
      token: signToken(verifiedUser),
      user: verifiedUser,
    };
  },

  async verifyCustomerEmail(root, { emailToken, email }) {
    const [customer] = await prisma.customers({
      where: {
        email,
        emailToken,
        emailTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!customer) {
      throw new Error('This link is either invalid or expired!');
    }

    const verifiedCustomer = await prisma
      .updateCustomer({
        where: { id: customer.id },
        data: {
          verified: true,
          emailToken: '',
          emailTokenExpiry: Date.now(),
        },
      })
      .$fragment(customerFragment);
    return {
      token: signToken(verifiedCustomer),
      customer: verifiedCustomer,
    };
  },

  async verifyCustomerInvitationToken(root, { inviteToken, username }) {
    // Check if the token in valid or not
    const coach = await prisma.user({ username }).$fragment(fragment);

    const { customers } = coach;
    const customer = customers.find(c => c.inviteToken === inviteToken);
    if (!customer) return 'Invalid invite token';
    return 'ok';
  },

  async resetCustomerAccount(root, { inviteToken, email, username, password }) {
    // Check if the token is valid or not
    const coach = await prisma.user({ username }).$fragment(fragment);

    const { customers } = coach;
    const customer = customers.find(c => c.email === email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedCustomer = await prisma.updateCustomer({
      where: { id: customer.id },
      data: {
        password: hashedPassword,
        verified: true,
        inviteToken: '',
        inviteTokenExpiry: Date.now(), // Expire the token immediately so that user can't use this token again
      },
    });
    return {
      token: signToken(updatedCustomer),
      customer: updatedCustomer,
    };
  },

  async sendVerification(root, { email }) {
    const emailToken = await createHash();
    const emailTokenExpiry = Date.now() + 3600000;

    await prisma.updateUser({
      where: { email },
      data: { emailToken, emailTokenExpiry },
    });
    return sendEmailVerification({ email, emailToken });
  },

  async sendVerifivationToCustomer(root, { email }) {
    const emailToken = await createHash();
    const emailTokenExpiry = Date.now() + 3600000;

    await prisma.updateCustomer({
      where: { email },
      data: { emailToken, emailTokenExpiry },
    });
    return sendEmailVerification({ email, emailToken });
  },

  async requestReset(root, { email }) {
    const user = await prisma.user({ email });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    const resetToken = await createHash();
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    await prisma.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });
    await sendResetPassword({ email, resetToken });
    return { message: `An email sent to your mail with a reset url.` };
  },
  async requestCustomerReset(root, { email, username }) {
    const user = await prisma.user({ username }).$fragment(fragment);
    await hasPermission({ id: user.id, level: 1 });
    const { customers } = user;
    const customer = customers.find(c => c.email === email);
    if (!customer) {
      throw new Error(`No such user found for email ${email}`);
    }
    const resetToken = await createHash();
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    await prisma.updateCustomer({
      where: { id: customer.id },
      data: { resetToken, resetTokenExpiry },
    });
    await sendCustomerResetPassword({ email, resetToken, username });
    return { message: `An email sent to your mail with a reset url.` };
  },

  async resetPassword(root, { resetToken, password, confirmPassword }) {
    const [user] = await prisma.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000, // Make sue that the token is using within 1 hour
      },
    });
    if (!user) {
      throw new Error('This token is either invalid or expired!');
    }
    if (password !== confirmPassword) {
      throw new Error("Passwords don't match!");
    }
    if (password.length < 6) {
      throw new Error('Password must be minimum 6 character');
    }
    const newPassword = await bcrypt.hash(password, 10);
    await prisma.updateUser({
      where: { id: user.id },
      data: {
        password: newPassword,
        resetToken: '',
        resetTokenExpiry: Date.now(),
      },
    });
    return { message: 'Password has been changed. Please try to login now.' };
  },

  async resetCustomerPassword(root, { resetToken, password, confirmPassword }) {
    const [customer] = await prisma.customers({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!customer) {
      throw new Error('This token is either invalid or expired!');
    }
    if (password !== confirmPassword) {
      throw new Error("Passwords don't match!");
    }
    if (password.length < 6) {
      throw new Error('Password must be minimum 6 character');
    }
    const newPassword = await bcrypt.hash(password, 10);
    await prisma.updateCustomer({
      where: { id: customer.id },
      data: {
        password: newPassword,
        resetToken: '',
        resetTokenExpiry: Date.now(),
      },
    });
    return { message: 'Password has been changed. Please try to login now.' };
  },

  async createCustomer(root, { email, name }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1 });

    if (!email) {
      throw new Error('email is required!');
    }

    if (!name) {
      throw new Error('name is required');
    }

    if (!validator.isEmail(email)) throw new Error('Please enter valid email');
    if (hasSpecialChars(name))
      throw new Error('Name should not contain any special characters.');

    const coach = await prisma.user({ id: user.id }).$fragment(fragment);

    if (coach.email === email) {
      throw new Error('Coach can not be an attendee!');
    }
    const { customers } = coach;
    const customer = customers.find(c => c.email === email);

    if (customer) throw new Error('This customer is already in your list');
    // Otherwise create
    const inviteToken = await createHash();
    const inviteTokenExpiry = Date.now() + 3600000;
    const newCustomer = prisma
      .createCustomer({
        email,
        name,
        inviteToken,
        inviteTokenExpiry,
        role: 'CUSTOMER',
        coach: { connect: { id: user.id } },
      })
      .$fragment(customerFragment);

    await sendCustomerInvitation({
      name,
      email,
      username: coach.username,
      inviteToken: newCustomer.inviteToken,
    });
    return newCustomer;
  },
  async updateCustomer(root, { customerId, ...data }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1 });
    // NOTE: Coach can only update his customer. Not others
    // If coach Id contains on user coaches array then coach can edit this user
    // const [coach] = await prisma
    //   .user({ id: customerId })
    //   .coaches({ where: { id: user.id } });
    const coach = await prisma.user({ id: user.id }).$fragment(fragment);

    if (!coach) throw new Error('This customer is not associated with you.');

    const updatedCustomer = await prisma.updateCustomer({
      where: { id: customerId },
      data,
    });
    await createActivity({
      content: {
        type: 'Customer',
        message: `${updatedCustomer.name} have been edited`,
      },
      user,
    });
    return updatedCustomer;
  },
  async removeCustomer(root, { customerId }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1 });

    // NOTE: Coach can only update his customer. Not others
    const coach = await prisma.user({ id: user.id }).$fragment(fragment);
    // Check if the customer is on the coach list
    if (!coach) throw new Error('You are not able to remove the customer');

    // Get all sessions
    const sessions = await prisma.sessions({
      where: { coach: { id: coach.id } },
    });
    // Remove the customer from those sessions
    let deletedBooking = {};
    for (const session of sessions) {
      const [booking] = await prisma.bookings({
        where: { session: { id: session.id }, customer: { id: customerId } },
      });
      if (booking) {
        deletedBooking = await prisma
          .deleteBooking({ id: booking.id })
          .$fragment(bookingFragment);
        const time = moment(deletedBooking.session.availability.start).format(
          'ddd MMM DD, YYYY h:mm a'
        );
        // Send email
        sendPostPonedMail(
          deletedBooking.customer.email,
          coach.name,
          deletedBooking.session.name,
          time,
          deletedBooking.customer.name
        );
      }
    }
    // const removedCustomer = await prisma.updateCustomer({
    //   where: { id: customerId },
    //   data: { coach: { disconnect: { id: coach.id } } },
    // });

    const removedCustomer = await prisma.deleteCustomer({
      id: customerId,
    });
    await createActivity({
      content: {
        type: 'Customer Removed.',
        message: `${removedCustomer.name} have been removed from customer list`,
      },
      user,
      type: 'SESSION',
      data: deletedBooking.session,
    });
    return removedCustomer;
  },

  async updateCoachByCoach(root, { data }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1 });
    const input = { ...data };

    // Check for images
    if (data.profileImage) {
      const profilePath = `/coaches/${user.id}/profile`;
      const profileImage = await uploadImage(
        data.profileImage,
        profilePath,
        'profile'
      );
      input.profileImage = {
        update: {
          url: profileImage.url,
          width: profileImage.width,
          height: profileImage.height,
        },
      };
    }
    if (data.coverImage) {
      const coverPath = `/coaches/${user.id}/cover`;
      const coverImage = await uploadImage(data.coverImage, coverPath, 'cover');
      input.coverImage = {
        update: {
          url: coverImage.url,
          width: coverImage.width,
          height: coverImage.height,
        },
      };
    }

    if (data.name) {
      if (hasSpecialChars(data.name)) {
        throw new Error('Name should not contain any special characters.');
      }
    }
    // Check for password
    if (data.password) {
      if (data.password.length < 6)
        throw new Error('Password must be minimum 6 character');
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const userInDb = await prisma.user({ id: user.id });
      const isMatched = await bcrypt.compare(data.password, userInDb.password);
      if (isMatched)
        throw new Error(
          'This password is already there. Please provide a new password'
        );
      input.password = hashedPassword;
    }
    const updatedUser = await updateUser({
      data: input,
      userId: user.id,
    });
    await createActivity({
      content: {
        type: 'Profile Updated.',
        message: `Your account has been updated.`,
      },
      user,
      type: 'PROFILE',
      data: updatedUser,
    });
    // Update user token to assign updated data on user object
    return {
      token: signToken(updatedUser),
      user: updatedUser,
    };
  },

  async deleteCoachImage(root, { type }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1 });
    const data = {};
    const emptyImage = {
      update: {
        url: '',
        width: 0,
        height: 0,
      },
    };
    if (type === 'profile') {
      data.profileImage = emptyImage;
    }
    if (type === 'cover') {
      data.coverImage = emptyImage;
    }
    const updatedUser = await updateUser({
      data,
      userId: user.id,
    });
    // Update user token to assign updated data on user object
    return {
      token: signToken(updatedUser),
      user: updatedUser,
    };
  },
};
