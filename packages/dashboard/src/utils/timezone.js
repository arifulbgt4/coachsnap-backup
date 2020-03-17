import moment from 'custom-moment';

moment.tz.setDefault('America/New_York');

const timeZones = moment.tz.names();

const sortByZone = (a, b) => {
  const [ahh, amm] = a
    .split('GMT')[1]
    .split(')')[0]
    .split(':');
  const [bhh, bmm] = b
    .split('GMT')[1]
    .split(')')[0]
    .split(':');
  return +ahh * 60 + amm - (+bhh * 60 + bmm);
};

export const getTimeZoneList = () => {
  const timeZone = timeZones.map(
    (t, i) => `(GMT${moment.tz(timeZones[i]).format('Z')}) ${timeZones[i]}`
  );

  return timeZone.sort(sortByZone);
};

export const formatGmt = t => `GMT${moment.tz(t).format('Z')} ${t}`;

export const formatTimeZone = (date, userTimezone) =>
  moment.tz(date, userTimezone);
