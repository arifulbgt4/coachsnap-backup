import React, { useState } from 'react';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Card from 'antd/lib/card';
import Icon from 'src/components/Icon';
import User from '@ant-design/icons-svg/lib/asn/UserOutlined';
import Mail from '@ant-design/icons-svg/lib/asn/MailOutlined';
import { useMutation } from '@apollo/react-hooks';
import { useForm } from 'sunflower-antd';
import { CREATE_COACH } from 'src/resolvers/user/mutation';
import { COACHES } from 'src/resolvers/user/query';

import formRules from 'src/utils/form-rules';
import formatError from 'src/utils/format-error';
import Alert from 'src/components/Alert';
import ButtonLoading from 'src/components/ButtonLoading';
import hasSpeacialChars from 'src/utils/hasSpeacialChars';

import 'antd/lib/table/style';
import 'antd/lib/form/style';
import 'antd/lib/input/style';
import 'antd/lib/button/style';
import 'antd/lib/card/style';

const CoachTable = ({ form }) => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { getFieldDecorator } = form;

  const [createCoach] = useMutation(CREATE_COACH, {
    update: (cache, { data }) => {
      const query = { query: COACHES };
      const { coaches } = cache.readQuery(query);
      cache.writeQuery({
        query: COACHES,
        data: {
          coaches: {
            count: coaches.count + 1,
            coaches: [...coaches.coaches, { ...data.createCoach }],
            __typename: 'CoachList',
          },
        },
      });
    },
  });

  const { formProps, formLoading } = useForm({
    form,
    async submit(variables) {
      try {
        await createCoach({
          variables: {
            ...variables,
            email: variables.email.toLowerCase(),
          },
        });
        setSuccess(`An email sent to ${variables.email.toLowerCase()}`);
      } catch (err) {
        setError(formatError(err));
      }
    },
  });

  return (
    <>
      <Card title="Invite Coach">
        <Form {...formProps}>
          {error && !success && <Alert type="danger">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}
          <Form.Item hasFeedback>
            {getFieldDecorator('name', {
              ...formRules.name,
              rules: [
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
            })(
              <Input
                placeholder="Enter coach name"
                type="text"
                prefix={<Icon type={User} />}
              />
            )}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator(
              'email',
              formRules.email
            )(
              <Input
                placeholder="Enter coach email"
                type="email"
                prefix={<Icon type={Mail} />}
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {formLoading && <ButtonLoading />}
              Send Invite
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};

export default Form.create()(CoachTable);
