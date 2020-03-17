import React from 'react';
import { connect } from 'react-redux';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Avatar from 'antd/lib/avatar';
import 'antd/lib/avatar/style';
import Dollar from '@ant-design/icons-svg/lib/asn/DollarCircleOutlined';
import Clock from '@ant-design/icons-svg/lib/asn/ClockCircleOutlined';
import Reconciliation from '@ant-design/icons-svg/lib/asn/ReconciliationOutlined';
import Environment from '@ant-design/icons-svg/lib/asn/EnvironmentOutlined';
import Calendar from '@ant-design/icons-svg/lib/asn/CalendarOutlined';
import User from '@ant-design/icons-svg/lib/asn/UserOutlined';
import Icon from 'src/components/Icon';
import Skeleton from 'antd/lib/skeleton';
import 'antd/lib/skeleton/style';

import randomBackground from 'src/utils/random-background';
import { concatTimeWithDate } from 'src/utils/date';
import NotFound from 'src/components/404';
import { CoverImage } from 'src/components/Image';

import './style.less';

const moment = require('custom-moment');
const { mockTimezoneGuess } = require('custom-moment/utils');

const SessionInfo = ({ data, confirm }) => {
  if (!data)
    return (
      <Card>
        <Skeleton active />
      </Card>
    );

  const {
    name: sessionName,
    description,
    location,
    availability: { start, end },
    businessHour,
    singleEvent,
    coach,
    coverImage,
    cost,
  } = confirm ? data.booking.session : data.session;
  const { name: coachName, profileImage, timezone } = coach;

  const startTime = singleEvent
    ? mockTimezoneGuess(start, timezone).format('ddd MMM DD, YYYY hh:mm a')
    : mockTimezoneGuess(
        concatTimeWithDate(start, businessHour.start),
        timezone
      ).format('ddd MMM DD, YYYY hh:mm a');

  const endTime = singleEvent
    ? mockTimezoneGuess(end, timezone).format('hh:mm a')
    : mockTimezoneGuess(
        concatTimeWithDate(end, businessHour.end),
        timezone
      ).format('hh:mm a');

  const durationInUtc = moment(end).diff(moment(start), 'minutes') + 1;

  return (
    <Card
      className="booking-session-sidebar"
      cover={<CoverImage src={coverImage.url || randomBackground()} />}
    >
      {confirm && (
        <div className="confirm-text">
          <Avatar className="booking-page-profile" size={100}>
            {profileImage?.url ? (
              <img src={profileImage.url} alt={profileImage.url} />
            ) : (
              <Icon type={User} className="user" />
            )}
          </Avatar>
          <strong>Confirmed</strong>
          <p>
            You are scheduled with
            {` ${coachName}`}
          </p>
        </div>
      )}
      <div className={`contents ${confirm && 'confirm'}`}>
        {!confirm && (
          <>
            <Avatar size={100}>
              {profileImage?.url ? (
                <img src={profileImage.url} alt={profileImage.url} />
              ) : (
                <Icon type={User} className="user" />
              )}
            </Avatar>
            {!confirm && <strong>{coachName}</strong>}
          </>
        )}
        <h2>{sessionName}</h2>
        <p>{description || 'No description'}</p>
        <ul>
          <li>
            <Icon type={Dollar} />
            <span>{cost} USD</span>
          </li>
          <li>
            <Icon type={Clock} />
            <span>{durationInUtc} mins</span>
          </li>
          <li>
            <Icon type={Environment} />
            <span>{location || 'No location'}</span>
          </li>
          <li>
            <Icon type={Reconciliation} />
            <span>{singleEvent ? 'Single event' : 'Block event'}</span>
          </li>
          <li className="session-time">
            <Icon type={Calendar} />
            <span>{` ${startTime} - ${endTime}`}</span>
          </li>
        </ul>
        {confirm && (
          <h3 style={{ color: '#1890ff' }}>
            A calendar invitation has been sent to your email address
          </h3>
        )}
      </div>
    </Card>
  );
};

const mapStateToProps = state => ({
  booking: state.customerState.booking,
});

export default connect(mapStateToProps, {})(SessionInfo);
