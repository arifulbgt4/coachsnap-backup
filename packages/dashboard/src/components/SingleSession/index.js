import React from 'react';
import moment from 'custom-moment';
import { concatTimeWithDate } from 'src/utils/date';

const getStartEndToggle = (singleEvent, availability, businessHour) => {
  const rawStart = singleEvent
    ? moment(availability.start)
    : moment(concatTimeWithDate(availability.start, businessHour.start));
  const rawEnd = singleEvent
    ? moment(availability.end)
    : moment(concatTimeWithDate(availability.end, businessHour.end));

  const start = rawStart.format('ddd MMM DD, YYYY | h:mm a');
  const end = rawEnd.format('h:mm a');
  return { start, end, rawStart, rawEnd };
};

const SingleSession = ({
  item: { availability, businessHour, singleEvent, maxSeats, duration, name },
  page,
}) => {
  const { start, end } = getStartEndToggle(
    singleEvent,
    availability,
    businessHour
  );

  return (
    <>
      {page === 'customers' && (
        <>
          <span className="session-name">{name}</span>
          <br className="session-line-break" />
        </>
      )}
      <p className="session-desc">
        {start}
        {' - '}
        {end}
        <br />
        {singleEvent ? 'Single event' : 'Block event'}
        <br />
        {maxSeats ? `${maxSeats} seats ` : `No seats .`} | {duration} mins
      </p>
    </>
  );
};

export default SingleSession;
