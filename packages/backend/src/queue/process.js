const Queue = require('bull');

const { REDIS_HOST, REDIS_PORT } = process.env;

const {
  sendEmailVerification,
  sendBookingEmail,
  sendRescheduleEmail,
  sendPostPonedMail,
} = require('../resolvers/mail-templates');

const MailQueue = new Queue('emailQueue', {
  redis: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

MailQueue.process(job => {
  switch (job.data.type) {
    case 'Verification':
      sendEmailVerification(job.data.user);
      break;
    case 'Booking':
      sendBookingEmail(job.data.user, job.data.session, job.data.coach);
      break;
    case 'Rescheduled':
      sendRescheduleEmail(
        job.data.email,
        job.data.coach,
        job.data.updatedSession,
        job.data.oldTime,
        job.data.updatedTime,
        job.data.name
      );
      break;

    case 'PostPoned':
      sendPostPonedMail(
        job.data.email,
        job.data.coachName,
        job.data.session,
        job.data.time,
        job.data.customerName,
        job.data.type
      );
      break;

    default:
      '';
  }
});

MailQueue.process();

module.exports = MailQueue;
