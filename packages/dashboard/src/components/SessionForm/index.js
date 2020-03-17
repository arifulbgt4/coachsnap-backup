import React, { useEffect, useState, useContext } from 'react';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Form from 'antd/lib/form';
import 'antd/lib/form/style';
import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style';
import Input from 'antd/lib/input';
import 'antd/lib/input/style';
import Switch from 'antd/lib/switch';
import 'antd/lib/switch/style';
import DatePicker from 'antd/lib/date-picker';
import 'antd/lib/date-picker/style';
import message from 'antd/lib/message';
import 'antd/lib/message/style';
import Select from 'antd/lib/select';
import 'antd/lib/select/style';
import Upload from 'antd/lib/upload';
import 'antd/lib/upload/style';
import ShareAlt from '@ant-design/icons-svg/lib/asn/ShareAltOutlined';
import Notification from '@ant-design/icons-svg/lib/asn/NotificationOutlined';
import Delete from '@ant-design/icons-svg/lib/asn/DeleteOutlined';
import Retweet from '@ant-design/icons-svg/lib/asn/RetweetOutlined';
import Save from '@ant-design/icons-svg/lib/asn/SaveOutlined';
import RollBack from '@ant-design/icons-svg/lib/asn/RollbackOutlined';
import Icon from 'src/components/Icon';
import UploadIcon from '@ant-design/icons-svg/lib/asn/UploadOutlined';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { CoverImage } from 'src/components/Image';
import moment from 'custom-moment';

import ButtonLoading from 'src/components/ButtonLoading';
import ScrollDiv from 'src/components/ScrollDiv';
import ItemDelete from 'src/components/ItemDelete';
import SessionTypeForm from 'src/views/Coach/SessionTypes/components/SessionTypeForm';
import timeArray from 'src/utils/time-array';
import {
  UPDATE_SESSION,
  DELETE_SESSION_IMAGE,
  CREATE_SESSION,
  DELETE_SESSION,
  REMAINDER,
} from 'src/resolvers/session/mutation';
import { COACH_SESSIONS, SESSIONS } from 'src/resolvers/session/query';
import { SESSION_TYPES } from 'src/resolvers/session-types/query';
import { AVAILABLE_TIMES } from 'src/resolvers/booking/query';

import formatError from 'src/utils/format-error';
import { formatTime } from 'src/utils/date';
import getBase64 from 'src/utils/base64';
import useModalVisible from 'src/hooks/useModalVisible';
import { setSession } from 'src/state/ducks/session/actions';
import { setSessionType } from 'src/state/ducks/session-type/actions';
import {
  toggleShareModal,
  toggleSessionModal,
  toggleSessionDrawer,
} from 'src/state/ducks/ui/actions';

import ShareModal from '../ShareModal';
import { ListContext } from '../SessionList/context';
import './style.less';

const { TextArea } = Input;
const { Option } = Select;

const formItemLayout = {
  labelCol: { sm: { span: 24 }, md: { span: 6 } },
  wrapperCol: { sm: { span: 24 }, md: { span: 14 } },
};

const format = 'HH:mm';

const setValue = ({ formType, sessionType, selectedSession, field }) =>
  (formType === 'create' && sessionType[field]) ||
  (formType === 'update' && selectedSession[field]) ||
  '';

const formatBusinessHour = (variables, action) => {
  const businessHour = { [action]: {} };
  if (variables.businessHourStart) {
    businessHour[action] = {
      ...businessHour[action],
      start: moment(variables.businessHourStart, 'hh:mm a')
        // .tz(user.timezone)
        .format(format),
    };
  }
  if (variables.businessHourEnd) {
    businessHour[action] = {
      ...businessHour[action],
      end: moment(variables.businessHourEnd, 'hh:mm a')
        // .tz(user.timezone)
        .format(format),
    };
  }
  return businessHour;
};

const getDuration = (start, end) => {
  return (
    start && end && moment(end, 'HH:mm').diff(moment(start, 'HH:mm'), 'minutes')
  );
};

const times = timeArray();

