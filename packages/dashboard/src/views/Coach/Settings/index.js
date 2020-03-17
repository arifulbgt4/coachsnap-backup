import React, { useState } from 'react';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Form from 'antd/lib/form';
import 'antd/lib/form/style';
import Input from 'antd/lib/input';
import 'antd/lib/input/style';
import UploadIcon from '@ant-design/icons-svg/lib/asn/UploadOutlined';
import Icon from 'src/components/Icon';
import Upload from 'antd/lib/upload';
import 'antd/lib/upload/style';
import Spin from 'antd/lib/spin';
import 'antd/lib/spin/style';
import Select from 'antd/lib/select';
import 'antd/lib/select/style';
import message from 'antd/lib/message';
import 'antd/lib/message/style';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'sunflower-antd';
import { useMutation } from 'react-apollo';
import moment from 'custom-moment';

import formatError from 'src/utils/format-error';
import getBase64 from 'src/utils/base64';
import { getTimeZoneList, formatGmt } from 'src/utils/timezone';
import { setCurrentUser } from 'src/state/ducks/authentication/actions';
import { UPDATE_COACH, REMOVE_COACH_IMAGE } from 'src/resolvers/user/mutation';
import ButtonLoading from 'src/components/ButtonLoading';
import hasSpeacialChars from 'src/utils/hasSpeacialChars';
import { CoverImage } from 'src/components/Image';

import './style.less';
import formRules from 'src/utils/form-rules';

const { TextArea } = Input;

const formItemLayout = {
  labelCol: {
    lg: { span: 5 },
  },
  wrapperCol: {
    lg: { span: 19 },
  },
};

const { Option } = Select;

