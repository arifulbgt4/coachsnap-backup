const moment = require('custom-moment');

export const getWeekDay = () => {
  const weekFormat = 'isoWeek';
  const dateFormat = 'YYYY-MM-DD';
  return {
    weekStart: moment()
      .startOf(weekFormat)
      .format(),

    weekEnd: moment()
      .endOf(weekFormat)
      .format(),
  };
};

export const formatDate = (date, format, timezone) =>
  moment(date)
    .tz(timezone)
    .format(format);

export const concatTimeWithDate = (date, time) => {
  const parsedDate = moment(date).format(moment.HTML5_FMT.DATE);
  return moment(`${parsedDate} ${time}`, 'YYYY-MM-DD HH:mm').format();
};

const use24Hour = false;
export const formatTime = t =>
  moment(t, 'k:m')
    // .tz(user.timezone)
    .format(use24Hour ? 'HH:mm' : 'hh:mm a');
