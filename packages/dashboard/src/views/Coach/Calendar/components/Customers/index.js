// External Components
import React, { useState } from 'react';
import Button from 'antd/lib/button';
import List from 'antd/lib/list';
import Avatar from 'antd/lib/avatar';
import Empty from 'antd/lib/empty';
import message from 'antd/lib/message';
import User from '@ant-design/icons-svg/lib/asn/UserOutlined';
import Delete from '@ant-design/icons-svg/lib/asn/DeleteOutlined';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useMutation } from 'react-apollo';
import { useSelector, useDispatch } from 'react-redux';

// Own global components
import Icon from 'src/components/Icon';
import ItemDelete from 'src/components/ItemDelete';
import useModalVisible from 'src/hooks/useModalVisible';
import formatError from 'src/utils/format-error';
import { setSession } from 'src/state/ducks/session/actions';
import { formatTime } from 'src/utils/date';

// Data components
import { UPDATE_CUSTOMER } from 'src/resolvers/user/mutation';
import {
  CREATE_BOOKING,
  REMOVE_ATTENDEE,
} from 'src/resolvers/booking/mutation';
// Own single components
import CustomerForm from '../../../CustomerForm';

// Library Style
import 'antd/lib/button/style';
import 'antd/lib/list/style';
import 'antd/lib/avatar/style';
import 'antd/lib/empty/style';
import 'antd/lib/message/style';

// Own Style
import './style.less';
import moment from 'moment';

const SessionCustomer = () => {
  // Local state
  const [formOpen, setFormOpen] = useState(false);
  const [customer, setCustomer] = useState([]);

  // Modals visible state
  const [visible, open, close] = useModalVisible(false);

  // Redux state
  const session = useSelector(state => state.sessionState.session);

  const { maxSeats, bookings, id } = session;

  // Redux action
  const dispatch = useDispatch();

  // Customer create mutation
  const [assignUserToSession] = useMutation(CREATE_BOOKING, {
    variables: { sessionId: id },
    update: (cache, res) => {
      const newBookings = [...session.bookings, res.data.createBooking];
      dispatch(setSession({ ...session, bookings: newBookings }));
    },
  });

  // Customer update mutation
  const [updateCustomer] = useMutation(UPDATE_CUSTOMER, {
    update: (cache, res) => {
      const newCustomer = res.data.updateCustomer;
      const index = session.bookings.findIndex(
        b => b.customer.id === newCustomer.id
      );
      session.bookings[index] = { ...bookings[index], customer: newCustomer };
      dispatch(setSession(session));
    },
  });

  // Customer remove mutation
  const [removeAttendee] = useMutation(REMOVE_ATTENDEE);

  // Customer remove function
  const onRemoveAttendee = async customerId => {
    try {
      const { data } = await removeAttendee({
        variables: {
          customerId,
          sessionId: id,
        },
      });
      const newBookings = session.bookings.filter(
        b => b.id !== data.removeAttendee.id
      );
      dispatch(setSession({ ...session, bookings: newBookings }));
    } catch (error) {
      message.error(formatError(error));
    }
  };

  // Customer create function
  function handelCreate(e) {
    open(e);
    setFormOpen(false);
  }

  // Customer update function
  function handelUpdate(e, data) {
    setCustomer(data);
    open(e);
    setFormOpen(true);
  }

  return (
    <div className="session-customer">
      {!visible ? (
        <>
          {/* Attendee create button */}
          <div className="se-header">
            <h4>
              Attendees ({bookings.length}/{maxSeats})
            </h4>
            <Button onClick={e => handelCreate(e)} className="add-btn">
              + Add
            </Button>
          </div>

          {!bookings.length ? (
            // Have no attende
            <Empty description="No attendees" />
          ) : (
            <PerfectScrollbar style={{ maxHeight: 300 }}>
              <List
                size="small"
                bordered={false}
                dataSource={bookings}
                renderItem={item => (
                  <List.Item
                    style={{ cursor: 'pointer', padding: '8px 10px' }}
                    actions={[
                      // Attendee delete button
                      <ItemDelete
                        text="Attendee"
                        submitDelete={async () =>
                          onRemoveAttendee(item.customer.id)
                        }
                      >
                        <Button type="danger">
                          <Icon type={Delete} />
                        </Button>
                      </ItemDelete>,
                    ]}
                  >
                    <List.Item.Meta
                      onClick={e => handelUpdate(e, item.customer)}
                      avatar={
                        <Avatar>
                          <Icon type={User} />
                        </Avatar>
                      }
                      title={item.customer.name}
                      description={
                        session.singleEvent ? '' : formatTime(item.timeSlot)
                      }
                    />
                  </List.Item>
                )}
              />
            </PerfectScrollbar>
          )}
        </>
      ) : (
        // Customer update & create form
        <CustomerForm
          handleOk={close}
          dispatch={formOpen ? updateCustomer : assignUserToSession}
          initial={customer}
          formType="calendar"
          action={formOpen ? 'update' : 'create'}
        />
      )}
    </div>
  );
};

export default SessionCustomer;
