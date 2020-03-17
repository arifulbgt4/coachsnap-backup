import React from 'react';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';

import CustomerList from './components/List';
import CustomerDetails from './components/Details';
import Bookings from './components/Bookings';

const CoachManagement = () => {
  return (
    <Row gutter={[16, 16]}>
      <Col lg={{ span: 24 }} xl={{ span: 8 }}>
        <CustomerList />
      </Col>
      <Col lg={{ span: 24 }} xl={{ span: 8 }}>
        {/* TODO: Show skeleton */}
        <CustomerDetails />
      </Col>
      <Col lg={{ span: 24 }} xl={{ span: 8 }}>
        {/* TODO: Show skeleton */}
        <Bookings />
      </Col>
    </Row>
  );
};

export default CoachManagement;
