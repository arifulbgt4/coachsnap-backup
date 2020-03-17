// External Components
import React from 'react';
import Modal from 'antd/lib/modal';
import { useSelector, useDispatch } from 'react-redux';

// Own global components
import { setSessionType } from 'src/state/ducks/session-type/actions';
import { setSession } from 'src/state/ducks/session/actions';

// Own single components
import SessionForm from '../../../../../components/SessionForm';

// Library Style
import 'antd/lib/modal/style';

// Own Style
import './style.less';

const moment = require('custom-moment');

const CreateSession = ({
  visible,
  close,
  cancel,
  sessionDuration,
  curentDate,
  calendarType,
  initialTime,
}) => {
  // Redux state
  const sessionType = useSelector(store => store.sessionTypeState.sessionType);
  const user = useSelector(store => store.authState.user);

  // Redux action
  const dispatch = useDispatch();

  const momentTime = moment()
    .tz(user.timezone)
    .clone();
  const endTime = momentTime.format('HH:mm:ss');

  // Initial session object
  const sessionObj = {
    cost: sessionType.cost,
    name: sessionType.name,
    description: sessionType.description,
    location: '',
    link: '',
    recurring: 0,
    duration: sessionDuration,
    maxSeats: '1',
    date: moment(curentDate, 'YYYY/MM/DD'),
    startTime: initialTime,
    endTime: moment(endTime, 'HH:mm:ss'),
    id: sessionType.id,
  };

  // Session form cleanup
  const cleanup = (fn, ...e) => {
    dispatch(setSessionType({}));
    dispatch(setSession({}));
    fn(...e);
  };

  return (
    <Modal
      title="Create session"
      width={750}
      closable
      visible={visible}
      onOk={e => cleanup(close, e)}
      onCancel={e => cleanup(cancel, e)}
      footer={null}
      bodyStyle={{ paddingBottom: '50px' }}
      className="session-create-calendar"
      destroyOnClose
    >
      {/* Form of create session */}
      <SessionForm
        createdFrom="calendar"
        cancel={e => cleanup(cancel, e)}
        formType="create"
        calendarType={calendarType}
        height={0}
        initial={sessionObj}
      />
    </Modal>
  );
};

export default CreateSession;
