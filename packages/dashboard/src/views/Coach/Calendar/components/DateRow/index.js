// External Components
import React from 'react';
import Row from 'antd/lib/row';
import classnames from 'classnames';

// Own single components
import DateBox from '../DateBox';
import HourlyBody from '../HourlyBody';

// Library Style
import 'antd/lib/row/style';

// Own Style
import './style.less';

const DateRow = ({ date, currentMonth, weeklyView, data }) => {
  // NOTE: THis shouldn't be hardcoded
  const timeSlots = [
    '12:00 am',
    '12:15 am',
    '12:30 am',
    '12:45 am',
    '01:00 am',
    '01:15 am',
    '01:30 am',
    '01:45 am',
    '02:00 am',
    '02:15 am',
    '02:30 am',
    '02:45 am',
    '03:00 am',
    '03:15 am',
    '03:30 am',
    '03:45 am',
    '04:00 am',
    '04:15 am',
    '04:30 am',
    '04:45 am',
    '05:00 am',
    '05:15 am',
    '05:30 am',
    '05:45 am',
    '06:00 am',
    '06:15 am',
    '06:30 am',
    '06:45 am',
    '07:00 am',
    '07:15 am',
    '07:30 am',
    '07:45 am',
    '08:00 am',
    '08:15 am',
    '08:30 am',
    '08:45 am',
    '09:00 am',
    '09:15 am',
    '09:30 am',
    '09:45 am',
    '10:00 am',
    '10:15 am',
    '10:30 am',
    '10:45 am',
    '11:00 am',
    '11:15 am',
    '11:30 am',
    '11:45 am',
    '12:00 pm',
    '12:15 pm',
    '12:30 pm',
    '12:45 pm',
    '01:00 pm',
    '01:15 pm',
    '01:30 pm',
    '01:45 pm',
    '02:00 pm',
    '02:15 pm',
    '02:30 pm',
    '02:45 pm',
    '03:00 pm',
    '03:15 pm',
    '03:30 pm',
    '03:45 pm',
    '04:00 pm',
    '04:15 pm',
    '04:30 pm',
    '04:45 pm',
    '05:00 pm',
    '05:15 pm',
    '05:30 pm',
    '05:45 pm',
    '06:00 pm',
    '06:15 pm',
    '06:30 pm',
    '06:45 pm',
    '07:00 pm',
    '07:15 pm',
    '07:30 pm',
    '07:45 pm',
    '08:00 pm',
    '08:15 pm',
    '08:30 pm',
    '08:45 pm',
    '09:00 pm',
    '09:15 pm',
    '09:30 pm',
    '09:45 pm',
    '10:00 pm',
    '10:15 pm',
    '10:30 pm',
    '10:45 pm',
    '11:00 pm',
    '11:15 pm',
    '11:30 pm',
    '11:45 pm',
  ];

  const days = [];

  // Rendering date to a week
  for (let i = 0; i < 7; i++) {
    const day = {
      name: date.format('dd').substring(0, 1),
      number: date.date(),
      isCurrentMont: date.month() === currentMonth.month(),
    };

    if (weeklyView) {
      days.push(
        // Weekly view date box
        <HourlyBody
          key={day.number}
          date={date}
          data={data}
          select={day.select}
          timeSlots={timeSlots}
        />
      );
    } else {
      days.push(
        // Monthly view date box
        <DateBox
          key={day.number}
          number={day.number}
          isCurrentMont={day.isCurrentMont}
          view={weeklyView}
          date={date}
          data={data}
          currentMonth={currentMonth}
          select={day.select}
          isTodayData={day.isTodayData}
        />
      );
    }

    date = date.clone();
    date.add(1, 'day');
  }

  // Time slot divider of weekly view
  const timeDivider = time =>
    time.split(':')[1].split(' ')[0] === '00' ? time : '';

  return (
    <Row
      type="flex"
      key={days[0]}
      className={classnames('date-row', {
        weeklyview: weeklyView,
      })}
    >
      {weeklyView && (
        <ul className="time-list">
          {timeSlots.map(time => (
            // Time slot list
            <li className="time-block" key={time}>
              <span>{timeDivider(time)}</span>
            </li>
          ))}
        </ul>
      )}
      {days}
    </Row>
  );
};

export default DateRow;
