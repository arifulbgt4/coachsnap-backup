// External Components
import React, { memo } from 'react';
import Col from 'antd/lib/col';
import classnames from 'classnames';
import { useApolloClient } from '@apollo/react-hooks';
import { useSelector, useDispatch } from 'react-redux';

// Own global components
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

const DateBox = props => {
  const { isCurrentMont, number, select, date, data: res } = props;

  const sessionModal = useSelector(state => state.uiState.sessionModal);

  // Redux action
  const dispatch = useDispatch();

  // Modals visible state
  const [status, open, close, cancel] = useModalVisible(false);
  const [visible, openDetails] = useModalVisible(false);

  const curentDate = date.clone().format('YYYY/MM/DD');
  const sessionData = [];

  // Filter session for each day
  res?.getCoachSessions.sessions.map(d => {
    const { start } = d.availability;
    const sDate = moment(start)
      // .tz(user.timezone)
      .format('YYYY/MM/DD');
    if (sDate === curentDate) {
      sessionData.push(d);
    }
  });

  // Session details function
  function sessionDetails(e, data) {
    e.stopPropagation();
    dispatch(setSession(data));
    dispatch(toggleSessionModal(curentDate));
    openDetails(e);
  }

  return (
    <>
      <Col
        onClick={e => open(e)}
        className={classnames('date-col', {
          disabled: !isCurrentMont,
          selected: select,
        })}
      >
        <span className="number">{number}</span>
        <span className="bg">{number}</span>

        {/* Session list */}
        {sessionData.length
          ? sessionData.map(obj => (
              <SessionBadge
                key={obj.id}
                data={obj}
                onClick={e => sessionDetails(e, obj)}
                {...obj}
              />
            ))
          : ''}
      </Col>

      {/* Session create modal */}
      <CreateSession
        visible={status}
        close={close}
        cancel={cancel}
        sessionDuration={15}
        curentDate={curentDate}
      />

      {/* Session details modal */}
      {sessionModal === curentDate && <SessionDetails visible={visible} />}
    </>
  );
};

export default memo(DateBox);
