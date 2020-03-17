import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import message from 'antd/lib/message';
import { useForm } from 'sunflower-antd';
import { useMutation, useQuery } from 'react-apollo';
import moment from 'custom-moment';

import ButtonLoading from 'src/components/ButtonLoading';
import { AVAILABLE_TIMES } from 'src/resolvers/booking/query';
import { UPDATE_BOOKING } from 'src/resolvers/booking/mutation';
import formatError from 'src/utils/format-error';

import 'antd/lib/row/style';
import 'antd/lib/button/style';
import 'antd/lib/form/style';
import 'antd/lib/spin/style';
import 'antd/lib/select/style';
import 'antd/lib/col/style';
import 'antd/lib/message/style';

const formItemLayout = {
  labelCol: {
    md: { span: 5 },
    xl: { span: 24 },
  },
  wrapperCol: {
    md: { span: 19 },
    xl: { span: 24 },
  },
};

const { Option } = Select;

const ChangeTimeSlot = props => {
  const {
    form,
    session: { id, availability, singleEvent },
    timeSlot,
  } = props;
  const { getFieldDecorator } = form;

  const [updateBooking] = useMutation(UPDATE_BOOKING);

  const {
    data: { availableTimes } = { availableTimes: [] },
    loading,
  } = useQuery(AVAILABLE_TIMES, {
    variables: {
      sessionId: id,
      date: moment((availability && availability.start) || new Date()).format(
        'DD/MM/YYYY'
      ),
    },
    fetchPolicy: 'no-cache',
  });

  const { formProps, formLoading } = useForm({
    form,
    async submit(variables) {
      try {
        await updateBooking({
          variables: {
            id: props.id,
            data: variables,
          },
        });
        message.success('Booking time slot changed');
      } catch (error) {
        message.error(formatError(error));
      }
    },
    defaultFormValues() {
      return {
        ...(!singleEvent && {
          timeSlot: moment(timeSlot, 'hh:mm').format('hh:mm a'),
        }),
      };
    },
  });

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Form {...formProps} {...formItemLayout}>
          <Form.Item
            label="Select time"
            hasFeedback
            extra={singleEvent && 'This session is a single event'}
          >
            {getFieldDecorator('timeSlot', {
              rules: [
                {
                  required: true,
                  message: 'Please select a time slot',
                },
              ],
            })(
              <Select placeholder="Select a time slot" disabled={singleEvent}>
                {availableTimes.map(option => (
                  <Option key={option[0]} value={option[0]}>
                    {moment(option[0], 'hh:mm').format('hh:mm a')}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Row>
            <Col
              md={{ span: 6, offset: 5 }}
              lg={{ span: 6, offset: 5 }}
              xl={{ span: 6, offset: 0 }}
            >
              <Button type="primary" htmlType="submit" disabled={singleEvent}>
                {formLoading && <ButtonLoading />}
                Update
              </Button>
            </Col>
          </Row>
        </Form>
      </Col>
    </Row>
  );
};

export default Form.create({ name: 'edit-profile' })(ChangeTimeSlot);
