import React, { useEffect } from 'react';
import moment from 'custom-moment';
import Form from 'antd/lib/form';
import 'antd/lib/form/style';
import Select from 'antd/lib/select';
import 'antd/lib/select/style';
import Input from 'antd/lib/input';
import 'antd/lib/input/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import message from 'antd/lib/message';
import 'antd/lib/message/style';
import { useForm } from 'sunflower-antd';
import { useLazyQuery } from 'react-apollo';
import { useSelector } from 'react-redux';

import formRules from 'src/utils/form-rules';
import './style.less';
import formatError from 'src/utils/format-error';
import ButtonLoading from 'src/components/ButtonLoading';
import { AVAILABLE_TIMES } from 'src/resolvers/booking/query';
import hasSpeacialChars from 'src/utils/hasSpeacialChars';

const { Option } = Select;

export default Form.create({ name: 'coordinated' })(
  ({ handleOk, dispatch, initial, form, formType, action }) => {
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { sm: { span: 24 }, md: { span: 6 } },
      wrapperCol: { sm: { span: 24 }, md: { span: 10 } },
    };
    const session = useSelector(state => state.sessionState.session);

    // Get available times
    const [
      getAvailableTimes,
      { data: { availableTimes } = { availableTimes: [] }, loading },
    ] = useLazyQuery(AVAILABLE_TIMES, { fetchPolicy: 'no-cache' });

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

    const { formProps, formLoading } = useForm({
      form,
      async submit(value) {
        const data = { ...value };
        try {
          if (action === 'update') {
            await dispatch({ variables: { ...initial, ...data } });
            message.success('Customer updated successfully.');
          }
          if (action === 'create') {
            if (formType === 'calendar') {
              delete data.timeSlot;
              await dispatch({
                variables: { userData: data, timeSlot: value.timeSlot },
              });
            }
            if (formType === 'customer') {
              await dispatch({ variables: data });
            }
            message.success('Customer created successfully.');
          }
          form.resetFields();
          handleOk();
        } catch (error) {
          message.error(formatError(error));
        }
      },
    });

    return (
      <Form
        className={`customer-form ${action}`}
        {...formItemLayout}
        {...formProps}
      >
        <Form.Item label="Name" hasFeedback>
          {getFieldDecorator('name', {
            initialValue: initial?.name,
            ...formRules.name,
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (value && hasSpeacialChars(value)) {
                    callback('Name should not contain speacial chars');
                    return;
                  }
                  callback();
                },
              },
            ],
          })(<Input name="name" placeholder="Enter Full Name" />)}
        </Form.Item>
        <Form.Item label="Email" hasFeedback>
          {getFieldDecorator('email', {
            initialValue: initial?.email || '',
            ...formRules.email,
          })(<Input type="email" name="email" placeholder="Your Email" />)}
        </Form.Item>
        {!session.singleEvent && (
          <>
            {formType === 'calendar' && action !== 'update' && (
              <Form.Item label="Time slot" hasFeedback>
                {getFieldDecorator('timeSlot', {
                  rules: [
                    {
                      required: true,
                      message: 'Please select a time slot',
                    },
                  ],
                })(
                  <Select placeholder="Select a time slot" loading={loading}>
                    {availableTimes.map(option => (
                      <Option key={option[0]} value={option[0]}>
                        {moment(option[0], 'hh:mm').format('hh:mm a')}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            )}
          </>
        )}
        <Form.Item
          wrapperCol={{ sm: { span: 24 }, md: { span: 14, offset: 6 } }}
        >
          <Button type="primary" htmlType="submit">
            {formLoading && <ButtonLoading />}
            Save
          </Button>

          <Button style={{ marginLeft: 8 }} onClick={handleOk}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    );
  }
);
