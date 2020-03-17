import React from 'react';

import Row from 'antd/lib/row';
import 'antd/lib/row/style';

import BookingList from './componennts/BookingList';

const CustomerDashboard = () => {
  return (
    <Row gutter={[16, 16]}>
      <BookingList />
    </Row>
  );
};

export default CustomerDashboard;
