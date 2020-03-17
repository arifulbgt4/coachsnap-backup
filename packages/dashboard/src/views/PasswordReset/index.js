import React, { useState } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { useForm } from 'sunflower-antd';
import { useMutation } from '@apollo/react-hooks';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Form from 'antd/lib/form';
import 'antd/lib/form/style';
import Lock from '@ant-design/icons-svg/lib/asn/LockOutlined';
import User from '@ant-design/icons-svg/lib/asn/UserOutlined';
import Icon from 'src/components/Icon';
import Input from 'antd/lib/input';
import 'antd/lib/input/style';
import Spin from 'antd/lib/spin';
import 'antd/lib/spin/style';
import Layout from 'antd/lib/layout';
import 'antd/lib/layout/style';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import queryString from 'query-string';

import formRules from 'src/utils/form-rules';
import formatError from 'src/utils/format-error';

import Navbar from 'src/components/Navbar';
import Alert from 'src/components/Alert';

import {
  REQUEST_RESET,
  RESET_PASSWORD,
  REQUEST_CUSTOMER_RESET,
  RESET_CUSTOMER_PASSWORD,
} from 'src/resolvers/user/mutation';

import './style.less';

const { Item, create } = Form;
const { Content } = Layout;

const ResetPasswordForm = props => {
  const {
    match: {
      params: { username },
    },
  } = props;
  const [errorMsg, setError] = useState(null);
  const [successMsg, setSuccess] = useState(null);
  const { form, location } = props;

  const { resetToken } = queryString.parse(location.search);

  const [requestReset] = useMutation(REQUEST_RESET);
  const [resetPassword] = useMutation(RESET_PASSWORD);
  const [requestCustomerReset] = useMutation(REQUEST_CUSTOMER_RESET);
  const [resetCustomerPassword] = useMutation(RESET_CUSTOMER_PASSWORD);

  const { formProps, formResult, formLoading } = useForm({
    form,
    async submit({ email, password, confirmPassword }) {
      setError(null);
      setSuccess(null);
      try {
        if (resetToken) {
          let resetMessage;
          if (username) {
            const {
              data: {
                resetCustomerPassword: { message },
              },
            } = await resetCustomerPassword({
              variables: { resetToken, password, confirmPassword },
            });
            resetMessage = message;
          } else {
            const {
              data: {
                resetPassword: { message },
              },
            } = await resetPassword({
              variables: { resetToken, password, confirmPassword },
            });
            resetMessage = message;
          }

          setSuccess(resetMessage);
        } else {
          let requestMessage;
          if (username) {
            const {
              data: {
                requestCustomerReset: { message },
              },
            } = await requestCustomerReset({ variables: { email, username } });
            requestMessage = message;
          } else {
            const {
              data: {
                requestReset: { message },
              },
            } = await requestReset({ variables: { email } });
            requestMessage = message;
          }

          setSuccess(requestMessage);
        }
      } catch (error) {
        setError(formatError(error));
      }
    },
  });

  // Redirect to login only after changing password
  if (formResult && resetToken) {
    return <Redirect to={username ? `/${username}/signin` : `/signin`} />;
  }

  // Add confirm password rule
  const rules = {
    ...formRules,
    confirmPassword: {
      validate: [
        {
          trigger: 'onBlur',
          rules: [
            {
              required: true,
              message: 'Please confirm password',
            },
            {
              min: 6,
              message: 'Password must be minimum 6 characters',
            },
            // Check for the password and confirm password is same
            {
              validator: (rule, value, callback) => {
                if (value && value !== form.getFieldValue('password')) {
                  callback('Confirm password did not match.');
                } else {
                  callback();
                }
              },
            },
          ],
        },
      ],
    },
  };
  return (
    <>
      <Navbar />
      <Content style={{ marginTop: '100px' }}>
        <Spin spinning={formLoading} size="large" tip="Loading">
          <Row>
            <Col
              xs={{ span: 20, offset: 2 }}
              sm={{ span: 12, offset: 6 }}
              md={{ span: 10, offset: 7 }}
              lg={{ span: 8, offset: 8 }}
              xl={{ span: 6, offset: 9 }}
            >
              {errorMsg && !successMsg && (
                <Alert type="danger">{errorMsg}</Alert>
              )}
              {successMsg && <Alert type="success">{successMsg}</Alert>}
              {resetToken ? (
                <Form {...formProps} className="reset-form">
                  <h1>Enter new password</h1>
                  <Item>
                    {form.getFieldDecorator(
                      'password',
                      rules.password
                    )(
                      <Input.Password
                        prefix={<Icon type={Lock} />}
                        placeholder="Password"
                      />
                    )}
                  </Item>
                  <Item>
                    {form.getFieldDecorator(
                      'confirmPassword',
                      rules.confirmPassword
                    )(
                      <Input.Password
                        prefix={<Icon type={Lock} />}
                        placeholder="Confirm Password"
                      />
                    )}
                  </Item>

                  <Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="reset-form-button"
                    >
                      Reset
                    </Button>
                  </Item>
                </Form>
              ) : (
                <Form {...formProps} className="reset-form">
                  <h1>Request password reset</h1>
                  <Item>
                    {form.getFieldDecorator(
                      'email',
                      formRules.email
                    )(
                      <Input
                        prefix={<Icon type={User} />}
                        placeholder="Email"
                      />
                    )}
                  </Item>

                  <Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="reset-form-button"
                    >
                      Send
                    </Button>
                  </Item>
                </Form>
              )}
              <a href={username ? `/${username}/signin` : `/signin`}>
                Go back to signin.
              </a>
            </Col>
          </Row>
        </Spin>
      </Content>
    </>
  );
};

const WrappedResetPasswordForm = create({ name: 'reset' })(ResetPasswordForm);
export default withRouter(WrappedResetPasswordForm);
