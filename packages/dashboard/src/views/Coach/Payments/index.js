import React, { memo } from 'react';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Table from 'antd/lib/table';
import 'antd/lib/table/style';
import 'antd/lib/select/style';
import { useSelector } from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';

import centToDollar from 'src/utils/cent-to-dollar';
import ToggleStripeConnectBtn from './components/ToggleConnectStripe';
import Filter from './components/Filter';
import Refund from './components/Refund';

import './style.less';

const CoachPayments = () => {
  const payments = useSelector(store => store.paymentState.payments);

  const tableColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: centToDollar,
    },
    {
      title: 'Application Fee',
      dataIndex: 'application_fee_amount',
      render: centToDollar,
    },
    {
      title: 'Currency',
      dataIndex: 'currency',
      render: currency => currency.toUpperCase(),
    },
    {
      title: 'Refund',
      dataIndex: 'id',
      render: (id, charge) =>
        charge.refunded ? 'Refunded' : <Refund id={id} charge={charge} />,
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card
          className="coach-transaction"
          title={
            <>
              <ToggleStripeConnectBtn />
              <Filter />
            </>
          }
        >
          <PerfectScrollbar>
            <Table
              dataSource={payments}
              columns={tableColumns}
              rowKey="id"
              style={{ minWidth: 800 }}
            />
          </PerfectScrollbar>
        </Card>
      </Col>
    </Row>
  );
};

export default memo(CoachPayments);
