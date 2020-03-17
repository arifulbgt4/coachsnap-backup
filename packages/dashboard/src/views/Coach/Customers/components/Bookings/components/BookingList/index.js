import React from 'react';
import moment from 'custom-moment';

import { Link } from 'react-router-dom';
import List from 'antd/lib/list';
import Avatar from 'antd/lib/avatar';
import Schedule from '@ant-design/icons-svg/lib/asn/ScheduleOutlined';
import Edit from '@ant-design/icons-svg/lib/asn/EditOutlined';

import Icon from 'src/components/Icon';
import { formatTime } from 'src/utils/date';

import 'antd/lib/list/style';
import 'antd/lib/avatar/style';
import { ProfileImage } from 'src/components/Image';

const Description = ({
  session: { availability, singleEvent },
  timeSlot,
  charge,
}) => {
  const date = moment(availability.start).format('ddd MMM DD, YYYY');
  return (
    <div>
      {date} -{' '}
      {singleEvent
        ? moment(availability.start).format('h:mm a')
        : formatTime(timeSlot)}
      <p>{singleEvent ? 'Single event' : 'Block event'}</p>
      <p>
        {charge ? (
          <span style={{ color: '#2ecc71' }}>Paid</span>
        ) : (
          <span style={{ color: '#e74c3c' }}>Not paid</span>
        )}
      </p>
    </div>
  );
};

const BookingList = ({ bookings, customerId }) => {
  return (
    <List
      itemLayout="horizontal"
      dataSource={bookings}
      renderItem={item => {
        const { session, timeSlot, charge, id } = item;
        return (
          <Link to={`/coach/customers/c/${customerId}/${id}`}>
            <List.Item actions={[<Icon type={Edit} />]}>
              <List.Item.Meta
                avatar={
                  <Avatar style={{ background: '#00a2ae' }}>
                    {session.coverImage.url.length ? (
                      <ProfileImage src={session.coverImage.url} width="50" />
                    ) : (
                      <Icon type={Schedule} />
                    )}
                  </Avatar>
                }
                title={session.name}
                description={
                  <Description
                    session={session}
                    timeSlot={timeSlot}
                    charge={charge}
                  />
                }
              />
            </List.Item>
          </Link>
        );
      }}
    />
  );
};

export default BookingList;