const CoachSettingsForm = ({ form }) => {
  const dispatch = useDispatch();
  const user = useSelector(store => store.authState.user);

  const [profileChange, setProfileChange] = useState(false);
  const [coverChange, setCoverChange] = useState(false);

  const [previewProfileImage, setProfileImagePreview] = useState(
    user.profileImage.url || null
  );
  const [previewCoverImage, setCoverImagePreview] = useState(
    user.coverImage.url || null
  );
  const [updateCoach] = useMutation(UPDATE_COACH);
  const [deleteCoachImage] = useMutation(REMOVE_COACH_IMAGE);

  const { getFieldDecorator } = form;
  const format = 'HH:mm';

  const handleChange = ({ file }, cb) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (isLt10M) {
      getBase64(file.originFileObj, imagePreview => cb(imagePreview));
    } else {
      message.error('Image must smaller than 10MB!');
    }
  };

  const handleDeleteImage = async type => {
    const {
      data: {
        deleteCoachImage: { token },
      },
    } = await deleteCoachImage({ variables: { type } });
    dispatch(setCurrentUser({ token }));
  };

  const { formProps, formLoading } = useForm({
    form,
    async submit(variables) {
      const { profileImage, coverImage } = variables;
      // TODO: Some variables might be empty, so we need to check it out
      // Also this looks like a bad way of checking all fields.
      // We might have tons of variables inside a form.
      variables.name = variables.name?.trim();
      variables.email = variables.email?.trim();
      variables.username = variables.username?.trim();
      variables.biography = variables.biography?.trim();
      variables.facebook = variables.facebook?.trim();
      variables.twitter = variables.twitter?.trim();
      variables.mobile = variables.mobile?.trim();
      if (variables.password && variables.password.trim() === '') {
        delete variables.password;
      }
      try {
        const input = variables;
        delete input.profileImage;
        delete input.coverImage;
        delete input.newPassword;
        input.email = input.email.toLowerCase();
        const {
          data: {
            updateCoachByCoach: { token },
          },
        } = await updateCoach({
          variables: {
            data: {
              ...input,
              timezone: variables.timezone.split(' ')[1],
              ...(profileChange &&
                profileImage?.file && {
                  profileImage: profileImage.file.originFileObj,
                }),
              ...(coverChange &&
                coverImage?.file && {
                  coverImage: coverImage.file.originFileObj,
                }),
            },
          },
        });
        setProfileChange(false);
        setCoverChange(false);
        dispatch(setCurrentUser({ token }));
        message.success('Profile updated');
      } catch (error) {
        message.error(formatError(error));
      }
    },
    defaultFormValues() {
      // This will show the placeholder when coach doesn't have any timezone
      if (!user.timezone) {
        delete user.timezone;
      }
    },
  });

  const checkPassword = (rule, value, callback) => {
    const password = form.getFieldValue('password');
    if (value === password || password.trim() === '') {
      callback();
      return;
    }
    callback("passwords didn't matched");
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card className="edit-profile" title="Edit Profile">
          <Spin spinning={formLoading}>
            <Form {...formProps} {...formItemLayout}>
              <Form.Item labelAlign="left" label="Name" hasFeedback>
                {getFieldDecorator('name', {
                  ...formRules.name,
                  initialValue: user.name ? user.name : null,
                  rules: [
                    { required: true, message: 'Name should not me empty' },
                    { max: 20 },
                    {
                      validator: (rule, value, callback) => {
                        if (hasSpeacialChars(value)) {
                          callback('Name cannot contain speacial chars');
                          return;
                        }
                        callback();
                      },
                    },
                  ],
                })(<Input type="text" name="name" placeholder="Full name" />)}
              </Form.Item>

              <Form.Item labelAlign="left" label="Username" hasFeedback>
                {getFieldDecorator('username', {
                  ...formRules.username,
                  initialValue: user.username ? user.username : null,
                  rules: [
                    { required: true, message: 'Username should not me empty' },
                    { max: 20 },
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
                })(
                  <Input type="text" name="username" placeholder="username" />
                )}
              </Form.Item>

              <Form.Item labelAlign="left" label="Email" hasFeedback>
                {getFieldDecorator('email', {
                  ...formRules.email,
                  initialValue: user.email ? user.email : null,
                  rules: [
                    { required: true, message: 'Email should not me empty' },
                  ],
                })(
                  <Input
                    type="email"
                    name="email"
                    placeholder="example@info.com"
                  />
                )}
              </Form.Item>

              <Form.Item labelAlign="left" label="Timezone" hasFeedback>
                {getFieldDecorator('timezone', {
                  initialValue: user.timezone ? formatGmt(user.timezone) : null,
                })(
                  <Select
                    placeholder="Select timezone"
                    showSearch
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {getTimeZoneList().map(t => (
                      <Option value={t} key={t}>
                        {t}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>

              <Form.Item labelAlign="left" label="Biography" hasFeedback>
                {getFieldDecorator('biography', {
                  initialValue: user.biography ? user.biography : null,
                  rules: [{ max: 150 }],
                })(
                  <TextArea
                    type="text"
                    name="biography"
                    placeholder="Tell something about yourself"
                  />
                )}
              </Form.Item>

              <Form.Item labelAlign="left" label="Facebook" hasFeedback>
                {getFieldDecorator('facebook', {
                  initialValue: user.facebook ? user.facebook : null,
                })(
                  <Input
                    type="text"
                    name="facebook"
                    placeholder="Your facebook username, ie: john"
                  />
                )}
              </Form.Item>

              <Form.Item labelAlign="left" label="Twitter" hasFeedback>
                {getFieldDecorator('twitter', {
                  initialValue: user.twitter ? user.twitter : null,
                })(
                  <Input
                    type="text"
                    name="twitter"
                    placeholder="Your twitter username, ie: john"
                  />
                )}
              </Form.Item>

              <Form.Item labelAlign="left" label="Website" hasFeedback>
                {getFieldDecorator('website', {
                  initialValue: user.website ? user.website : null,
                })(<Input type="text" name="website" placeholder="https://" />)}
              </Form.Item>

              <Form.Item labelAlign="left" label="Mobile" hasFeedback>
                {getFieldDecorator(
                  'mobile',
                  {
                    initialValue: user.mobile ? user.mobile : null,
                  },
                  {
                    rules: [
                      { max: 20 },
                      {
                        validator: (rule, value, callback) => {
                          if (
                            // if value is null, the form will forever be in loop
                            value &&
                            value.match(
                              // we need to disable eslint until we refactor this regex with actual number verification
                              // eslint-disable-next-line no-useless-escape
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
                  }
                )(
                  <Input type="text" name="mobile" placeholder="Phone number" />
                )}
              </Form.Item>

              <Form.Item labelAlign="left" label="Profile Image">
                {getFieldDecorator('profileImage')(
                  <Upload
                    name="avatar"
                    accept=".jpg,.jpeg,.png"
                    listType="picture-card"
                    showUploadList={false}
                    fileList={null}
                    customRequest={() => {}}
                    onChange={info => {
                      handleChange(info, setProfileImagePreview);
                      setProfileChange(true);
                    }}
                  >
                    <div className="up-image-area up-profile">
                      {previewProfileImage ? (
                        <>
                          <Button
                            icon="close"
                            shape="circle"
                            className="delete-image"
                            type="danger"
                            onClick={async e => {
                              e.stopPropagation();
                              if (previewProfileImage.includes('http')) {
                                await handleDeleteImage('profile');
                                setProfileImagePreview(null);
                              } else {
                                setProfileImagePreview(null);
                              }
                            }}
                          />
                          <CoverImage
                            src={previewProfileImage || user.profileImage.url}
                            width="100"
                          />
                        </>
                      ) : (
                        <Icon type={UploadIcon} />
                      )}
                    </div>
                  </Upload>
                )}
              </Form.Item>

              <Form.Item labelAlign="left" label="Cover Image">
                {getFieldDecorator('coverImage')(
                  <Upload
                    accept=".jpg,.jpeg,.png"
                    name="cover"
                    className="large"
                    listType="picture-card"
                    showUploadList={false}
                    fileList={null}
                    customRequest={() => {}}
                    onChange={info => {
                      handleChange(info, setCoverImagePreview);
                      setCoverChange(true);
                    }}
                  >
                    <div className="up-image-area">
                      {previewCoverImage ? (
                        <>
                          <Button
                            icon="close"
                            shape="circle"
                            className="delete-image"
                            type="danger"
                            onClick={async e => {
                              e.stopPropagation();
                              if (previewCoverImage.includes('http')) {
                                await handleDeleteImage('cover');
                                setCoverImagePreview(null);
                              } else {
                                setCoverImagePreview(null);
                              }
                            }}
                          />
                          <CoverImage src={previewCoverImage} width="338" />
                        </>
                      ) : (
                        <Icon type={UploadIcon} />
                      )}
                    </div>
                  </Upload>
                )}
              </Form.Item>

              <Form.Item labelAlign="left" label="New Password" hasFeedback>
                {getFieldDecorator('password')(
                  <Input
                    type="password"
                    name="password"
                    placeholder="Change your password"
                  />
                )}
              </Form.Item>
              <Form.Item
                labelAlign="left"
                label="Confirm New Password"
                hasFeedback
              >
                {getFieldDecorator('newPassword', {
                  rules: [{ validator: checkPassword, required: false }],
                })(
                  <Input
                    type="password"
                    name="new-password"
                    placeholder="Confirm your password"
                  />
                )}
              </Form.Item>

              <Row>
                <Col md={{ span: 6, offset: 0 }} lg={{ span: 6, offset: 5 }}>
                  <Button type="primary" htmlType="submit">
                    {formLoading && <ButtonLoading />}
                    Update
                  </Button>
                </Col>
              </Row>
            </Form>
          </Spin>
        </Card>
      </Col>
    </Row>
  );
};

export default Form.create({ name: 'edit-profile' })(CoachSettingsForm);
