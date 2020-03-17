import React from 'react';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import List from 'antd/lib/list';
import 'antd/lib/list/style';
import Avatar from 'antd/lib/avatar';
import 'antd/lib/avatar/style';
import Skeleton from 'antd/lib/skeleton';
import Schedule from '@ant-design/icons-svg/lib/asn/ScheduleOutlined';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { useWindowSize } from '@reach/window-size';
import moment from 'custom-moment';

import Icon from 'src/components/Icon';
import { ProfileImage } from 'src/components/Image';
import { BOOKINGS_BY_CUSTOMER } from 'src/resolvers/booking/query';
import { formatTime } from 'src/utils/date';

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

const BookingList = ({ match: { path } }) => {
  const { width: windowWidth } = useWindowSize();
  const username = path.split('/')[1];

  const customerId = useSelector(store => store.authState.user.id);

  const { data, loading } = useQuery(BOOKINGS_BY_CUSTOMER, {
    variables: { customerId, username },
  });
  if (loading) {
    return <Skeleton avatar active paragraph={{ rows: 2 }} />;
  }
  const {
    bookingsByCustomer: { bookings },
  } = data;

  return (
    <Card
      title={`Booking list ${
        bookings.length > 0 ? `(${bookings.length})` : ''
      }`}
    >
      <List
        dataSource={bookings}
        renderItem={({ session, timeSlot, charge, id }) => (
          <List.Item
            key={id}
            extra={session.cost ? `$${session.cost}` : 'Free'}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  style={{ background: '#00a2ae' }}
                  size={windowWidth > 575 ? 48 : 30}
                >
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
        )}
      />
    </Card>
  );
};

export default withRouter(BookingList);
