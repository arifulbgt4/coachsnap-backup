import React from 'react';
import cleanDeep from 'clean-deep';
import Form from 'antd/lib/form';
import Card from 'antd/lib/card';
import Button from 'antd/lib/button';
import Spin from 'antd/lib/spin';
import Input from 'antd/lib/input';
import message from 'antd/lib/message';
import Edit from '@ant-design/icons-svg/lib/asn/EditOutlined';
import Mail from '@ant-design/icons-svg/lib/asn/MailOutlined';
import Delete from '@ant-design/icons-svg/lib/asn/DeleteOutlined';
import Icon from 'src/components/Icon';
import { useMutation } from 'react-apollo';
import { useForm } from 'sunflower-antd';
import { withRouter } from 'react-router-dom';

import 'antd/lib/form/style';
import 'antd/lib/card/style';
import 'antd/lib/button/style';
import 'antd/lib/spin/style';
import 'antd/lib/input/style';
import 'antd/lib/message/style';

import {
  UPDATE_COACH_BY_ADMIN,
  DELETE_COACH,
  REQUEST_RESET,
} from 'src/resolvers/user/mutation';
import { COACHES } from 'src/resolvers/user/query';
import formatError from 'src/utils/format-error';
import ButtonLoading from 'src/components/ButtonLoading';
import ItemDelete from 'src/components/ItemDelete';
import hasSpeacialChars from 'src/utils/hasSpeacialChars';

const { Item, create } = Form;

const layout = {
  labelCol: {
    md: { span: 24 },
    lg: { span: 4 },
  },
  wrapperCol: {
    md: { span: 24 },
    lg: { span: 20 },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    md: {
      span: 24,
    },
    lg: {
      span: 16,
      offset: 4,
    },
  },
};

const UpdateProfile = props => {
  const { form, coach, history } = props;
  const { getFieldDecorator } = form;
  const [updateCoach] = useMutation(UPDATE_COACH_BY_ADMIN);
  const [sendReset, { loading: sendResetLoading }] = useMutation(
    REQUEST_RESET,
    {
      variables: { email: coach.user.email },
    }
  );
  const [deleteCoach, { loading }] = useMutation(DELETE_COACH, {
    variables: { coachId: coach.user.id },
    update: (cache, res) => {
      const query = { query: COACHES };
      const { coaches } = cache.readQuery(query);
      cache.writeQuery({
        ...query,
        data: {
          coaches: {
            count: coaches.count - 1,
            coaches: coaches.coaches.filter(
              c => c.id !== res.data.deleteCoach.id
            ),
            __typename: 'CoachList',
          },
        },
      });
    },
  });

  const submitDelete = async () => {
    try {
      await deleteCoach();
      history.goBack();
    } catch (error) {
      message.error(formatError(error));
    }
  };

  const onSendReset = async () => {
    try {
      await sendReset();
      message.success('Reset URL is sent to coach email');
    } catch (error) {
      message.error(formatError(error));
    }
  };

  const { formProps, formLoading } = useForm({
    form,
    async submit(data) {
      data.name = data.name?.trim();
      data.email = data.email?.trim();
      data.username = data.username?.trim();
      data.biography = data.biography?.trim();
      data.facebook = data.facebook?.trim();
      data.twitter = data.twitter?.trim();
      data.mobile = data.mobile?.trim();
      if (data.password && data.password.trim() === '') {
        delete data.password;
      }
      try {
        await updateCoach({
          variables: {
            data: { ...data, email: data.email.toLowerCase() },
            coachId: coach.user.id,
          },
        });
        message.success('Profile updated');
      } catch (error) {
        message.error(formatError(error));
      }
    },
  });

  const fields = [
    {
      label: 'Name',
      labelFor: 'name',
      inputType: 'text',
      rules: {
        initialValue: coach && coach.user.name ? coach.user.name : null,
        validate: [
          {
            trigger: 'onChange',
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
          },
        ],
      },
    },
    {
      label: 'E-mail',
      labelFor: 'email',
      inputType: 'email',
      rules: {
        initialValue: coach && coach.user.email ? coach.user.email : null,
        validate: [
          {
            trigger: 'onBlur',
            rules: [
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
            ],
          },
        ],
      },
    },
    {
      label: 'Username',
      labelFor: 'username',
      inputType: 'text',
      rules: {
        initialValue: coach && coach.user.username ? coach.user.username : null,
        validate: [
          {
            trigger: 'onChange',
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (value && value.match(/[\n# $&:\n\t]/g)) {
                    callback('Please do not add space in username');
                    return;
                  }
                  callback();
                },
              },
            ],
          },
        ],
      },
    },
    {
      label: 'Biography',
      labelFor: 'biography',
      inputType: 'text',
      rules: {
        initialValue:
          coach && coach.user.biography ? coach.user.biography : null,
      },
    },
    {
      label: 'Facebook',
      labelFor: 'facebook',
      inputType: 'text',
      rules: {
        initialValue: coach && coach.user.facebook ? coach.user.facebook : null,
      },
    },
    {
      label: 'Twitter',
      labelFor: 'twitter',
      inputType: 'text',
      rules: {
        initialValue: coach && coach.user.twitter ? coach.user.twitter : null,
      },
    },
    {
      label: 'Website',
      labelFor: 'website',
      inputType: 'text',
      rules: {
        initialValue: coach && coach.user.website ? coach.user.website : null,
      },
    },
    {
      label: 'Mobile',
      labelFor: 'mobile',
      inputType: 'text',
      rules: {
        initialValue: coach && coach.user.mobile ? coach.user.mobile : null,
        validate: [
          {
            trigger: 'onChange',
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (
                    value &&
                    value.match(
                      /[\!\@\#\$\%\^\&\*\)\(\=\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-\A-Za-z]/g
                    )
                  ) {
                    callback('Please write a valid phone number');
                    return;
                  }
                  callback();
                },
              },
            ],
          },
        ],
      },
    },
    {
      label: 'New Password',
      labelFor: 'password',
      inputType: 'password',
      rules: {
        validate: [
          {
            trigger: 'onBlur',
            rules: [
              {
                min: 6,
                message: 'Password must be minimum 6 characters',
              },
            ],
          },
        ],
      },
    },
  ];

  return (
    <Card size="small" title="Update Coach">
      <Spin spinning={formLoading} size="large" tip="Updating Coach Info">
        <Form {...layout} {...formProps} labelAlign="left">
          {fields.map(field => (
            <Item label={field.label} key={field.label} hasFeedback>
              {getFieldDecorator(
                field.labelFor,
                field.rules
              )(<Input type={field.inputType} />)}
            </Item>
          ))}
          <Item {...tailFormItemLayout}>
            <Button
              type="primary"
              htmlType="submit"
              style={{ marginRight: 10 }}
            >
              {formLoading ? <ButtonLoading /> : <Icon type={Edit} />}
              Update
            </Button>
            <Button
              type="info"
              style={{ marginRight: 10 }}
              onClick={onSendReset}
              loading={sendResetLoading}
            >
              <Icon type={Mail} />
              Send reset link
            </Button>
            <ItemDelete
              text="Coach"
              submitDelete={submitDelete}
              placement="topRight"
            >
              <Button type="danger">
                {loading ? <ButtonLoading /> : <Icon type={Delete} />}
                Delete
              </Button>
            </ItemDelete>
          </Item>
        </Form>
      </Spin>
    </Card>
  );
};

const FormComponent = create({ name: 'update-coach' })(UpdateProfile);

export default withRouter(FormComponent);
