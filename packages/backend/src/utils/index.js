const moment = require('custom-moment');
const cleanDeep = require('clean-deep');

const { APP_SECRET } = process.env;

const isValidTimeInterval = ({ start, end }) => {
  const startMoment = moment(start);
  const endMoment = moment(end);
  // Careful when using isBefore() or alikes
  // Read the NOTE here for more info: https://momentjscom.readthedocs.io/en/latest/moment/05-query/01-is-before/
  if (!startMoment.isBefore(endMoment))
    throw new Error('Invalid time interval.');
};

const isOverlap = ({ existingSession, newSession }) => {
  const startExistMoment = moment(existingSession.start);
  const endExistMoment = moment(existingSession.end);
  const startNewMoment = moment(newSession.start);
  const endNewMoment = moment(newSession.end);
  // between or the same intervals
  if (
    startNewMoment.isBetween(startExistMoment, endExistMoment) ||
    endNewMoment.isBetween(startExistMoment, endExistMoment) ||
    startNewMoment.isSame(startExistMoment) ||
    endNewMoment.isSame(endExistMoment)
  )
    throw new Error('Another session is created on this time.');
};

const hasSpecialChars = value => {
  // Regex for Valid Characters i.e. Alphabets, Numbers and Space.
  /* eslint no-useless-escape: "off" */

  const regex = /[\!\@\#\$\%\^\&\*\)\(\+\=\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-\d+]/g;

  // Validate value against the Regex.
  return value.match(regex);
};

const formatCharge = charge => {
  /* eslint-disable no-param-reassign */

  return cleanDeep({
    id: charge.id,
    stripe_user_id: charge.stripe_user_id,
    amount: charge.amount,
    amount_refunded: charge.amount_refunded,
    application_fee_amount: charge.application_fee_amount,
    description: charge.description,
    receipt_url: charge.receipt_url,
    refunded: charge.refunded,
    currency: charge.currency,
  });
};

const concatTimeWithDate = (date, time) => {
  const parsedDate = moment(date).format(moment.HTML5_FMT.DATE);
  return moment(`${parsedDate} ${time}`, 'YYYY-MM-DD HH:mm').format();
};

module.exports = {
  APP_SECRET,
  isValidTimeInterval,
  isOverlap,
  hasSpecialChars,
  formatCharge,
  concatTimeWithDate,
};
