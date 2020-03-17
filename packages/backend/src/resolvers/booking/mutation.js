const Stripe = require('stripe');
const moment = require('custom-moment');

const { prisma, Session, User } = require('../../generated/prisma-client'); // eslint-disable-line no-unused-vars
const fragment = require('./fragment');
const sessionFragment = require('../session/fragment');
const userFragment = require('../user/fragment');
const customerFragment = require('../user/cutomerFragment');
const { formatCharge, concatTimeWithDate } = require('../../utils');
const { createActivity } = require('../activity/mutation');
const {
  sendBookingEmail,
  sendCustomerInvitation,
} = require('../mail-templates');
const {
  loginChecker,
  hasPermission,
  createHash,
} = require('../../utils/permission');
const { sendPostPonedMail, sendRescheduleEmail } = require('../mail-templates');

const targetCustomer = async (data, coachId) => {
  const coach = await prisma.user({ id: coachId }).$fragment(userFragment);
  const { customers } = coach;
  const isCustomerExist = customers.some(
    customer => customer.email === data.email
  );
  const customer = customers.find(c => c.email === data.email);
  // const [customer] = await prisma.customers({ where: { email: data.email } });
  if (!isCustomerExist) {
    const inviteToken = await createHash();
    const inviteTokenExpiry = Date.now() + 3600000;
    const newCustomer = await prisma
      .createCustomer({
        ...data,
        role: 'CUSTOMER',
        profileImage: { create: { url: '', width: 0, height: 0 } },
        inviteToken,
        inviteTokenExpiry,
        coach: { connect: { id: coachId } },
      })
      .$fragment(customerFragment);
    await sendCustomerInvitation({
      name: data.name,
      email: data.email,
      username: coach.username,
      inviteToken: newCustomer.inviteToken,
    });
    return newCustomer;
  }
  return customer;
};
module.exports = {
  async createBooking(
    root,
    { customerId, sessionId, userData, token, timeSlot }
  ) {
    let user;

    /** @type {Session} */
    const session = await prisma
      .session({ id: sessionId })
      .$fragment(sessionFragment);

    /** @type {User} */
    const coach = await prisma
      .session({ id: sessionId })
      .sessionType()
      .coach()
      .$fragment(userFragment);

    const { customers } = coach;

    if (coach.email === userData.email) {
      throw new Error('Coach can not be an attendee!');
    }

    // const isExist = customers.some(
    //   customer => customer.email === userData.email
    // );
    // if (isExist) {
    //   throw new Error('This email is already taken');
    // }

    // console.log(isExist);

    // get all customers of this coach

    // 1. Check if the session have available seat of not
    if (session.bookings.length >= session.maxSeats) {
      throw new Error('No seat available now.');
    }

    // 2. Create the customer if not exists on DB

    if (customerId) {
      // If there is customer id then the user is already exists
      user = await prisma
        .customer({ id: customerId })
        .$fragment(customerFragment);
    } else {
      user = await targetCustomer(userData, coach.id);
    }
    // 3. Validate overlapping
    /** @type {Session[]} */
    const conflictingSessions = await prisma.bookings({
      where: {
        customer: { id: user.id },
        session: {
          availability: {
            start_lte: session.availability.end,
            end_gte: session.availability.start,
          },
        },
        timeSlot,
      },
    });

    if (conflictingSessions.length) {
      throw new Error(`Cannot book this session for conflicting schedule.`);
    }

    if (user.id === coach.id) {
      throw new Error('Coach can not be an attendee!');
    }

    const bookingData = {
      customer: { connect: { id: user.id } },
      session: { connect: { id: sessionId } },
      timeSlot,
    };

    // 4. Check for stripe token
    if (token) {
      // validate `token` from stripe
      const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
      const stripeResponse = await stripeClient.charges.create(
        {
          amount: Math.ceil(session.cost * 100),
          application_fee_amount: Math.ceil(session.cost * 10),
          currency: 'usd',
          description: `Booking fee for "${session.name}" of coach "${session.coach.name}"`,
          source: token,
        },
        {
          stripe_account: session.coach.stripeAccount.stripe_user_id,
        }
      );
      const formattedRes = formatCharge(stripeResponse);
      bookingData.charge = {
        create: {
          ...formattedRes,
          stripe_user_id: session.coach.stripeAccount.stripe_user_id,
          coach: { connect: { id: coach.id } },
        },
      };
    }

    // 5. Create the booking in DB
    const booking = await prisma.createBooking(bookingData).$fragment(fragment);

    // 6. Send email confirmation
    await sendBookingEmail(user, booking, coach);

    // 7. Connect customer with coach
    await prisma.updateCustomer({
      where: { id: user.id },
      data: { coach: { connect: { id: coach.id } } },
    });

    await createActivity({
      content: {
        type: 'New Appt.',
        message: `${session.name} on ${moment(
          concatTimeWithDate(session.availability.start, timeSlot)
        ).format('ddd MMM DD, YYYY @ h:mm a')} with ${booking.customer.name}`,
      },
      user: coach,
      type: 'SESSION',
      data: booking.session,
    });
    return booking;
  },



  async updateBooking(root, { data, id }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1 });

    const updatedBooking = await prisma
      .updateBooking({ where: { id }, data })
      .$fragment(fragment);

    sendRescheduleEmail(updatedBooking);

    return updatedBooking;
  },

  async removeAttendee(root, { customerId, sessionId }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1 });

    // NOTE: Coach can only update his customer. Not others
    // const coaches = await prisma.user({ id: customerId }).coaches();
    // Check if the customer is on the coach list
    const coach = await prisma.user({ id: user.id }).$fragment(userFragment);
    if (!coach) throw new Error('You are not able to remove the customer');

    const [booking] = await prisma.bookings({
      where: { session: { id: sessionId }, customer: { id: customerId } },
    });
    if (!booking) throw new Error('Customer not found in this session!');

    // Remove customer from booking
    const updatedBooking = await prisma
      .deleteBooking({ id: booking.id })
      .$fragment(fragment);
    const time = moment(updatedBooking.session.availability.start).format(
      'ddd MMM DD, YYYY h:mm a'
    );
    // Send email
    sendPostPonedMail(
      updatedBooking.customer.email,
      coach.name,
      updatedBooking.session.name,
      time,
      updatedBooking.customer.name
    );
    await createActivity({
      content: {
        type: 'Customer Removed.',
        message: `${updatedBooking.customer.name} have been removed from ${updatedBooking.session.name}`,
      },
      user,
      type: 'SESSION',
      data: updatedBooking.session,
    });
    return updatedBooking;
  },
};
