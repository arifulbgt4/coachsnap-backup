// External Components
import React from 'react';
import Modal from 'antd/lib/modal';
import Menu from 'antd/lib/menu';
import Dropdown from 'antd/lib/dropdown';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import menu from '@ant-design/icons-svg/lib/asn/MenuOutlined';
import { useMutation } from '@apollo/react-hooks';
import { connect } from 'react-redux';

// Own global components
import Icon from 'src/components/Icon';
import ItemDelete from 'src/components/ItemDelete';
import { setSession } from 'src/state/ducks/session/actions';
import { setSessionType } from 'src/state/ducks/session-type/actions';
import { toggleSessionModal } from 'src/state/ducks/ui/actions';
import formatError from 'src/utils/format-error';
import useModalVisible from 'src/hooks/useModalVisible';
import moment from 'custom-moment';

// Data components
import { DELETE_SESSION } from 'src/resolvers/session/mutation';
import { COACH_SESSIONS } from 'src/resolvers/session/query';
import { concatTimeWithDate } from 'src/utils/date';

// Own single components
import UpdateSession from '../UpdateSession';
import Customers from '../Customers';

// Library Style
import 'antd/lib/modal/style';
import 'antd/lib/menu/style';
import 'antd/lib/dropdown/style';
import 'antd/lib/message/style';
import 'antd/lib/button/style';

// Own Style
import './style.less';

const SessionDetails = props => {
  const {
    session: {
      id,
      name,
      bookings,
      maxSeats,
      availability: { start, end },
      businessHour,
      singleEvent,
    },
    user,
    visible,
  } = props;
  const [editStatus, editOpen, editClose] = useModalVisible(false);

  const closeModal = () => {
    props.toggleSessionModal(false);
    props.setSession({});
    props.setSessionType({});
  };

  const [deleteSession] = useMutation(DELETE_SESSION, {
    update: (cache, response) => {
      const query = {
        query: COACH_SESSIONS,
        variables: { where: { coach: { id: user.id } } },
      };
      const { getCoachSessions } = cache.readQuery(query);
      cache.writeQuery({
        ...query,
        data: {
          getCoachSessions: {
            ...getCoachSessions,
            count: getCoachSessions.count - 1,
            sessions: getCoachSessions.sessions.filter(
              s => s.id !== response.data.deleteSession.id
            ),
          },
        },
      });
    },
  });
  const submitDelete = async () => {
    try {
      await deleteSession({ variables: { id } });
      closeModal();
    } catch (error) {
      throw error;
    }
  };

  const menuOptions = (
    <Menu>
      <Menu.Item className="modal-opener-li" key="0">
        <span className="modal-opener" role="button" onClick={e => editOpen(e)}>
          Edit
        </span>
      </Menu.Item>

      <Menu.Item key="1">
        <ItemDelete text="Session" submitDelete={async () => submitDelete()}>
          Delete
        </ItemDelete>
      </Menu.Item>
    </Menu>
  );
  return (
    <Modal
      title={name}
      visible={visible}
      onOk={closeModal}
      onCancel={closeModal}
      footer={null}
      bodyStyle={{ padding: 0 }}
      width={750}
    >
      {!editStatus ? (
        <>
          <div className="session-header">
            <div className="contents">
              <p>
                {bookings.length}/{maxSeats} ⚫ {name}
              </p>
              {singleEvent ? (
                <>
                  <p>{`${moment(start).format('ddd MMM DD')},  ${moment(
                    start
                  ).format('h:mm a')} - ${moment(end).format('h:mm a')}`}</p>
                  <p>Single event</p>
                </>
              ) : (
                <>
                  <p>{`${moment(
                    concatTimeWithDate(start, businessHour.start)
                  ).format('ddd MMM DD')},  ${moment(start).format(
                    'h:mm a'
                  )} - ${moment(
                    concatTimeWithDate(end, businessHour.end)
                  ).format('h:mm a')}`}</p>
                  <p>Block event</p>
                </>
              )}
            </div>
            <div className="drop-down">
              <Dropdown
                placement="bottomRight"
                overlay={menuOptions}
                trigger={['click']}
              >
                <Button size="small">
                  <Icon type={menu} />
                </Button>
              </Dropdown>
            </div>
          </div>
          <Customers />
        </>
      ) : (
        <UpdateSession handleOk={editClose} cancel={editClose} />
      )}
    </Modal>
  );
};

const mapStateToProps = state => ({
  user: state.authState.user,
  session: state.sessionState.session,
});

export default connect(mapStateToProps, {
  setSession,
  toggleSessionModal,
  setSessionType,
})(SessionDetails);
