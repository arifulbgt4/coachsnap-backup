// External Components
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useSelector } from 'react-redux';

// Own global components
import Fallback from 'src/components/Fallback';
// Data components
import { COACH_SESSIONS } from 'src/resolvers/session/query';

// Own single components
import DateRow from '../DateRow';

const CalendarBody = ({ currentMonth, weekView, currentWeek }) => {
  // Redux state
  const userId = useSelector(state => state.authState.user.id);
  const activityState = useSelector(state => state.uiState.activity);

  let done = false;
  let count = 0;
  const weeks = [];
  const date = currentMonth
    .clone()
    .startOf('month')
    .add('w' - 1)
    .day('Sunday');
  let monthindex = date.month();

  // Current date const
  const toDay = new Date().getDate();
  const toMonth = new Date().getMonth() + 1;
  const toYear = new Date().getFullYear();

  // Local state
  const [select, setSelect] = useState(
    toDay.toString() + toMonth.toString() + toYear.toString()
  );
  // Session data rendering
  const { data, refetch } = useQuery(COACH_SESSIONS, {
    variables: {
      where: {
        coach: { id: userId },
        AND: [
          {
            availability: {
              start_gte: weekView
                ? currentWeek
                    .clone()
                    .startOf('week')
                    .format()
                : currentMonth.startOf('month').format(),
              end_lte: weekView
                ? currentWeek
                    .clone()
                    .endOf('week')
                    .format()
                : currentMonth.endOf('month').format(),
            },
          },
        ],
      },
    },
  });

  useEffect(() => {
    const { type } = activityState;
    if (type === 'SESSION') {
      refetch({
        variables: { where: { coach: { id: userId } } },
      });
    }
  }, [activityState, refetch, userId]);

  if (!weekView) {
    // Monthly date rendering
    while (!done) {
      weeks.push(
        <DateRow
          key={date}
          date={date.clone()}
          data={data}
          currentMonth={currentMonth}
          select={select}
          onDateClick={setSelect}
          view={weekView}
        />
      );

      date.add(1, 'w');
      done = count++ > 2 && monthindex !== date.month();
      monthindex = date.month();
    }
  } else {
    // Weekly date rendering
    weeks.push(
      <DateRow
        key={currentWeek}
        data={data}
        date={currentWeek.clone()}
        currentMonth={currentMonth}
        select={select}
        onDateClick={setSelect}
        weeklyView={weekView}
      />
    );
  }

  return <div className="calendar-box">{weeks}</div>;
};

export default CalendarBody;
