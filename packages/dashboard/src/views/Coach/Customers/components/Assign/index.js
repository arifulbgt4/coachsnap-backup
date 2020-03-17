import React, { useState, useEffect } from 'react';
import moment from 'custom-moment';
import { useQuery, useMutation, useLazyQuery } from 'react-apollo';
import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Form from 'antd/lib/form';
import 'antd/lib/form/style';
import Select from 'antd/lib/select';
import 'antd/lib/select/style';
import message from 'antd/lib/message';
import 'antd/lib/message/style';
import { useSelector, useDispatch } from 'react-redux';
import UserAdd from '@ant-design/icons-svg/lib/asn/UserAddOutlined';

import Icon from 'src/components/Icon';
import { SESSION_TYPES } from 'src/resolvers/session-types/query';
import { SESSIONS } from 'src/resolvers/session/query';
import { CREATE_BOOKING } from 'src/resolvers/booking/mutation';
import {
  BOOKINGS_BY_CUSTOMER,
  AVAILABLE_TIMES,
} from 'src/resolvers/booking/query';

import formatError from 'src/utils/format-error';
import Alert from 'src/components/Alert';
import Fallback from 'src/components/Fallback';
import useModalVisible from 'src/hooks/useModalVisible';
import SessionTypeForm from 'src/views/Coach/SessionTypes/components/SessionTypeForm';
import SessionForm from 'src/components/SessionForm';
import { setSessionType } from 'src/state/ducks/session-type/actions';
import { setSession } from 'src/state/ducks/session/actions';
import { toggleAssignModal } from 'src/state/ducks/ui/actions';

import './style.less';
import SingleSession from 'src/components/SingleSession';

const { Option } = Select;

