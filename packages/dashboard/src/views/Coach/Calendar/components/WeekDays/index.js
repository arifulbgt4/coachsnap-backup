// External Components
import React from 'react';
import classnames from 'classnames';

// Own Style
import './style.less';

export default ({ weeklyview, currentWeek }) => {
  const week = currentWeek.clone();

  // Rendering day name of week
  function dayName(weekly, date, dayname, increment = false) {
    if (weekly) {
      // Weekly name
      return (
        <span>
          {increment
            ? date.add(1, 'day').format('ddd, MMM ')
            : date.format('ddd, MMM ')}
          {date.date()}
        </span>
      );
    }
    // Monthly name
    return <span>{dayname}</span>;
  }

  // Week days name
  const sunday = dayName(weeklyview, week, 'Sun'); // Sunday
  const monday = dayName(weeklyview, week, 'Mon', true); // Monday
  const tuesday = dayName(weeklyview, week, 'Tue', true); // Tuesday
  const wednesday = dayName(weeklyview, week, 'Wed', true); // Wednesday
  const thursday = dayName(weeklyview, week, 'Thu', true); // Thursday
  const friday = dayName(weeklyview, week, 'Fri', true); // Friday
  const saturday = dayName(weeklyview, week, 'Sat', true); // Saturday

  return (
    <ul
      className={classnames('week-days-name', {
        weeklyview,
      })}
    >
      <li>{sunday}</li>
      <li>{monday}</li>
      <li>{tuesday}</li>
      <li>{wednesday}</li>
      <li>{thursday}</li>
      <li>{friday}</li>
      <li>{saturday}</li>
    </ul>
  );
};
