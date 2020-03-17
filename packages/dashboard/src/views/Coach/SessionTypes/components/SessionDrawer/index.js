import React, { useEffect } from 'react';
import { useQuery } from 'react-apollo';
import { useSelector, useDispatch } from 'react-redux';
import Drawer from 'antd/lib/drawer';
import 'antd/lib/drawer/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Empty from 'antd/lib/empty';
import 'antd/lib/empty/style';
import Skeleton from 'antd/lib/skeleton';
import 'antd/lib/skeleton/style';

import SessionList from 'src/components/SessionList';
import useModalVisible from 'src/hooks/useModalVisible';
import { SESSIONS } from 'src/resolvers/session/query';

import { setSession } from 'src/state/ducks/session/actions';
import { setSessionType } from 'src/state/ducks/session-type/actions';

import CreateSession from '../CreateSession';
import './style.less';

const SessionDrawer = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const sessionType = useSelector(state => state.sessionTypeState.sessionType);
  const activityState = useSelector(state => state.uiState.activity);

  const { data: sessions, loading, refetch } = useQuery(SESSIONS, {
    variables: { sessionTypeId: sessionType.id },
  });

  useEffect(() => {
    const { type } = activityState;
    if (type === 'SESSION') {
      refetch({
        variables: { sessionTypeId: sessionType.id },
      });
    }
  }, [refetch, sessionType.id, activityState]);

  const [status, open, close, cancel] = useModalVisible(false);

  const data = sessions ? sessions.sessions.sessions : [];
  return (
    <Drawer
      title={`Sessions ${data.length > 0 ? `(${data.length})` : ''}`}
      width={460}
      closable={false}
      onClose={() => {
        dispatch(setSession({}));
        dispatch(setSessionType({}));
        onClose();
      }}
      visible={visible}
      bodyStyle={{ padding: 0 }}
      destroyOnClose
    >
      {data.length > 0 ? (
        <SessionList sessions={data} height={110} />
      ) : (
        <Empty />
      )}
      {loading && (
        <div style={{ padding: 15 }}>
          <Skeleton active paragraph={{ rows: 1 }} avatar />
        </div>
      )}
      <CreateSession
        open={open}
        visible={status}
        close={() => {
          dispatch(setSession({}));
          close();
        }}
        cancel={() => {
          dispatch(setSession({}));
          cancel();
        }}
        sessionTypeId={sessionType.id}
        pointer
      />
      <div className="session-list-footer">
        <Button
          style={{
            marginRight: 8,
          }}
          onClick={() => {
            dispatch(setSession({}));
            dispatch(setSessionType({}));
            onClose();
          }}
        >
          Cancel
        </Button>
      </div>
    </Drawer>
  );
};

export default SessionDrawer;