const AssignSession = ({ form }) => {
  const sessionTypeObj = {
    name: null,
    cost: null,
    duration: 15,
    maxSeats: 1,
    description: null,
  };
  const { getFieldDecorator, setFieldsValue } = form;

  const {
    sessionTypeState: { sessionType },
    sessionState: { session },
    authState: { user },
    customerState: { customer },
    uiState: { showAssignModal },
  } = useSelector(state => state);

  const dispatch = useDispatch();

  const [error, setError] = useState(null);

  const [visibleSessionType, open, close, cancelModal] = useModalVisible(false);
  const [visibleSession, openSession, cancelSession] = useModalVisible(false);

  const { data, loading } = useQuery(SESSION_TYPES, {
    variables: { coachId: user.id },
  });
  const [getSessions, { data: sessionsData }] = useLazyQuery(SESSIONS);
  const [
    getAvailableTimes,
    { data: { availableTimes } = { availableTimes: [] } },
  ] = useLazyQuery(AVAILABLE_TIMES, { fetchPolicy: 'no-cache' });
  const [assignUserToSession] = useMutation(CREATE_BOOKING, {
    update: (cache, res) => {
      const query = {
        query: BOOKINGS_BY_CUSTOMER,
        variables: { customerId: customer.id },
      };
      const { bookingsByCustomer } = cache.readQuery(query);
      cache.writeQuery({
        ...query,
        data: {
          bookingsByCustomer: {
            count: bookingsByCustomer.count + 1,
            bookings: [
              ...bookingsByCustomer.bookings,
              { ...res.data.createBooking },
            ],
            __typename: 'BookingList',
          },
        },
      });
    },
  });

  useEffect(() => {
    if (session.id) {
      getAvailableTimes({
        variables: {
          sessionId: session.id,
          date: moment(session.availability.start || new Date()).format(
            'DD/MM/YYYY'
          ),
        },
      });
    }
  }, [getAvailableTimes, session]);

  const closeModal = () => {
    form.resetFields();
    dispatch(setSessionType({}));
    dispatch(toggleAssignModal(false));
  };

  const onChange = async e => {
    await getSessions({ variables: { sessionTypeId: e } });
    dispatch(
      setSessionType(data.sessionTypes.sessionTypes.find(s => s.id === e))
    );
  };

  const onChangeSession = e => {
    dispatch(setSession(sessionsData.sessions.sessions.find(s => s.id === e)));
  };

  const handleSubmit = () => {
    form.validateFields(async (validationError, values) => {
      if (!validationError) {
        const args = { ...values };
        delete args.sessionType;
        try {
          await assignUserToSession({
            variables: { ...args, customerId: customer.id },
          });
          message.success(`${customer.name} is added the session.`);
          closeModal();
        } catch (err) {
          setError(formatError(err));
        }
      }
    });
  };

  useEffect(() => {
    setFieldsValue({
      sessionType: sessionType.id !== 'undefined' ? sessionType.id : '',
      sessionId: undefined,
      timeSlot: undefined,
    });
  }, [sessionType.id, setFieldsValue]);

  useEffect(() => {
    setFieldsValue({
      sessionId: session.id !== 'undefined' ? session.id : '',
      timeSlot: undefined,
    });
  }, [session.id, setFieldsValue]);

  return (
    <div>
      <Button
        onClick={() => dispatch(toggleAssignModal(true))}
        size="large"
        type="link"
        block
      >
        <Icon type={UserAdd} />
      </Button>
      <Modal
        title={`Assign ${customer.name} to a session`}
        className="customer-page-modal"
        visible={showAssignModal}
        onOk={handleSubmit}
        onCancel={closeModal}
        width={750}
      >
        <Form onSubmit={handleSubmit}>
          {error && <Alert type="danger">{error}</Alert>}
          <Form.Item label="Session type" hasFeedback>
            {getFieldDecorator('sessionType', {
              rules: [
                { required: true, message: 'Please select a session type' },
              ],
            })(
              <Select
                placeholder="Select a session type"
                onChange={onChange}
                notFoundContent={loading ? <Fallback /> : null}
              >
                <Option key="create-session-type" value="">
                  <span
                    style={{ display: 'block' }}
                    onClick={e => {
                      dispatch(setSessionType({}));
                      open(e);
                    }}
                  >
                    <b>+</b> Create a new session type
                  </span>
                </Option>
                {data &&
                  data.sessionTypes.sessionTypes.map(s => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>
          {sessionType.id && (
            <Form.Item label="Session" hasFeedback>
              {getFieldDecorator('sessionId', {
                rules: [{ required: true, message: 'Please select a session' }],
              })(
                <Select
                  placeholder="Select a session"
                  notFoundContent={!sessionsData ? <Fallback /> : null}
                  onChange={onChangeSession}
                >
                  <Option key="create-session" value="">
                    <span
                      style={{ display: 'block' }}
                      onClick={e => {
                        dispatch(setSession({}));
                        openSession(e);
                      }}
                    >
                      <b>+</b> Create a new session
                    </span>
                  </Option>
                  {sessionsData &&
                    sessionsData.sessions.sessions.map(s => (
                      <Option key={s.id} value={s.id}>
                        <SingleSession item={s} page="customers" />
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          )}
          {sessionType.id && session.id && !session.singleEvent && (
            <Form.Item label="Time slot" hasFeedback>
              {getFieldDecorator('timeSlot', {
                rules: [
                  {
                    required: true,
                    message: 'Please select a time slot',
                  },
                ],
              })(
                <Select placeholder="Select a time slot">
                  {availableTimes.map(option => (
                    <Option key={option[0]} value={option[0]}>
                      {moment(option[0], 'hh:mm').format('hh:mm a')}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          )}
        </Form>
        <Modal
          title="Create New Session Type"
          visible={visibleSessionType}
          onCancel={cancelModal}
          className="customer-page-modal"
          destroyOnClose
          footer={null}
          width={750}
        >
          <SessionTypeForm
            handleOk={() => {
              close();
            }}
            handleCancel={cancelModal}
            initial={sessionTypeObj}
            visible={visibleSessionType}
            type="create"
          />
        </Modal>
        <Modal
          title="Create New Session"
          visible={visibleSession}
          onCancel={cancelSession}
          bodyStyle={{ padding: 0 }}
          className="customer-page-modal"
          destroyOnClose
          width={750}
        >
          <SessionForm
            cancel={cancelSession}
            formType="create"
            createdFrom="customers"
            height={0}
          />
        </Modal>
      </Modal>
    </div>
  );
};

const WrappedForm = Form.create({ name: 'AssignSession' })(AssignSession);

export default WrappedForm;
