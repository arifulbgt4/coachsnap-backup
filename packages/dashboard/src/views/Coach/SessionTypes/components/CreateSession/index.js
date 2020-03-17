import React from 'react';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Drawer from 'antd/lib/drawer';
import 'antd/lib/drawer/style';
import Plus from '@ant-design/icons-svg/lib/asn/PlusOutlined';
import Icon from 'src/components/Icon';
import { useSelector, connect } from 'react-redux';

import DrawerTitle from '../../../../../components/DrawerTitle';
import SessionForm from '../../../../../components/SessionForm';

const moment = require('custom-moment');

const CreateSession = ({
  visible,
  open,
  close,
  cancel,
  sessionTypeId,
  pointer,
  user,
}) => {
  const sessionType = useSelector(store => store.sessionTypeState.sessionType);

  const momentTime = moment()
    .tz(user.timezone)
    .clone();
  const min = momentTime.minute();
  if (min % 15) {
    momentTime.add(15 - (min % 15), 'minutes');
  }
  const startTime = momentTime.format('HH:mm:ss');
  const endTime = momentTime.format('HH:mm:ss');
  const curentDate = moment()
    .clone()
    .format('YYYY/MM/DD');

  const sessionObj = {
    cost: sessionType.cost,
    name: sessionType.name,
    description: sessionType.description,
    location: '',
    link: '',
    duration: sessionType.duration,
    maxSeats: sessionType.maxSeats,
    date: moment(curentDate, 'YYYY/MM/DD'),
    startTime: moment(startTime, 'HH:mm:ss'),
    endTime: moment(endTime, 'HH:mm:ss'),
    id: sessionTypeId && sessionTypeId,
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        width: '100%',
        padding: '10px 16px',
        textAlign: 'right',
        left: 0,
      }}
    >
      {pointer ? (
        <Button type="primary" size="small" onClick={e => open(e)}>
          <Icon type={Plus} />
        </Button>
      ) : (
        <div
          style={{
            position: 'absolute',
            top: 0,
            width: '100%',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
          }}
        >
          <Button type="primary" onClick={e => open(e)}>
            <Icon type={Plus} />
          </Button>
        </div>
      )}

      <Drawer
        title={<DrawerTitle close={cancel} title="Create new session" />}
        width={750}
        closable={false}
        onClose={close}
        visible={visible}
        bodyStyle={{ paddingRight: 0 }}
        destroyOnClose
      >
        <SessionForm
          cancel={cancel}
          formType="create"
          initial={sessionObj}
          createdFrom="drawer"
          height={150}
        />
      </Drawer>
    </div>
  );
};

const mapStateToProps = state => ({
  user: state.authState.user,
});
export default connect(mapStateToProps)(CreateSession);
