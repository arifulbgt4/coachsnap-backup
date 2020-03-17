const fs = require('fs');
const moment = require('custom-moment');
const { mockTimezone } = require('custom-moment/utils');
const tempWrite = require('temp-write');
const Handlebars = require('handlebars');
const cal = require('ics');

const { transport } = require('../../utils/permission');
const { concatTimeWithDate } = require('../../utils');

const { DASHBOARD_URL, MESSANGER_MAIL } = process.env;

const verifySource = fs.readFileSync(`${__dirname}/verify.handlebars`, 'utf-8');
const inviteCoachSource = fs.readFileSync(
  `${__dirname}/invitation-coach.handlebars`,
  'utf-8'
);
const inviteCustomerSource = fs.readFileSync(
  `${__dirname}/invitation-customer.handlebars`,
  'utf-8'
);
const resetPasswordSource = fs.readFileSync(
  `${__dirname}/reset.handlebars`,
  'utf-8'
);
const bookingSource = fs.readFileSync(
  `${__dirname}/booking.handlebars`,
  'utf-8'
);

const remainderSource = fs.readFileSync(
  `${__dirname}/remainder.handlebars`,
  'utf-8'
);

const rescheduleSource = fs.readFileSync(
  `${__dirname}/reschedule.handlebars`,
  'utf-8'
);

const postponedSource = fs.readFileSync(
  `${__dirname}/postponed.handlebars`,
  'utf-8'
);

// Include partials like header footer
Handlebars.registerPartial(
  'header',
  fs.readFileSync(`${__dirname}/partials/header.handlebars`, 'utf8')
);
Handlebars.registerPartial(
  'footer',
  fs.readFileSync(`${__dirname}/partials/footer.handlebars`, 'utf8')
);
Handlebars.registerPartial(
  'tableFooter',
  fs.readFileSync(`${__dirname}/partials/table-footer.handlebars`, 'utf8')
);

const verifyEmailTemplate = Handlebars.compile(verifySource);
const inviteCoachTemplate = Handlebars.compile(inviteCoachSource);
const inviteCustomerTemplate = Handlebars.compile(inviteCustomerSource);
const resetPasswordTemplate = Handlebars.compile(resetPasswordSource);
const bookingEmailTemplate = Handlebars.compile(bookingSource);
const remainderEmailTemplate = Handlebars.compile(remainderSource);
const rescheduleTemplate = Handlebars.compile(rescheduleSource);
const postponedTemplate = Handlebars.compile(postponedSource);

const getICalTime = (time, zone) => {
  return mockTimezone(time, zone)
    .utc()
    .format('YYYY M DD H m')
    .split(' ');
};

function CreateGoogleCalendar({ session, timeSlot }) {
  const { availability, name, description, coach, duration } = session;
  return new Promise((resolve, reject) => {
    const date = concatTimeWithDate(availability.start, timeSlot);
    const start = getICalTime(
      session.singleEvent ? session.availability.start : date,
      coach.timezone
    );
    const end = getICalTime(
      session.singleEvent
        ? session.availability.end
        : moment(date)
            .add(duration, 'minutes')
            .format(),
      coach.timezone
    );

    cal.createEvent(
      {
        title: `${coach.name}-${name}`,
        description,
        busyStatus: 'FREE',
        start,
        end,
        startInputType: 'utc',
        startOutputType: 'utc',
        endInputType: 'utc',
        endOutputType: 'utc',
        organizer: { name: coach.name, email: coach.email },
      },
      (error, value) => {
        if (error) console.log(error);

        // write ics file on that temp file and return the file path
        resolve(tempWrite(value, `event.ics`));
      }
    );
  });
}

async function sendEmailVerification({ name, email, emailToken }) {
  try {
    const verifyUrl = `${DASHBOARD_URL}/verify?token=${emailToken}`;

    // Send email with verification url
    await transport.sendMail({
      from: MESSANGER_MAIL,
      to: email,
      subject: 'Email verification',
      html: verifyEmailTemplate({ name, email, emailToken, verifyUrl }),
    });

    return 'Verification url sent to your mail';
  } catch (error) {
    throw new Error('Cannot send email.');
  }
}

async function sendCoachInvitation({ name, email, inviteToken }) {
  try {
    const invitationUrl = `${DASHBOARD_URL}/reset-account?inviteToken=${inviteToken}`;

    // Send email with verification url
    await transport.sendMail({
      from: MESSANGER_MAIL,
      to: email,
      subject: 'You are invited to Coachsnap.',
      html: inviteCoachTemplate({ name, invitationUrl }),
    });
  } catch (error) {
    throw new Error('Cannot send email.');
  }
}

