import React, { useEffect } from 'react';
import { useQuery } from 'react-apollo';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Skeleton from 'antd/lib/skeleton';
import Card from 'antd/lib/card';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useSelector } from 'react-redux';

import { BOOKING } from 'src/resolvers/booking/query';
import NotFound from 'src/components/404';

import ChangeTimeSlot from './components/ChangeTimeSlot';
import BookingDetails from './components/BookingDetails';
import PaymentDetails from './components/PaymentDetails ';

import 'antd/lib/row/style';
import 'antd/lib/col/style';
import 'antd/lib/skeleton/style';
import 'antd/lib/card/style';

const Booking = ({
  match: {
    params: { bookingId },
  },
}) => {
  const activityState = useSelector(state => state.uiState.activity);

  const { data, loading, error, refetch } = useQuery(BOOKING, {
    variables: { id: bookingId },
  });

  useEffect(() => {
    const { type } = activityState;
    if (type === 'SESSION') {
      refetch({
        variables: { id: bookingId },
      });
    }
  }, [activityState, bookingId, refetch]);

  if (error) return <NotFound message="Booking not found!" />;
  return (
    <Row gutter={[16, 16]}>
      <Col
        sm={{ span: 24 }}
        md={{ span: 24 }}
        lg={{ span: 24 }}
        xl={{ span: 16 }}
      >
        {loading ? (
          <Card>
            <Skeleton active paragraph={{ rows: 5 }} />
          </Card>
        ) : (
          <>
            <Card title="Booking Details" bodyStyle={{ padding: 1 }}>
              <PerfectScrollbar>
                <div style={{ minWidth: 480 }}>
                  <BookingDetails booking={data.booking} />
                </div>
              </PerfectScrollbar>
            </Card>
            <br />
            <Card title="Payment Details" bodyStyle={{ padding: 1 }}>
              <PerfectScrollbar>
                <div style={{ minWidth: 480 }}>
                  <PaymentDetails
                    customer={data.booking.customer}
                    charge={data.booking.charge}
                  />
                </div>
              </PerfectScrollbar>
            </Card>
          </>
        )}
      </Col>
      <Col
        sm={{ span: 24 }}
        md={{ span: 24 }}
        lg={{ span: 24 }}
        xl={{ span: 8 }}
      >
        {loading ? (
          <Card>
            <Skeleton active />
          </Card>
        ) : (
          <Card title="Change Time Slot">
            <ChangeTimeSlot
              session={data.booking.session}
              timeSlot={data.booking.timeSlot}
              id={data.booking.id}
            />
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default Booking;
