const moment = require('./');

const mockTimezone = (time, zone) => {
  const format = 'YYYY-MM-DDTHH:mm:SS';
  const zoneStripped = moment(time).format(format);
  const zoneApplied = moment.tz(zoneStripped, format, zone).clone();
  return zoneApplied
};

const mockTimezoneGuess = (time, zone)=> mockTimezone(time, zone).tz(moment.tz.guess())

module.exports = {mockTimezone, mockTimezoneGuess};