async function sendCustomerInvitation({ name, email, username, inviteToken }) {
  try {
    const invitationUrl = `${DASHBOARD_URL}/${username}/reset-account?inviteToken=${inviteToken}`;

    // Send email with verification url
    await transport.sendMail({
      from: MESSANGER_MAIL,
      to: email,
      subject: 'You are invited to Coachsnap.',
      html: inviteCustomerTemplate({ name, invitationUrl }),
    });
  } catch (error) {
    throw new Error('Cannot send email.');
  }
}

async function sendResetPassword({ email, resetToken }) {
  try {
    const resetUrl = `${DASHBOARD_URL}/reset?resetToken=${resetToken}`;

    await transport.sendMail({
      from: MESSANGER_MAIL,
      to: email,
      subject: 'CoachSnap | Reset your password',
      html: resetPasswordTemplate({ resetUrl }),
    });

    return { message: 'Verification url sent to your mail' };
  } catch (error) {
    console.log(error);
    throw new Error('Cannot send email.');
  }
}

async function sendCustomerResetPassword({ email, resetToken, username }) {
  try {
    const resetUrl = `${DASHBOARD_URL}/${username}/reset?resetToken=${resetToken}`;
    await transport.sendMail({
      from: MESSANGER_MAIL,
      to: email,
      subject: 'CoachSnap | Reset your password',
      html: resetPasswordTemplate({ resetUrl }),
    });

    return { message: 'Verification url sent to your mail' };
  } catch (error) {
    console.log(error);
    throw new Error('Cannot send email.');
  }
}

async function sendBookingEmail(user, booking, coach) {
  const { session, timeSlot } = booking;
  const icsPath = await CreateGoogleCalendar({ session, timeSlot });
  const sessionObj = {
    name: session.name,
    start: session.singleEvent
      ? mockTimezone(session.availability.start, coach.timezone).format(
          'ddd MMM DD, YYYY h:mm a'
        )
      : mockTimezone(
          concatTimeWithDate(session.availability.start, timeSlot),
          coach.timezone
        ).format('ddd MMM DD, YYYY h:mm a'),
  };
  // Send email
  await transport.sendMail({
    from: MESSANGER_MAIL,
    to: user.email,
    subject: 'Booking Confirmation',
    html: bookingEmailTemplate({ user, sessionObj, coach }),
    icalEvent: {
      method: 'PUBLISH',
      path: icsPath,
    },
  });
}

async function sendBookingRemainder({ session, coach, booking }) {
  const { timeSlot, customer } = booking;
  const { availability, name } = session;

  const icsPath = await CreateGoogleCalendar({ session, timeSlot });
  const sessionObj = {
    name,
    start: session.singleEvent
      ? mockTimezone(session.availability.start, coach.timezone).format(
          'ddd MMM DD, YYYY h:mm a'
        )
      : mockTimezone(
          concatTimeWithDate(availability.start, timeSlot),
          coach.timezone
        ).format('ddd MMM DD, YYYY h:mm a'),
  };
  // Send email
  await transport.sendMail({
    from: MESSANGER_MAIL,
    to: customer.email,
    subject: 'Booking Remainder',
    html: remainderEmailTemplate({ user: customer, sessionObj, coach }),
    icalEvent: {
      method: 'PUBLISH',
      path: icsPath,
    },
  });
}

async function sendRescheduleEmail({ session, timeSlot, customer }) {
  const icsPath = await CreateGoogleCalendar({ session, timeSlot });
  await transport.sendMail({
    from: MESSANGER_MAIL,
    to: customer.email,
    subject: 'Session Rescheduled',
    html: rescheduleTemplate({
      coach: session.coach.name,
      session: session.name,
      newTime: session.singleEvent
        ? mockTimezone(
            session.availability.start,
            session.coach.timezone
          ).format('ddd MMM DD, YYYY h:mm a')
        : mockTimezone(
            concatTimeWithDate(session.availability.start, timeSlot),
            session.coach.timezone
          ).format('ddd MMM DD, YYYY h:mm a'),
      name: customer.name,
    }),
    icalEvent: {
      method: 'PUBLISH',
      path: icsPath,
    },
  });
}

async function sendPostPonedMail(email, coach, session, time, name) {
  await transport.sendMail({
    from: MESSANGER_MAIL,
    to: email,
    subject: 'Session postponed',
    html: postponedTemplate({ coach, session, time, name }),
  });
}

module.exports = {
  sendEmailVerification,
  sendCoachInvitation,
  sendCustomerInvitation,
  sendResetPassword,
  sendCustomerResetPassword,
  sendRescheduleEmail,
  sendBookingEmail,
  sendBookingRemainder,
  sendPostPonedMail,
};
