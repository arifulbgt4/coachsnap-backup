import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import List from 'antd/lib/list';
import 'antd/lib/list/style';
import Avatar from 'antd/lib/avatar';
import 'antd/lib/avatar/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Delete from '@ant-design/icons-svg/lib/asn/DeleteOutlined';
import message from 'antd/lib/message';
import Calendar from '@ant-design/icons-svg/lib/asn/CalendarOutlined';
import { useMutation } from '@apollo/react-hooks';
import { useWindowSize } from '@reach/window-size';

import Icon from 'src/components/Icon';
import ScrollDiv from 'src/components/ScrollDiv';
import ItemDelete from 'src/components/ItemDelete';
import { DELETE_SESSION_TYPES } from 'src/resolvers/session-types/mutation';
import { SESSION_TYPES } from 'src/resolvers/session-types/query';
import formatError from 'src/utils/format-error';
import useModalVisible from 'src/hooks/useModalVisible';
import { setSessionType } from 'src/state/ducks/session-type/actions';
import SessionTypeEdit from '../EditSessionType';
import SessionDrawer from '../SessionDrawer';

import './style.less';

const SessionTypeList = ({ dataSource }) => {
  const { width: windowWidth } = useWindowSize();
  const sessionType = useSelector(state => state.sessionTypeState.sessionType);
  const [visible, open, close] = useModalVisible(false);
  const userID = useSelector(store => store.authState.user.id);

  const dispatch = useDispatch();

  const [deleteSession, { loading }] = useMutation(DELETE_SESSION_TYPES, {
    update: (cache, { data }) => {
      const query = {
        query: SESSION_TYPES,
        variables: { coachId: userID },
      };

      const { sessionTypes } = cache.readQuery(query);

      cache.writeQuery({
        ...query,
        data: {
          sessionTypes: {
            count: sessionTypes.count - 1,
            sessionTypes: sessionTypes.sessionTypes.filter(
              session => session.id !== data.deleteSessionType.id
            ),
            __typename: 'SessionTypesList',
          },
        },
      });
    },
  });

  async function submitDelete(id) {
    try {
      await deleteSession({ variables: { id } });
    } catch (error) {
      message.error(formatError(error));
    }
  }

  function handleSession(e, d) {
    open(e);
    dispatch(setSessionType(d));
  }

  return (
    <ScrollDiv height={226} auto>
      <List
        dataSource={dataSource}
        size="small"
        className="session-type-list"
        renderItem={item => (
          <List.Item
            actions={[
              <SessionTypeEdit data={item} />,
              <ItemDelete
                text="Session Type"
                submitDelete={() => submitDelete(item.id)}
              >
                <Button
                  size={windowWidth > 575 ? 'default' : 'small'}
                  type="danger"
                  loading={loading}
                >
                  <Icon type={Delete} />
                </Button>
              </ItemDelete>,
            ]}
          >
            <List.Item.Meta
              onClick={e => handleSession(e, item)}
              style={{ cursor: 'pointer' }}
              avatar={
                <Avatar
                  style={{ background: '#7265e6' }}
                  size={windowWidth > 575 ? 48 : 30}
                >
                  <Icon type={Calendar} />
                </Avatar>
              }
              title={item.name}
              description={
                item.description ? item.description : 'No Description'
              }
            />
            {item.cost && <span className="cost">${item.cost}</span>}
          </List.Item>
        )}
      />

      {sessionType.id && (
        <SessionDrawer
          sessionType={sessionType}
          visible={visible}
          onClose={close}
        />
      )}
    </ScrollDiv>
  );
};

export default SessionTypeList;