const SessionForm = Form.create({
  name: 'coordinated',
})(({ form, cancel, formType, calendarType, initial, createdFrom, height }) => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.authState.user);
  const selectedSession = useSelector(state => state.sessionState.session);
  const sessionType = useSelector(state => state.sessionTypeState.sessionType);

  const [imageChange, setImageChange] = useState(false);
  const [endTimes, setEndTImes] = useState(times);
  const [singleEvent, setSingleEvent] = useState(
    selectedSession ? selectedSession.singleEvent : false
  );
  const [preview, setPreview] = useState(
    selectedSession.coverImage ? selectedSession.coverImage.url : null
  );
  const { getFieldDecorator, setFieldsValue } = form;
  const [visible, open, close, cancelModal] = useModalVisible(false);
  const sessionTypeObj = {
    name: null,
    cost: null,
    duration: 15,
    maxSeats: 1,
    description: null,
  };
  /**
   * Queries and Mutations
   */
  const availableTimeOpts = {
    variables: {
      sessionTypeId: sessionType.id,
      date: moment(
        (selectedSession.availability && selectedSession.availability.start) ||
          (initial && initial.date) ||
          new Date()
      ).format('DD/MM/YYYY'),
      ...(formType === 'update' && { ignoreSessionId: selectedSession.id }), // ignoreSessionId = The current session id. We need to filter the current session and get other sessions time
    },
    fetchPolicy: 'network-only',
  };

  const [
    getAvailableTimes,
    { data: { availableTimes } = { availableTimes: [] } },
  ] = useLazyQuery(AVAILABLE_TIMES, availableTimeOpts);
  const [getSessionTypes, { data: res }] = useLazyQuery(SESSION_TYPES, {
    variables: { coachId: user.id },
  });

  const [deleteSessionImage] = useMutation(DELETE_SESSION_IMAGE);

  // We need the session types only when we creating session from calendar
  const [updateSession, { loading }] = useMutation(UPDATE_SESSION, {
    update: (cache, response) => {
      const updatedSession = response.data.updateSession;
      dispatch(setSession(updatedSession));
    },
  });
  const [sendRemainder, { loading: remainderLoading }] = useMutation(
    REMAINDER,
    {
      onCompleted: data => message.info(data.sendRemainder.message),
      onError: error => message.error(formatError(error)),
    }
  );

  const list = useContext(ListContext);

  const [deleteSession, { loading: deleteLoading }] = useMutation(
    DELETE_SESSION,
    {
      // onCompleted: () => {
      //   if (list && list.type) list.getCoachSessions();
      // },
      update: (cache, response) => {
        if (list && list.type === 'dashboard') {
          list.getCoachSessions();
          return;
        }
        if (createdFrom === 'drawer') {
          const sessionQuery = {
            query: SESSIONS,
            variables: { sessionTypeId: sessionType.id },
          };
          const { sessions } = cache.readQuery(sessionQuery);
          cache.writeQuery({
            ...sessionQuery,
            data: {
              sessions: {
                ...sessions,
                count: sessions.count - 1,
                sessions: sessions.sessions.filter(
                  s => s.id !== response.data.deleteSession.id
                ),
              },
            },
          });
        } else {
          const query = {
            query: COACH_SESSIONS,
            variables: { where: { coach: { id: user.id } } },
          };
          const { getCoachSessions } = cache.readQuery(query);
          cache.writeQuery({
            ...query,
            data: {
              getCoachSessions: {
                ...getCoachSessions,
                count: getCoachSessions.count - 1,
                sessions: getCoachSessions.sessions.filter(
                  s => s.id !== response.data.deleteSession.id
                ),
              },
            },
          });
        }
      },
    }
  );

  const [createSession, { loading: createLoading }] = useMutation(
    CREATE_SESSION,
    {
      update: (cache, { data }) => {
        if (list && list.type === 'dashboard') {
          list.getCoachSessions();
          return;
        }
        if (createdFrom === 'drawer' || createdFrom === 'customers') {
          const sessionQuery = {
            query: SESSIONS,
            variables: { sessionTypeId: sessionType.id },
          };
          const { sessions } = cache.readQuery(sessionQuery);

          cache.writeQuery({
            ...sessionQuery,
            data: {
              sessions: {
                ...sessions,
                count: sessions.count + 1,
                sessions: [data.createSession, ...sessions.sessions],
              },
            },
          });
        } else {
          const query = {
            query: COACH_SESSIONS,
            variables: {
              where: {
                coach: { id: user && user.id },
              },
            },
          };
          const { getCoachSessions } = cache.readQuery(query);
          cache.writeQuery({
            ...query,
            data: {
              getCoachSessions: {
                ...getCoachSessions,
                count: getCoachSessions.count + 1,
                sessions: [data.createSession, ...getCoachSessions.sessions],
              },
            },
          });
        }
      },
    }
  );

  const handleUploadChange = ({ file }) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (isLt10M) {
      getBase64(file.originFileObj, imagePreview => setPreview(imagePreview));
      setImageChange(true);
    } else {
      message.error('Image must smaller than 10MB!');
    }
  };

  /**
   * Effects
   */

  useEffect(() => {
    if (formType === 'update' && !availableTimes.length) {
      getAvailableTimes();
    }
  }, [availableTimes.length, formType, getAvailableTimes]);

  useEffect(() => {
    const fetchSessionType = async () =>
      createdFrom === 'calendar' && getSessionTypes();
    fetchSessionType();
  }, [createdFrom, getSessionTypes]);

  useEffect(() => {
    if (visible) {
      dispatch(setSessionType({}));
    }
  }, [dispatch, visible]);

  /**
   * Methods
   */
  const handleCancel = () => {
    form.resetFields();
    dispatch(toggleSessionDrawer(false));
    cancel();
  };

  const handleDeleteImage = async () => {
    const { data } = await deleteSessionImage({
      variables: { id: selectedSession.id },
    });
    dispatch(setSession(data.deleteSessionImage));
    setPreview(null);
    setImageChange(false);
  };

  const isBooked = selectedSession.bookings?.length > 0;

  function handleSubmit(e) {
    e.preventDefault();
    form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const { businessHourStart, businessHourEnd, coverImage, time } = values;
        const input = { ...values };
        delete input.date;
        delete input.coverImage;

        const date = moment(values.date)
          // .tz(user.timezone)
          .format('DD/MM/YYYY');

        const startTime = moment(
          `${date} ${singleEvent ? time : businessHourStart}`,
          'DD/MM/YYYY h:mm'
        );
        const durationMin = moment.duration({ minutes: values.duration });
        const endTime = singleEvent
          ? moment(startTime)
              // .tz(user.timezone)
              .add(durationMin - 1)
          : moment(`${date} ${businessHourEnd}`, 'DD/MM/YYYY h:mm')
              .subtract(1, 'minutes')
              .format();

        const variables = {
          ...input,
          id: formType === 'update' ? selectedSession.id : sessionType.id,
          ...(imageChange &&
            coverImage?.file && {
              coverImage: coverImage.file.originFileObj,
            }),
          maxSeats: Number(values.maxSeats),
          duration: Number(values.duration),
          cost: Number(values.cost),
          startTime: moment(startTime)
            .tz(user.timezone)
            .format(),
          endTime: moment(endTime)
            .tz(user.timezone)
            .format(),
        };
        try {
          if (formType === 'update') {
            await updateSession({
              variables: {
                ...variables,
                singleEvent,
                ...(!isBooked &&
                  !singleEvent && {
                    businessHour: formatBusinessHour(
                      { ...variables, singleEvent },
                      'update'
                    ),
                  }),
              },
            });
            message.success('Session updated successfully.');
          } else {
            await createSession({
              variables: {
                ...variables,
                businessHour: formatBusinessHour(variables, 'create'),
              },
            });

            message.success('Session created successfully.');

            // Make sure to reset the form value and close the modal/drawer
            handleCancel();
          }
          setImageChange(false);
        } catch (error) {
          message.error(formatError(error));
        }
      }
    });
  }

  async function submitDelete() {
    try {
      await deleteSession({ variables: { id: selectedSession.id } });
      handleCancel();
      dispatch(toggleSessionModal(false));
      dispatch(setSession({}));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  function handleChangeSessionType(value) {
    const currentSessionType = res.sessionTypes.sessionTypes.find(
      s => s.id === value
    );
    dispatch(setSessionType(currentSessionType));
    dispatch(setSession(currentSessionType));
  }

  function handleChange(e) {
    dispatch(
      setSession({
        ...selectedSession,
        [e.target.name]: e.target.value,
      })
    );
  }

  function onChangeDate(date) {
    dispatch(
      setSession({
        ...selectedSession,
        availability: {
          ...selectedSession.availability,
          start: moment(date)
            // .tz(user.timezone)
            .format(),
        },
      })
    );
    setFieldsValue({
      time: null,
    });
    getAvailableTimes();
  }

  function onChangeTime(selectedTime) {
    dispatch(
      setSession({
        ...selectedSession,
        selectedTime,
      })
    );
  }

  const checkPrice = (rule, value, callback) => {
    if (value && value > 0) {
      callback();
    } else {
      callback('Price must greater than zero!');
    }
  };

  const validator = (rule, value, callback) => {
    const startHour = form.getFieldValue('businessHourStart');
    const endHour = form.getFieldValue('businessHourEnd');
    if (!startHour) {
      form.setFields({
        businessHourEnd: {
          errors: [new Error('Please select business start hour')],
        },
      });
    }
    const duration = getDuration(startHour, endHour);
    if (duration !== undefined) {
      form.setFieldsValue({
        duration,
      });
    }
    return callback();
  };

  const endHourValidation = (rule, value, callback) => {
    const endHour = form.getFieldValue('businessHourEnd');
    const startHour = form.getFieldValue('businessHourStart');
    if (endHour) {
      const date = moment().format('DD/MM/YYYY');
      const startTime = moment(`${date} ${value}`, 'DD/MM/YYYY h:mm');
      const endTime = moment(`${date} ${endHour}`, 'DD/MM/YYYY h:mm');
      if (moment(startTime).isAfter(moment(endTime))) {
        form.setFields({
          businessHourStart: {
            errors: [new Error('Business hour should be less than end time.')],
          },
        });
      }
    }
    const duration = getDuration(startHour, endHour);
    if (duration !== undefined) {
      form.setFieldsValue({
        duration,
      });
    }
    return callback();
  };

  const modifyAvailableTimes = startHour => {
    const skippedTimes = JSON.parse(JSON.stringify(times)).splice(
      times.indexOf(startHour) + 1
    );
    setEndTImes(skippedTimes);
  };
  return (
    <>
      {formType === 'update' && <ShareModal />}

      <Form
        className={`session-form ${formType}`}
        {...formItemLayout}
        onSubmit={handleSubmit}
      >
        <ScrollDiv resAuto height={height}>
          <div
            style={{
              padding: createdFrom === 'customers' ? 24 : 0,
              paddingRight: createdFrom !== 'calendar' ? 24 : 0,
            }}
          >
            {createdFrom === 'calendar' && (
              <Form.Item label="Session Type" hasFeedback>
                {getFieldDecorator('session_type', {
                  initialValue:
                    formType === 'update'
                      ? selectedSession.sessionType.name
                      : sessionType.name,
                  rules: [
                    {
                      required: true,
                      message: 'Please select a session type',
                    },
                  ],
                })(
                  res && res.sessionTypes.sessionTypes.length > 0 ? (
                    <Select
                      placeholder="Select a session type"
                      onChange={handleChangeSessionType}
                    >
                      {formType !== 'update' && (
                        <Option
                          className="create-new-session"
                          key="new-session-type"
                        >
                          <span className="create" onClick={e => open(e)}>
                            Create a new session type
                          </span>
                        </Option>
                      )}
                      {res &&
                        res.sessionTypes.sessionTypes.map(s => (
                          <Option value={s.id} key={s.id}>
                            {s.name}
                          </Option>
                        ))}
                    </Select>
                  ) : (
                    <Select
                      placeholder="Select a session type"
                      onChange={handleChangeSessionType}
                    >
                      {formType !== 'update' && (
                        <Option
                          className="create-new-session"
                          key="new-session-type"
                        >
                          <span className="create" onClick={e => open(e)}>
                            Create a new session type
                          </span>
                        </Option>
                      )}
                    </Select>
                  )
                )}
              </Form.Item>
            )}
            <Form.Item label="Name" hasFeedback>
              {getFieldDecorator('name', {
                initialValue: setValue({
                  formType,
                  sessionType,
                  selectedSession,
                  field: 'name',
                }),
                rules: [{ required: true }],
              })(
                <Input
                  type="text"
                  name="name"
                  placeholder="Name of the session"
                  onChange={handleChange}
                />
              )}
            </Form.Item>
            <Form.Item label="Date">
              {getFieldDecorator('date', {
                initialValue:
                  (createdFrom === 'calendar' &&
                    formType === 'create' &&
                    initial.date) ||
                  (formType === 'update' &&
                    moment(selectedSession.availability.start)) ||
                  null,
                rules: [
                  {
                    required: true,
                    message: 'Please select date',
                  },
                ],
              })(<DatePicker format="ddd MMM DD" onChange={onChangeDate} />)}
            </Form.Item>
            <Form.Item label="Single Event">
              {getFieldDecorator('singleEvent')(
                <Switch
                  onChange={checked => {
                    getAvailableTimes();
                    setSingleEvent(checked);
                  }}
                  checked={singleEvent}
                />
              )}
            </Form.Item>
            {!singleEvent ? (
              <Form.Item
                label="Business hour"
                style={{ marginBottom: 0 }}
                hasFeedback
              >
                <Row gutter={[16, 16]}>
                  <Col xs={{ span: 24 }} sm={{ span: 12 }}>
                    <Form.Item
                      className="mb-0"
                      labelAlign="left"
                      extra={isBooked && 'Time can be updated if no one booked'}
                      hasFeedback
                    >
                      {getFieldDecorator('businessHourStart', {
                        ...(selectedSession.businessHour && {
                          initialValue: moment(
                            selectedSession.businessHour.start,
                            format
                          ).format(format),
                        }),
                        rules: [
                          {
                            required: true,
                            message: 'business time is required',
                          },
                          {
                            validator: endHourValidation,
                          },
                        ],
                      })(
                        <Select
                          placeholder="Select a time slot"
                          disabled={isBooked}
                          onChange={modifyAvailableTimes}
                        >
                          {times.map(option => (
                            <Select.Option key={option} value={option}>
                              {formatTime(option, user)}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>

                  <Col xs={{ span: 24 }} sm={{ span: 12 }}>
                    <Form.Item labelAlign="left" hasFeedback>
                      {getFieldDecorator('businessHourEnd', {
                        ...(selectedSession.businessHour && {
                          initialValue: moment(
                            selectedSession.businessHour.end,
                            format
                          ).format(format),
                        }),
                        rules: [
                          {
                            required: true,
                            message: 'business time is required',
                          },
                          { validator },
                        ],
                      })(
                        <Select
                          placeholder="Select a time slot"
                          name="businessHourEnd"
                          disabled={isBooked}
                        >
                          {endTimes.map(option => (
                            <Select.Option key={option} value={option}>
                              {formatTime(option, user)}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            ) : (
              <Form.Item label="Time" hasFeedback>
                {getFieldDecorator('time', {
                  initialValue:
                    (formType === 'create' &&
                      calendarType === 'Weekly' &&
                      initial.startTime &&
                      moment(
                        `${initial.date.format('YYYY/MM/DD')} ${
                          initial.startTime
                        }`,
                        'YYYY/MM/DD HH:mm'
                      ).format('HH:mm')) ||
                    (formType === 'update' &&
                      moment(selectedSession.availability.start)
                        // .tz(user.timezone)
                        .format('HH:mm')) ||
                    null,
                  rules: [
                    {
                      required: true,
                      message: 'Select time slot',
                    },
                  ],
                  onChange: onChangeTime,
                })(
                  <Select name="time" placeholder="Select a time slot">
                    {availableTimes.map(option => (
                      <Select.Option
                        className="single-session-time"
                        key={option[0]}
                        value={option[0]}
                      >
                        {moment(option[0], 'hh:mm').format('hh:mm a')}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            )}
            <Form.Item label="Duration (mins)" hasFeedback>
              {getFieldDecorator('duration', {
                initialValue: setValue({
                  formType,
                  sessionType,
                  selectedSession,
                  field: 'duration',
                }),
                rules: [
                  {
                    required: true,
                    message: 'Duration can not be less than one minute',
                    validator: (rule, value, callback) => {
                      if (value && value > 0) {
                        callback();
                        return;
                      }
                      callback('Duration can not be less than one minute');
                    },
                  },
                ],
              })(
                <Input
                  type="number"
                  name="duration"
                  min="1"
                  placeholder="Time in min"
                  onChange={handleChange}
                />
              )}
            </Form.Item>
            <Form.Item label="Max Seats" hasFeedback>
              {getFieldDecorator('maxSeats', {
                initialValue: setValue({
                  formType,
                  sessionType,
                  selectedSession,
                  field: 'maxSeats',
                }),
                rules: [
                  {
                    required: true,
                    message: 'Max Seats should be greater than 0',
                    validator: (rule, value, callback) => {
                      if (value && value > 0) {
                        callback();
                        return;
                      }
                      callback('Max Seats should be greater than 0');
                    },
                  },
                ],
              })(
                <Input
                  type="number"
                  name="maxSeats"
                  min="1"
                  placeholder="Number of seats"
                  onChange={handleChange}
                />
              )}
            </Form.Item>
            <Form.Item label="Cost($)" hasFeedback>
              {getFieldDecorator('cost', {
                initialValue: setValue({
                  formType,
                  sessionType,
                  selectedSession,
                  field: 'cost',
                }),

                rules: [{ required: true }, { validator: checkPrice }],
              })(
                <Input
                  type="number"
                  name="cost"
                  placeholder="Cost of each session"
                  onChange={handleChange}
                />
              )}
            </Form.Item>
            <Form.Item label="Location" hasFeedback>
              {getFieldDecorator('location', {
                initialValue: setValue({
                  formType,
                  sessionType,
                  selectedSession,
                  field: 'location',
                }),
              })(
                <Input
                  type="text"
                  name="location"
                  placeholder="Session Location"
                  onChange={handleChange}
                />
              )}
            </Form.Item>
            <Form.Item label="Description" hasFeedback>
              {getFieldDecorator('description', {
                initialValue: setValue({
                  formType,
                  sessionType,
                  selectedSession,
                  field: 'description',
                }),
                rules: [{ required: false }],
              })(
                <TextArea
                  type="text"
                  name="description"
                  onChange={handleChange}
                />
              )}
            </Form.Item>
            <Form.Item label="Cover Image">
              {getFieldDecorator('coverImage')(
                <Upload
                  accept=".jpg,.jpeg,.png"
                  name="cover"
                  listType="picture-card"
                  showUploadList={false}
                  customRequest={() => {}}
                  fileList={null}
                  onChange={handleUploadChange}
                >
                  <div className="up-image-area">
                    {preview ? (
                      <>
                        <Button
                          icon="close"
                          shape="circle"
                          className="delete-image"
                          type="danger"
                          size="large"
                          onClick={async e => {
                            e.stopPropagation();
                            if (preview.includes('http')) {
                              await handleDeleteImage();
                            } else {
                              setPreview(null);
                            }
                          }}
                        />

                        <CoverImage src={preview} />
                      </>
                    ) : (
                      <Icon type={UploadIcon} />
                    )}
                  </div>
                </Upload>
              )}
            </Form.Item>
          </div>
        </ScrollDiv>
        {formType === 'update' ? (
          <div className="session-form-btn">
            <Button
              style={{
                marginRight: 8,
              }}
              type="info"
              loading={remainderLoading}
              onClick={async () =>
                sendRemainder({ variables: { id: selectedSession.id } })
              }
            >
              <Icon type={Notification} />
              Send Remainder
            </Button>
            <Button
              style={{
                marginRight: 8,
              }}
              type="info"
              onClick={() => dispatch(toggleShareModal(true))}
            >
              <Icon type={ShareAlt} />
              Share
            </Button>
            {!isBooked && (
              <ItemDelete
                text="Session"
                submitDelete={submitDelete}
                placement="topRight"
              >
                <Button
                  style={{
                    marginRight: 8,
                  }}
                  type="danger"
                >
                  {deleteLoading ? <ButtonLoading /> : <Icon type={Delete} />}
                  Delete
                </Button>
              </ItemDelete>
            )}

            <Button type="primary" htmlType="submit" onClick={handleSubmit}>
              {loading ? <ButtonLoading /> : <Icon type={Save} />}
              Save
            </Button>
          </div>
        ) : (
          <div className="session-form-btn">
            <Button
              style={{
                marginRight: 8,
              }}
              onClick={handleCancel}
            >
              <Icon type={RollBack} />
              Cancel
            </Button>

            <Button
              style={{
                marginRight: 8,
              }}
              onClick={() => {
                form.resetFields();
                dispatch(setSessionType({}));
              }}
            >
              <Icon type={Retweet} />
              Reset
            </Button>
            <Button type="primary" htmlType="submit" onClick={handleSubmit}>
              {createLoading ? <ButtonLoading /> : <Icon type={Save} />}
              Save
            </Button>
          </div>
        )}
      </Form>
      <Modal
        title="Create New Session Type"
        visible={visible}
        onCancel={cancelModal}
        destroyOnClose
        footer={null}
      >
        <SessionTypeForm
          handleOk={() => {
            close();
          }}
          handleCancel={cancelModal}
          initial={sessionTypeObj}
          visible={visible}
          type="create"
          page="calendar"
        />
      </Modal>
    </>
  );
});

export default SessionForm;
