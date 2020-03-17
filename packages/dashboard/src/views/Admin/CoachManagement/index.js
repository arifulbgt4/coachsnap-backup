import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

import 'antd/lib/row/style';
import 'antd/lib/col/style';

import CoachTable from './components/CoachTable';
import Create from './components/Create';

const CoachManagement = () => {
  return (
    <Row gutter={[16, 16]}>
      <Col lg={{ span: 24 }} xl={{ span: 8 }}>
        <Create />
      </Col>
      <Col lg={{ span: 24 }} xl={{ span: 16 }}>
        <CoachTable />
      </Col>
    </Row>
  );
};

export default CoachManagement;
