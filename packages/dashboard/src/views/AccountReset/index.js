import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { useMutation } from '@apollo/react-hooks';
import Form from 'antd/lib/form';
import 'antd/lib/form/style';
import Icon from 'src/components/Icon';
import Mail from '@ant-design/icons-svg/lib/asn/MailOutlined';
import User from '@ant-design/icons-svg/lib/asn/UserOutlined';
import Lock from '@ant-design/icons-svg/lib/asn/LockOutlined';
import Input from 'antd/lib/input';
import 'antd/lib/input/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Layout from 'antd/lib/layout';
import 'antd/lib/layout/style';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import { useForm } from 'sunflower-antd';
import Alert from 'src/components/Alert';
import formatError from 'src/utils/format-error';

import {
  setCurrentUser,
  logoutUser,
} from 'src/state/ducks/authentication/actions';

import Fallback from 'src/components/Fallback';
import ButtonLoading from 'src/components/ButtonLoading';
import {
  RESET_COACH_ACCOUNT,
  RESET_CUSTOMER_ACCOUNT,
  VERIFY_INVITATION_TOKEN,
  VERIFY_CUSTOMER_INVITATION_TOKEN,
} from 'src/resolvers/user/mutation';

import Navbar from 'src/components/Navbar';

import './style.less';

const { Content } = Layout;

const Reset = props => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { location, logoutUser, form } = props;
  const username = location.pathname.split('/')[1];
  const { inviteToken } = queryString.parse(location.search);

  const [verifyToken, { loading }] = useMutation(VERIFY_INVITATION_TOKEN);
  const [verifyCustomerToken, { loading: verifyLoading }] = useMutation(
    VERIFY_CUSTOMER_INVITATION_TOKEN
  );
  const [resetCoach] = useMutation(RESET_COACH_ACCOUNT);
  const [resetCustomer] = useMutation(RESET_CUSTOMER_ACCOUNT);
  useEffect(() => {
    if (inviteToken && username === 'reset-account') {
      // Make sure to logut the current user if logged in.
      logoutUser({});
      // Verify the token
      const verify = async () => {
        try {
          await verifyToken({ variables: { inviteToken } });
        } catch (err) {
          setError(formatError(err));
        }
      };
      verify();
    } else {
      // Make sure to logout current user from target coach.
      logoutUser({ username });
      // Verify the token
      const verify = async () => {
        try {
          await verifyCustomerToken({ variables: { inviteToken, username } });
        } catch (err) {
          setError(formatError(err));
        }
      };
      verify();
    }
  }, [inviteToken, logoutUser, username, verifyCustomerToken, verifyToken]);

  const { formProps, formLoading } = useForm({
    form,
    async submit(variables) {
      try {
        if (inviteToken && username !== 'reset-account') {
          await resetCustomer({
            variables: { ...variables, username, inviteToken },
          });
          setSuccess(true);
        } else {
          await resetCoach({ variables: { ...variables, inviteToken } });
          setSuccess(true);
        }
      } catch (err) {
        setError(formatError(err));
      }
    },
  });
  const { getFieldDecorator } = form;
  if (loading || verifyLoading) return <Fallback />;
  return (
    <>
      <Navbar />
      <Content style={{ marginTop: '100px' }}>
        <Row>
          <Col span={6} offset={9}>
            {error && !success && <Alert type="danger">{error}</Alert>}
            {success && (
              <Alert type="success">
                Your account credentials is now changed. Please
                <a href="/signin">signin</a> with the email and password
              </Alert>
            )}
            <Form className="reset-form" {...formProps}>
              <Form.Item>
                {getFieldDecorator('email', {
                  rules: [
                    { required: true, message: 'Please input your email!' },
                  ],
                })(
                  <Input
                    prefix={<Icon type={Mail} className="color__light-ash" />}
                    placeholder="Email"
                  />
                )}
              </Form.Item>
              {/* if there is no username then take username */}
              {username === 'reset-account' && (
                <Form.Item>
                  {getFieldDecorator('username', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input your username!',
                      },
                    ],
                  })(
                    <Input
                      prefix={<Icon type={User} className="color__light-ash" />}
                      placeholder="Username"
                    />
                  )}
                </Form.Item>
              )}
              <Form.Item>
                {getFieldDecorator('password', {
                  rules: [
                    { required: true, message: 'Please input your Password!' },
                  ],
                })(
                  <Input
                    prefix={<Icon type={Lock} className="color__light-ash" />}
                    type="password"
                    placeholder="Password"
                  />
                )}
              </Form.Item>
              <Form.Item>
                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                >
                  {formLoading && <ButtonLoading />}
                  Reset
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Content>
    </>
  );
};

const WrappedResetForm = Form.create({ name: 'reset' })(Reset);

export default connect(null, { setCurrentUser, logoutUser })(
  withRouter(WrappedResetForm)
);
