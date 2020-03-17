// External Components
import React from 'react';
import classnames from 'classnames';

import { concatTimeWithDate } from 'src/utils/date';
// Own Style
import './style.less';

const moment = require('custom-moment');

const SessionBadge = ({ onClick, data, weekly = false }) => {
  const {
    maxSeats: attendees,
    name,
    bookings,
    availability,
    businessHour,
    singleEvent,
  } = data;

  const { start, end } = availability;

  const startTime = singleEvent
    ? moment(start).format('h:mm a')
    : moment(concatTimeWithDate(start, businessHour.start)).format('h:mm a');
  const endTime = singleEvent
    ? moment(end)
        // .tz(user.timezone)
        .format('h:mm a')
    : moment(concatTimeWithDate(end, businessHour.end))
        // .tz(user.timezone)
        .format('h:mm a');

  function inHourSlotTop(time) {
    const minute = time.split(' ')[0];
    if (minute === '45') {
      return 60;
    }
    if (minute === '30') {
      return 40;
    }
    if (minute === '15') {
      return 20;
    }
    if (minute === '00') {
      return 0;
    }
  }

  function inHourSlotHeight(start, end) {
    const startHour = parseInt(start[0]);
    const endHour = parseInt(end[0]);
    const startMinute = parseInt(start[1]);
    const endMinute = parseInt(end[1]);

    let minuteDistance = 0;
    let minuteStart = 0;
    let hourdistance = 80;

    if (endHour === startHour) {
      minuteDistance = endMinute - startMinute;
      return minuteDistance * (20 / 15);
    }
    const initDistance = endHour - startHour;

    if (initDistance === 1) {
      minuteStart = 60 - startMinute;
      minuteDistance = minuteStart + endMinute;
      return minuteDistance * (20 / 15);
    }
    minuteStart = 60 - startMinute;
    minuteDistance += minuteStart + endMinute;
    hourdistance *= initDistance - 1;
    return hourdistance + minuteDistance * (20 / 15);
  }

  const startTimeFormate = moment(startTime, 'h:mm a')
    // .tz(user.timezone)
    .format('H:mm');
  const endTimeFormate = moment(endTime, 'h:mm a')
    // .tz(user.timezone)
    .format('H:mm');
  const startingSpilit = startTimeFormate.split(':');
  const endingSpilit = endTimeFormate.split(':');

  const topPosition = 80 * startingSpilit[0] + inHourSlotTop(startingSpilit[1]);

  const badgeHeight = inHourSlotHeight(startingSpilit, endingSpilit);

  return (
    <div
      onClick={e => onClick(e, data)}
      style={{ height: weekly && badgeHeight, top: topPosition }}
      title={name}
      className={classnames({
        'weekly-badge': weekly,
        'session-badge': !weekly,
      })}
    >
      <h4>{name}</h4>
      {!weekly && (
        <>
          <span>{bookings && `${bookings.length}/${attendees}`}</span>
          <p>
            {startTime} - {endTime}
          </p>
        </>
      )}
    </div>
  );
};

export default SessionBadge;
