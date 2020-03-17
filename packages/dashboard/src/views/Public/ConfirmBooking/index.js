import React from 'react';
import { connect } from 'react-redux';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import Layout from 'antd/lib/layout';
import 'antd/lib/layout/style';

import { withRouter } from 'react-router-dom';
import { useQuery } from 'react-apollo';

import NotFound from 'src/components/404';
import { BOOKING } from 'src/resolvers/booking/query';

import SessionInfo from '../components/SessionInfo';

import './style.less';

const { Content } = Layout;

const ConfirmBooking = ({
  match: {
    params: { bookingId },
  },
  booking,
}) => {
  const { data, error } = booking
    ? useQuery(BOOKING, { variables: { id: bookingId } })
    : '';

  if (error || !booking) return <NotFound message="Booking not found!" />;

  return (
    <Content style={{ margin: '60px 0 0' }}>
      <Row>
        <Col
          sxs={24}
          sm={24}
          md={{ span: 16, offset: 4 }}
          lg={{ span: 12, offset: 6 }}
          xl={{ span: 8, offset: 8 }}
        >
          <SessionInfo data={data} confirm />
        </Col>
      </Row>
    </Content>
  );
};

const mapStateToProps = state => ({
  booking: state.customerState.booking,
});

export default withRouter(connect(mapStateToProps, {})(ConfirmBooking));
