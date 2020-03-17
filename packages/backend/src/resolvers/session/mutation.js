const moment = require('custom-moment');
const validator = require('validator');
const isNumeric = require('../../utils/isNumeric');

const {
  prisma,
  SessionCreateInput, // eslint-disable-line no-unused-vars
  Session, // eslint-disable-line no-unused-vars
} = require('../../generated/prisma-client');

const {
  loginChecker,
  isOwns,
  hasPermission,
} = require('../../utils/permission');
const { isValidTimeInterval, isOverlap } = require('../../utils');
const { uploadImage } = require('../../utils/image-uploader');
const { getBookedTimes } = require('./query');
const SessionQueries = require('./query');
const { createActivity } = require('../activity/mutation');
const {
  sendRescheduleEmail,
  sendPostPonedMail,
  sendBookingRemainder,
} = require('../mail-templates');
const fragment = require('./fragment');

/** @typedef {Number|Date} Comparable */
/**
 * @param {Comparable[]} slot
 * @param {Comparable[]} booking
 * @returns {boolean}
 */
const doesOverlap = (slot, booking) => {
  if (!slot || !booking) {
    return false;
  }
  return (
    (slot[0] <= booking[1] && slot[1] >= booking[0]) ||
    (booking[0] <= slot[1] && booking[1] >= slot[0])
  );
};

function validateBusinessHour(businessHour) {
  const hourOptions = { min: 0, max: 23 };
  const minuteOptions = { min: 0, max: 59 };
  const { start, end } = businessHour.create || businessHour.update;
  if (start) {
    if (typeof start !== 'string') {
      throw new Error('Business hour is invalid');
    }
    const [startHour, startMinute] = start.split(':');
    if (
      !validator.isInt(startHour, hourOptions) ||
      !validator.isInt(startMinute, minuteOptions)
    ) {
      throw new Error('Business start hour is invalid');
    }
  }
  if (end) {
    if (typeof end !== 'string') {
      throw new Error('Business hour is invalid');
    }
    const [endHour, endMinute] = end.split(':');
    if (
      !validator.isInt(endHour, hourOptions) ||
      !validator.isInt(endMinute, minuteOptions)
    ) {
      throw new Error('Business end hour is invalid');
    }
  }
}

// This variable is refer that on pubsub it's Session schema
const type = 'SESSION';

