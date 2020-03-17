import React, { useState, useEffect } from 'react';
import moment from 'custom-moment';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Form from 'antd/lib/form';
import 'antd/lib/form/style';
import Input from 'antd/lib/input';
import 'antd/lib/input/style';
import Select from 'antd/lib/select';
import 'antd/lib/select/style';
import message from 'antd/lib/message';
import 'antd/lib/message/style';

import { useForm } from 'sunflower-antd';
import { useMutation, useQuery } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { Elements, StripeProvider } from 'react-stripe-elements';
import { connect } from 'react-redux';

import formatError from 'src/utils/format-error';
import { CREATE_BOOKING } from 'src/resolvers/booking/mutation';
import { AVAILABLE_TIMES } from 'src/resolvers/booking/query';

import ButtonLoading from 'src/components/ButtonLoading';
import { setBooking } from 'src/state/ducks/customer/actions';
import hasSpeacialChars from 'src/utils/hasSpeacialChars';
import { concatTimeWithDate } from 'src/utils/date';

import CheckoutForm from '../CheckoutForm';

import './style.less';

const { mockTimezoneGuess } = require('custom-moment/utils');

const formItemLayout = {
  labelCol: {
    xl: { span: 5 },
    lg: { span: 5 },
    md: { span: 4 },
    sm: { span: 24 },
  },
  wrapperCol: {
    xl: { span: 19 },
    lg: { span: 19 },
    md: { span: 20 },
    sm: { span: 24 },
  },
};

const { Option } = Select;

const BookForm = ({
  data: {
    session: { id, coach, availability, singleEvent },
  },
  form,
  history,
  setBooking,
}) => {
  const [token, useToken] = useState(null);
  const [createBooking] = useMutation(CREATE_BOOKING);

  const formatAvailTime = time => {
    return mockTimezoneGuess(
      concatTimeWithDate(availability.start, time),
      coach.timezone
    ).format('hh:mm a');
  };

  const {
    data: { availableTimes } = { availableTimes: [] },
    loading,
  } = useQuery(AVAILABLE_TIMES, {
    variables: {
      sessionId: id,
      coachId: coach.id,
      date: moment((availability && availability.start) || new Date()).format(
        'DD/MM/YYYY'
      ),
    },
    fetchPolicy: 'no-cache',
  });
  const { getFieldDecorator } = form;

  /**
   * Effects
   */

  useEffect(() => {
    setBooking(true);
  }, [setBooking]);

  const onCardDataChange = newToken => {
    if (newToken) {
      useToken(newToken);
    }
  };

  const { formProps, formLoading } = useForm({
    form,
    async submit(variables) {
      const data = { ...variables };
      data.email = variables.email.toLowerCase();
      delete data.timeSlot;
      if (coach.stripeAccount && !token) {
        return;
      }
      try {
        const input = {
          userData: { ...data },
          token,
          ...(!singleEvent && {
            timeSlot: variables.timeSlot,
          }),
          sessionId: id,
        };
        const {
          data: { createBooking: res },
        } = await createBooking({ variables: input });
        history.push(
          `/public/c/${res.session.coach.username}/s/${res.session.id}/b/${res.id}`
        );
      } catch (error) {
        message.error(formatError(error));
      }
    },
  });

  return (
    <Card title="Enter your details to reserve a spot">
      <Form className="session-booking-form" {...formItemLayout} {...formProps}>
        <Form.Item label="Name" hasFeedback>
          {getFieldDecorator('name', {
            rules: [
              { required: true, message: 'Please enter your name!' },
              {
                validator: (rule, value, callback) => {
                  if (hasSpeacialChars(value)) {
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
            rules: [
              {
                required: true,
                message: 'Please enter a valid email',
              },
            ],
          })(<Input type="email" name="email" placeholder="Your Email" />)}
        </Form.Item>
        {!singleEvent && (
          <Form.Item label="Select time" hasFeedback>
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
                    {formatAvailTime(option[0])}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
        )}

        {coach.stripeAccount && (
          <Form.Item
            wrapperCol={{
              xl: { span: 19, offset: 5 },
              lg: { span: 19, offset: 5 },
              md: { span: 20, offset: 4 },
              sm: { span: 24 },
            }}
          >
            <StripeProvider apiKey={coach.stripeAccount.stripe_publishable_key}>
              <Elements>
                <CheckoutForm onChange={onCardDataChange} />
              </Elements>
            </StripeProvider>
          </Form.Item>
        )}

        <Form.Item
          wrapperCol={{
            xl: { span: 19, offset: 5 },
            lg: { span: 19, offset: 5 },
            md: { span: 20, offset: 4 },
            sm: { span: 24 },
          }}
        >
          <Button type="primary" htmlType="submit">
            {formLoading && <ButtonLoading />}
            Reserve Your Spot
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

const WrappedBookForm = Form.create({ name: 'booking-form' })(BookForm);

export default withRouter(connect(null, { setBooking })(WrappedBookForm));
