import React from 'react';
import { useSelector, connect } from 'react-redux';
import Form from 'antd/lib/form';
import 'antd/lib/form/style';
import Input from 'antd/lib/input';
import 'antd/lib/input/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import message from 'antd/lib/message';
import 'antd/lib/message/style';
import { useMutation } from '@apollo/react-hooks';
import { useForm } from 'sunflower-antd';

import {
  CREATE_SESSION_TYPES,
  UPDATE_SESSION_TYPES,
} from 'src/resolvers/session-types/mutation';
import { SESSION_TYPES } from 'src/resolvers/session-types/query';
import formatError from 'src/utils/format-error';
import { setSessionType } from 'src/state/ducks/session-type/actions';
import ButtonLoading from 'src/components/ButtonLoading';

import './style.less';

const moment = require('custom-moment');

const { TextArea } = Input;
const formItemLayout = {
  labelCol: { sm: { span: 24 }, md: { span: 6 } },
  wrapperCol: { sm: { span: 24 }, md: { span: 14 } },
};
const format = 'HH:mm';

const formatDataForMutation = (variables, action) => {
  const data = { ...variables };
  if (variables.businessHourStart) {
    data.businessHour[action] = {
      ...data.businessHour[action],
      start: moment(variables.businessHourStart, 'hh:mm a')
        // .tz(user.timezone)
        .format(format),
    };
  }
  if (variables.businessHourEnd) {
    data.businessHour[action] = {
      ...data.businessHour[action],
      end: moment(variables.businessHourEnd, 'hh:mm a')
        // .tz(user.timezone)
        .format(format),
    };
  }
  delete data.businessHourStart;
  delete data.businessHourEnd;
  return {
    ...data,
    maxSeats: parseInt(variables.maxSeats, 10),
    cost: parseInt(variables.cost, 10),
    duration: parseInt(variables.duration, 10),
  };
};

const SessionTypeForm = Form.create({ name: 'coordinated' })(props => {
  const { handleOk, handleCancel, sessionType, form, type, user, page } = props;
  const { getFieldDecorator } = form;

  const userID = useSelector(store => store.authState.user.id);

  const [updateSession] = useMutation(UPDATE_SESSION_TYPES);
  const [createSession] = useMutation(CREATE_SESSION_TYPES, {
    update: (cache, { data }) => {
      const query = {
        query: SESSION_TYPES,
        variables: { coachId: userID },
      };
      if (page === 'calendar') {
        props.setSessionType(data.createSessionType);
      }
      const { sessionTypes } = cache.readQuery(query);

      cache.writeQuery({
        ...query,
        data: {
          sessionTypes: {
            count: sessionTypes.count + 1,
            sessionTypes: [
              ...sessionTypes.sessionTypes,
              { ...data.createSessionType },
            ],
            __typename: 'SessionTypesList',
          },
        },
      });
    },
  });

  const { formProps, formLoading } = useForm({
    form,
    async submit(variables) {
      try {
        const data = formatDataForMutation(variables, type, user);
        if (type === 'create') {
          await createSession({
            variables: { data },
          });
          message.success('Session type created.');
          // Only clear fields after create
          form.resetFields();
        } else {
          await updateSession({
            variables: {
              id: sessionType.id,
              data,
            },
          });
          message.success('Session type updated.');
        }
        // Clear session type from redux
        if (page !== 'calendar') {
          props.setSessionType({});
        }
        handleOk();
      } catch (error) {
        message.error(formatError(error));
      }
    },
  });

  const checkPrice = (rule, value, callback) => {
    if (value && value > 0) {
      callback();
      return;
    }
    callback('price must greater than zero.');
  };

  return (
    <Form className="session-type-form" {...formProps} {...formItemLayout}>
      <Form.Item label="Title" hasFeedback>
        {getFieldDecorator('name', {
          initialValue:
            type !== 'create' && sessionType.name ? sessionType.name : null,
          rules: [{ required: true }],
        })(<Input name="name" placeholder="Enter title" />)}
      </Form.Item>

      <Form.Item label="Description" hasFeedback>
        {getFieldDecorator('description', {
          initialValue:
            type !== 'create' && sessionType.description
              ? sessionType.description
              : null,
        })(<TextArea name="description" rows={3} />)}
      </Form.Item>

      <Form.Item label="Cost($)" hasFeedback>
        {getFieldDecorator('cost', {
          initialValue:
            type !== 'create' && sessionType.cost ? sessionType.cost : null,
          rules: [{ validator: checkPrice, required: true }],
        })(
          <Input type="number" name="cost" placeholder="Cost of each session" />
        )}
      </Form.Item>

      <Form.Item label="Duration (min)" hasFeedback>
        {getFieldDecorator('duration', {
          initialValue:
            type !== 'create' && sessionType.duration
              ? sessionType.duration
              : null,
          rules: [{ required: true }],
        })(
          <Input
            type="number"
            name="duration"
            min="0"
            placeholder="Duration of each session"
          />
        )}
      </Form.Item>

      <Form.Item label="Seats" hasFeedback>
        {getFieldDecorator('maxSeats', {
          initialValue:
            type !== 'create' && sessionType.maxSeats
              ? sessionType.maxSeats
              : null,
          rules: [
            {
              validator: (rule, value, callback) => {
                if (value && value > 0) {
                  callback();
                  return;
                }
                callback('seat must greater than one');
              },
              required: true,
            },
          ],
        })(
          <Input
            type="number"
            name="maxSeats"
            min="0"
            placeholder="Number of seats"
          />
        )}
      </Form.Item>

      <Form.Item wrapperCol={{ sm: { span: 24 }, md: { span: 14, offset: 6 } }}>
        <Button type="primary" htmlType="submit">
          {formLoading && <ButtonLoading />}
          Save
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={handleCancel}>
          Cancel
        </Button>
      </Form.Item>
    </Form>
  );
});

const mapStateToProps = state => ({
  sessionType: state.sessionTypeState.sessionType,
  user: state.authState.user,
});

export default connect(mapStateToProps, { setSessionType })(SessionTypeForm);
