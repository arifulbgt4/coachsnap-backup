import React, { useState } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import moment from 'moment-timezone';
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
import Mail from '@ant-design/icons-svg/lib/asn/MailOutlined';
import Lock from '@ant-design/icons-svg/lib/asn/LockOutlined';
import Icon from 'src/components/Icon';
import Input from 'antd/lib/input';
import 'antd/lib/input/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Form from 'antd/lib/form';
import 'antd/lib/form/style';
import { useMutation } from '@apollo/react-hooks';
import { useForm } from 'sunflower-antd';
import { connect } from 'react-redux';

import {
  SIGNUP_MUTATION,
  CUSTOMER_SIGNUP_MUTATION,
} from 'src/resolvers/user/mutation';
import { setCurrentUser } from 'src/state/ducks/authentication/actions';
import formatError from 'src/utils/format-error';
import formRules from 'src/utils/form-rules';

import Alert from 'src/components/Alert';
import ButtonLoading from 'src/components/ButtonLoading';
import hasSpeacialChars from 'src/utils/hasSpeacialChars';
import Navbar from '../../components/Navbar';

import './style.less';

const { Content } = Layout;

const Signup = props => {
  const {
    match: {
      params: { username },
    },
  } = props;

  const [submitted, setSubmitted] = useState(true);
  const [error, setError] = useState(null);
  const [signup] = useMutation(SIGNUP_MUTATION);
  const [signupAsCustomer] = useMutation(CUSTOMER_SIGNUP_MUTATION);
  const { form, authState } = props;
  const { formProps, formLoading } = useForm({
    form,
    async submit(variables) {
      variables.email = variables.email.toLowerCase();
      try {
        setSubmitted(false);
        if (!username) {
          const {
            data: { signup: token },
          } = await signup({
            variables: {
              ...variables,
              timezone: moment.tz.guess(),
            },
          });
          props.setCurrentUser({ token });
        } else {
          const {
            data: { signupAsCustomer: token },
          } = await signupAsCustomer({
            variables: {
              ...variables,
              username,
            },
          });
          props.setCurrentUser({ token, username });
        }

        setSubmitted(true);
      } catch (err) {
        setError(formatError(err));
      }
    },
  });

  const { getFieldDecorator } = form;

  if (submitted && authState.isAuthenticated) {
    if (authState.user.role === 'CUSTOMER' && username) {
      return <Redirect to={`/${username}/customer/dashboard`} />;
    }
    if (authState.user.role === 'COACH' && !username) {
      return <Redirect to="/coach/dashboard" />;
    }
    return <Redirect to="/" />;
  }

  return (
    <>
      <Navbar />
      <Content className="sign-up-page">
        <Row>
          <Col
            xl={{ span: 6, offset: 9 }}
            lg={{ span: 10, offset: 7 }}
            md={{ span: 12, offset: 6 }}
            sm={{ span: 20, offset: 2 }}
            xs={{ span: 22, offset: 1 }}
          >
            <Card className="sing-up-card">
              <h2>Sign Up {username && ` with ${username}`}</h2>
              <Avatar style={{ backgroundColor: '#87d068' }} size={100}>
                <Icon type={User} className="user" />
              </Avatar>
              {error && <Alert type="danger">{error}</Alert>}
              <Form {...formProps}>
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
                      placeholder="Enter Full Name"
                      prefix={
                        <Icon type={User} className="color__gray-light" />
                      }
                    />
                  )}
                </Form.Item>
                {!username && (
                  <Form.Item hasFeedback>
                    {getFieldDecorator('username', {
                      ...formRules.username,
                      rules: [
                        {
                          validator: (rule, value, callback) => {
                            if (value?.match(/[\n# $&:\n\t]/g)) {
                              callback('Please do not add space in username');
                              return;
                            }
                            callback();
                          },
                        },
                      ],
                    })(
                      <Input
                        placeholder="Username"
                        prefix={
                          <Icon type={User} className="color__gray-light" />
                        }
                      />
                    )}
                  </Form.Item>
                )}
                <Form.Item hasFeedback>
                  {getFieldDecorator(
                    'email',
                    formRules.email
                  )(
                    <Input
                      placeholder="Enter Email"
                      type="email"
                      prefix={
                        <Icon type={Mail} className="color__gray-light" />
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
                    Sign Up
                  </Button>
                </Form.Item>
                <a href={username ? `/${username}/signin` : `/signin`}>
                  Already You have an account?
                </a>
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
  withRouter(Form.create({ name: 'signup' })(Signup))
);
