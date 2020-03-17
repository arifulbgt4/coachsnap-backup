import React from 'react';
import Drawer from 'antd/lib/drawer';
import 'antd/lib/drawer/style';
import { useSelector, useDispatch } from 'react-redux';

import { setSession } from 'src/state/ducks/session/actions';
import { toggleSessionDrawer } from 'src/state/ducks/ui/actions';
import useModalVisible from 'src/hooks/useModalVisible';
import DrawerTitle from '../../DrawerTitle';

import SessionForm from '../../SessionForm';

const moment = require('custom-moment');

const DrawerForm = () => {
  const selectedSession = useSelector(store => store.sessionState.session);
  const sessionDrawer = useSelector(store => store.uiState.sessionDrawer);
  const dispatch = useDispatch();

  const existingStart =
    selectedSession.availability && selectedSession.availability.start;
  const startTime = moment(existingStart);

  if (!existingStart) {
    // if the time is current time, round it
    const min = startTime.minute();
    if (min % 15) {
      startTime.add(15 - (min % 15), 'minutes');
    }
  }

  const closeDrawer = () => {
    dispatch(setSession({}));
    dispatch(toggleSessionDrawer(false));
  };

  return (
    <>
      {sessionDrawer && (
        <Drawer
          title={<DrawerTitle close={closeDrawer} title="Edit session" />}
          width={750}
          visible={!!selectedSession.id}
          closable={false}
          bodyStyle={{ paddingRight: 0 }}
          onClose={closeDrawer}
        >
          <SessionForm
            cancel={closeDrawer}
            formType="update"
            dispatcherType="update"
            createdFrom="drawer"
            height={150}
          />
        </Drawer>
      )}
    </>
  );
};

export default DrawerForm;
