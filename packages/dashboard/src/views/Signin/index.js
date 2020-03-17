import React, { useState } from 'react';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Layout from 'antd/lib/layout';
import 'antd/lib/layout/style';
import Avatar from 'antd/lib/avatar';
import 'antd/lib/avatar/style';
import User from '@ant-design/icons-svg/lib/asn/UserOutlined';
import Lock from '@ant-design/icons-svg/lib/asn/LockOutlined';
import Icon from 'src/components/Icon';
import Input from 'antd/lib/input';
import 'antd/lib/input/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Form from 'antd/lib/form';
import 'antd/lib/form/style';
import message from 'antd/lib/message';
import 'antd/lib/message/style';
import { Redirect, withRouter } from 'react-router-dom';
import { useForm } from 'sunflower-antd';
import { useMutation } from '@apollo/react-hooks';
import { connect } from 'react-redux';

import formatError from 'src/utils/format-error';
import formRules from 'src/utils/form-rules';
import { setCurrentUser } from 'src/state/ducks/authentication/actions';
import {
  SIGNIN_MUTATION,
  CUSTOMER_SIGNIN_MUTATION,
} from 'src/resolvers/user/mutation';

import Alert from 'src/components/Alert';
import ButtonLoading from 'src/components/ButtonLoading';
import Navbar from '../../components/Navbar';

import './style.less';

const { Content } = Layout;

const SigninForm = props => {
  const {
    match: {
      params: { username },
    },
  } = props;

  const [submitted, setSubmitted] = useState(true);
  const [error, setError] = useState(null);
  const [signinMutation] = useMutation(SIGNIN_MUTATION);
  const [customerSignin] = useMutation(CUSTOMER_SIGNIN_MUTATION);
  const { form, authState } = props;

  const { formProps, formLoading } = useForm({
    form,
    async submit(variables) {
      variables.email = variables.email.toLowerCase();
      try {
        setSubmitted(false);
        if (username) {
          const { data } = await customerSignin({
            variables: { ...variables, username },
          });
          const { token } = data?.signinAsCustomer;
          props.setCurrentUser({ token, username });
        } else {
          const { data } = await signinMutation({ variables });
          const { token } = data.signin;
          props.setCurrentUser({ token });
        }
        setSubmitted(true);
      } catch (err) {
        setError(formatError(err));
      }
    },
  });
  const { getFieldDecorator } = form;

  if (submitted && authState.isAuthenticated) {
    // make sure this is inside of a coach card.
    if (authState.user.role === 'CUSTOMER' && username) {
      return <Redirect to={`/${username}/customer/dashboard`} />;
    }
    if (authState.user.role === 'ADMIN' && !username) {
      return <Redirect to="/admin" />;
    }
    if (authState.user.role === 'COACH' && !username) {
      return <Redirect to="/coach/dashboard" />;
    }
    message.warning('Please logout from your admin/coach account first');
    return <Redirect to="/" />;
  }
  return (
    <>
      <Navbar />
      <Content className="sign-in-page">
        <Row>
          <Col
            xl={{ span: 6, offset: 9 }}
            lg={{ span: 10, offset: 7 }}
            md={{ span: 12, offset: 6 }}
            sm={{ span: 20, offset: 2 }}
            xs={{ span: 22, offset: 1 }}
          >
            <Card className="sign-in-card">
              <h2>Sign In {username && ` with ${username}`}</h2>
              <Avatar size={100}>
                <Icon type={User} className="user" />
              </Avatar>
              {error && <Alert type="danger">{error}</Alert>}
              {/* TODO: The state is not clearing. That's why it throws error */}
              {/* {location.state && <Alert>{location.state.message}</Alert>} */}
              <Form {...formProps}>
                <Form.Item hasFeedback>
                  {getFieldDecorator(
                    'email',
                    formRules.email
                  )(
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      prefix={
                        <Icon type={User} className="color__gray-light" />
                      }
                    />
                  )}
                </Form.Item>
                <Form.Item hasFeedback>
                  {getFieldDecorator(
                    'password',
                    formRules.password
                  )(
                    <Input
                      placeholder="Password"
                      type="password"
                      prefix={
                        <Icon type={Lock} className="color__gray-light" />
                      }
                    />
                  )}
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    {formLoading && <ButtonLoading />}
                    Sign In
                  </Button>
                </Form.Item>
                <div>
                  <a href={username ? `/${username}/signup` : `/signup`}>
                    Don’t have an account?
                  </a>
                </div>
                or
                <div>
                  <a href={username ? `/${username}/reset` : `/reset`}>
                    Forgot your password?
                  </a>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </>
  );
};

const mapStateToProps = state => ({
  authState: state.authState,
});

export default connect(mapStateToProps, { setCurrentUser })(
  withRouter(Form.create({ name: 'signin' })(SigninForm))
);
