import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Empty from 'antd/lib/empty';
import 'antd/lib/empty/style';
import { useLazyQuery } from 'react-apollo';
import Skeleton from 'antd/lib/skeleton';

import ScrollDiv from 'src/components/ScrollDiv';
import { BOOKINGS_BY_CUSTOMER } from 'src/resolvers/booking/query';
import BookingList from './components/BookingList';

const Bookings = () => {
  const activityState = useSelector(state => state.uiState.activity);
  const id = useSelector(state => state.customerState.customer.id);

  const [customerBookings, { data, loading }] = useLazyQuery(
    BOOKINGS_BY_CUSTOMER,
    {
      fetchPolicy: 'network-only',
    }
  );
  const title = 'BOOKINGS';
  useEffect(() => {
    if (id) {
      customerBookings({ variables: { customerId: id } });
    }
  }, [customerBookings, id]);

  useEffect(() => {
    const { type } = activityState;
    if (type === 'SESSION') {
      // Refetch is not defined until customerBookings runs. But we don't that when no customer is selected. SO running the lazyQuery again
      customerBookings({ variables: { customerId: id } });
    }
  }, [activityState, customerBookings, id]);

  if (!id || !data) {
    return (
      <Card
        hoverable
        title={title}
        style={{ cursor: 'default' }}
        bodyStyle={{ padding: 20 }}
      >
        <ScrollDiv height={220}>
          {loading ? (
            <Skeleton avatar active paragraph={{ rows: 2 }} />
          ) : (
            <Empty description="No bookings" />
          )}
        </ScrollDiv>
      </Card>
    );
  }

  const totalIncome = data.bookingsByCustomer.bookings
    .filter(b => b.charge)
    .reduce((c, b) => c + b.charge.amount, 0);

  return (
    <Card
      hoverable
      title={`${title} ${
        data.bookingsByCustomer.count > 0
          ? ` (${data.bookingsByCustomer.count})`
          : ''
      }`}
      style={{ cursor: 'default' }}
      bodyStyle={{ padding: 20 }}
    >
      <ScrollDiv height={240} resAuto>
        <BookingList
          bookings={data.bookingsByCustomer.bookings}
          customerId={id}
        />
      </ScrollDiv>
      <strong>Total Income</strong>: ${+(totalIncome / 100).toFixed(2)}
    </Card>
  );
};

export default Bookings;