module.exports = {
  /**
   * @param root
   * @param params
   * @param {SessionCreateInput} params.data
   * @param params.sessionTypeId
   * @param ctx
   * @returns {Promise<Session>}
   */
  async createSession(root, { data, sessionTypeId, coverImage }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1 });
    const coach = await prisma.sessionType({ id: sessionTypeId }).coach();
    // Coach owns the session type
    await isOwns(user.id, coach.id);
    const { create } = data.availability;
    // Validate session time
    // Check if start is before end as date and time
    await isValidTimeInterval(create);
    // Check time overlapping comparing by others session
    const coachSessions = await getBookedTimes(null, { coachId: coach.id });
    coachSessions.forEach(existingSession =>
      isOverlap({ existingSession, newSession: create })
    );
    const input = { ...data };

    const image = { create: { url: '', width: 0, height: 0 } };

    if (!input.singleEvent) {
      const { businessHour } = input;
      if (businessHour) {
        // Check if start is before end as date and time
        validateBusinessHour(businessHour);
      }
    } else {
      delete input.businessHour;
    }

    let session = await prisma
      .createSession({
        ...input,
        coverImage: image,
        sessionType: { connect: { id: sessionTypeId } },
        coach: { connect: { id: user.id } },
      })
      .$fragment(fragment);
    if (coverImage) {
      const imagePath = `/coaches/${user.id}/session/${session.id}`;

      const { url, width, height } = await uploadImage(
        coverImage,
        imagePath,
        'cover'
      );
      session = await prisma
        .updateSession({
          where: { id: session.id },
          data: {
            coverImage: { update: { url, width, height } },
          },
        })
        .$fragment(fragment);
    }

    await createActivity({
      content: {
        type: 'Created',
        message: `${session.name} session have been created`,
      },
      user,
      type,
      data: session,
    });
    return session;
  },

  async deleteSession(root, { id }, ctx) {
    const user = await loginChecker(ctx);
    // Permission
    await hasPermission({ id: user.id, level: 1 });

    const session = await prisma.session({ id }).$fragment(fragment);
    const isBooked = session.bookings.length > 0;
    if (isBooked) {
      throw new Error('Session cannot be deleted when customer booked it');
    }

    const sessionType = await prisma.session({ id }).sessionType();
    const coach = await prisma.sessionType({ id: sessionType.id }).coach();
    // Coach owns the session type
    await isOwns(user.id, coach.id);
    await prisma.deleteSession({ id });

    const time = moment(session.availability.start).format(
      'ddd MMM DD, YYYY h:mm a'
    );
    if (session.bookings.length > 0) {
      session.bookings.forEach(async booking =>
        sendPostPonedMail(
          booking.customer.email,
          session.coach.name,
          session.name,
          time,
          booking.customer.name
        )
      );
    }
    // Create activity message
    await createActivity({
      content: {
        type: 'Deleted',
        message: `${session.name} session have been deleted`,
      },
      user,
      type,
      data: session,
    });
    return session;
  },

  async updateSession(root, { id, data, coverImage }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1 });

    const input = { ...data };

    const { businessHour, availability, singleEvent } = input;
    const oldSession = await prisma.session({ id }).$fragment(fragment);

    if (businessHour) {
      if (oldSession.bookings.length > 0) {
        throw new Error(
          'You can only update session time until no one booked this session'
        );
      } else {
        validateBusinessHour(businessHour);
      }
    }
    // Coach owns the session type
    await isOwns(user.id, oldSession.coach.id);

    let newTime;
    if (data.availability) {
      if (data.availability.create || data.availability.upsert) {
        throw new Error(
          'cannot create availability entry while updating session'
        );
      }
      newTime = (({ start, end }) => [new Date(start), new Date(end)])(
        data.availability.update
      );

      if (newTime[0] >= newTime[1]) {
        throw new Error('starting time should be before ending time');
      }
    }

    const bookedTimes = (
      await SessionQueries.getBookedTimes(root, {
        coachId: oldSession.coach.id,
        ignoreSessionId: id,
      })
    ).map(bt => [bt.start, bt.end]);
    for (const bookedTime of bookedTimes) {
      if (doesOverlap(newTime, bookedTime)) {
        throw new Error(
          'Cannot update available time. Another session is created at that time.'
        );
      }
    }

    const imagePath = `/coaches/${user.id}/session/${id}`;

    if (coverImage) {
      const { url, width, height } = await uploadImage(
        coverImage,
        imagePath,
        'cover'
      );
      input.coverImage = { update: { url, width, height } };
    }
    // Remove business hour if it has when It's a single session
    if (singleEvent) {
      if (oldSession.businessHour) {
        input.businessHour = { delete: true };
      }
    } else if (input.businessHour) {
      // Create business hour
      input.businessHour = {
        create: { ...input.businessHour.update }, // Front frontend the data is coming on update object but we need to the data on create object
      };
    }

    delete data.availability;
    for (const key in data) {
      if (isNumeric(data[key])) {
        if (data[key] < 0) throw new Error(`value of ${key} must be positive `);
      }
    }

    const updatedSession = await prisma
      .updateSession({
        where: { id },
        data: input,
      })
      .$fragment(fragment);

    if (availability && availability.update) {
      if (updatedSession.bookings.length > 0) {
        updatedSession.bookings.forEach(booking => {
          const format = 'YYYY-DD-MM hh:mm a';
          const newDate = moment(
            JSON.parse(JSON.stringify(availability.update)).start
          ).format(format);
          const prevDate = moment(oldSession.availability.start).format(format);
          if (newDate !== prevDate) {
            // That means coach trying to change the session date. So customers should get an emai about it
            sendRescheduleEmail({
              session: updatedSession,
              timeSlot: booking.timeSlot,
              customer: booking.customer,
            });
          }
        });
      }
    }

    await createActivity({
      content: {
        type: 'Updated',
        message: `${updatedSession.name} session details have been updated`,
      },
      user,
      type,
      data: updatedSession,
    });

    return updatedSession;
  },
  async deleteSessionImage(root, { id }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1 });
    const emptyImage = {
      update: {
        url: '',
        width: 0,
        height: 0,
      },
    };
    return prisma
      .updateSession({
        where: { id },
        data: { coverImage: emptyImage },
      })
      .$fragment(fragment);
  },
  async sendRemainder(root, { id }, ctx) {
    const user = await loginChecker(ctx);
    await hasPermission({ id: user.id, level: 1 });
    const session = await prisma.session({ id }).$fragment(fragment);
    const { bookings, coach } = session;
    if (bookings.length > 0) {
      const sendEmail = bookings.map(async booking =>
        sendBookingRemainder({ session, coach, booking })
      );
      await Promise.all(sendEmail);
      return { message: 'Email is sent to registered customers' };
    }
    return { message: 'No customer booked this session yet.' };
  },
};
