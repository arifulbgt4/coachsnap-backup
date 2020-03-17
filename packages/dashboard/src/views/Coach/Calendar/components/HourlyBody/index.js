// External Components
import React, { useState, useEffect, memo } from 'react';
import classnames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import Col from 'antd/lib/col';

// Own global components
import Fallback from 'src/components/Fallback';
import useModalVisible from 'src/hooks/useModalVisible';
import { setSession } from 'src/state/ducks/session/actions';
import { toggleSessionModal } from 'src/state/ducks/ui/actions';

// Data components
import { COACH_SESSIONS } from 'src/resolvers/session/query';

// Own single components
import CreateSession from '../CreateSession';
import SessionBadge from '../SessionBadge';
import SessionDetails from '../SessionDetails';

// Library Style
import 'antd/lib/col/style';

// Own Style
import './style.less';

const moment = require('custom-moment');

const HourlyBody = ({ date, select, timeSlots, data: res }) => {
  // Local state
  const [initialTime, setInitialTime] = useState('');

  // Modals visible state
  const [status, open, close, cancel] = useModalVisible(false);
  const [visible, openDetails] = useModalVisible(false);

  const sessionData = [];
  const curentDate = date.clone().format('YYYY/MM/DD');

  const sessionModal = useSelector(state => state.uiState.sessionModal);
  // Redux action
  const dispatch = useDispatch();

  // Session data

  // Filter session for each day
  res &&
    res.getCoachSessions.sessions.map(d => {
      const { start } = d.availability;
      const sDate = moment(start)
        // .tz(user.timezone)
        .format('YYYY/MM/DD');
      if (sDate === curentDate) {
        sessionData.push(d);
      }
    });

  // Session details function
  function sessionDetails(e, sessionObj) {
    e.stopPropagation();
    dispatch(setSession(sessionObj));
    dispatch(toggleSessionModal(curentDate));
    openDetails(e);
  }

  // Session create function
  function createSession(e, getTime) {
    const modifyTime = moment(getTime, 'hh:mm a')
      // .tz(user.timezone)
      .format('HH:mm');
    setInitialTime(modifyTime);
    open(e);
  }

  // Time slot
  function timeView(time) {
    const checkTime = time.split(':')[1].split(' ')[0] === '00';
    return (
      <li
        key={time}
        onClick={e => createSession(e, time)}
        className={classnames('time-block', {
          'border-item': checkTime,
        })}
      >
        {checkTime && <span>{time}</span>}
      </li>
    );
  }

  return (
    <>
      <Col
        className={classnames('date-col-hourly', {
          selected: select,
        })}
      >
        <div className="hourly-body">
          <ul className="in-calendar-block">
            {/* Session list  */}
            {sessionData.length
              ? sessionData.map(obj => {
                  const { maxSeats, name } = obj;
                  const { start, end } = obj.availability;
                  const startTimeS = moment(start)
                    // .tz(user.timezone)
                    .format('h:mm a');
                  const endTimeS = moment(end)
                    // .tz(user.timezone)
                    .format('h:mm a');
                  const sessionDay = moment(start)
                    // .tz(user.timezone)
                    .format('ddd MMM DD');
                  return (
                    <SessionBadge
                      key={obj.id}
                      name={name}
                      attendees={maxSeats}
                      startTime={startTimeS}
                      endTime={endTimeS}
                      data={obj}
                      sessionDate={sessionDay}
                      onClick={e => sessionDetails(e, obj)}
                      weekly
                      {...obj}
                    />
                  );
                })
              : ''}

            {timeSlots.map(time => timeView(time))}
          </ul>
        </div>
      </Col>

      {/* Session create modal */}
      <CreateSession
        visible={status}
        close={close}
        cancel={cancel}
        calendarType="Weekly"
        sessionDuration={15}
        curentDate={curentDate}
        initialTime={initialTime}
      />

      {/* Session details modal */}
      {sessionModal === curentDate && <SessionDetails visible={visible} />}
    </>
  );
};

export default memo(HourlyBody);
