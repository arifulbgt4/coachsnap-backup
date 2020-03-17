import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Table from 'antd/lib/table';
import Select from 'antd/lib/select';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Card from 'antd/lib/card';
import PerfectScrolbar from 'react-perfect-scrollbar';
import { useLazyQuery } from '@apollo/react-hooks';

import { ADMIN_PAYMENTS } from 'src/resolvers/payment/query';
import { setTransactions } from 'src/state/ducks/payments/actions';

import 'antd/lib/table/style';
import 'antd/lib/select/style';
import 'antd/lib/row/style';
import 'antd/lib/col/style';
import 'antd/lib/card/style';
import './style.less';

const moment = require('custom-moment');

const { Option } = Select;

const Payments = () => {
  const dispatch = useDispatch();
  const [incomeSpan, setIncomeSpan] = useState(7);
  const payments = useSelector(store => store.paymentState.payments);

  const [getCoachPayments, { data }] = useLazyQuery(ADMIN_PAYMENTS);

  useEffect(() => {
    const date = moment();
    const startDate = date.format();
    const endDate = date.subtract(incomeSpan, 'days').format();
    getCoachPayments({
      variables: {
        where: {
          AND: [{ createdAt_lte: startDate }, { createdAt_gte: endDate }],
        },
      },
    });
    if (data) {
      dispatch(setTransactions(data.adminPayments.charges));
    }
  }, [data, dispatch, getCoachPayments, incomeSpan]);

  const income = payments
    .filter(c => !c.refunded)
    .reduce((inc, ch) => inc + Number(ch.application_fee_amount), 0);

  const centToDollar = amount => +(amount / 100).toFixed(2);
  const spanSelect = (
    <span className="admin-payment-action">
      {centToDollar(income)} USD in last
      <Select
        defaultValue={incomeSpan}
        onChange={value => setIncomeSpan(Number(value))}
      >
        <Option value="1">1</Option>
        <Option value="3">2</Option>
        <Option value="7">7</Option>
        <Option value="15">15</Option>
        <Option value="30">30</Option>
      </Select>
      day{incomeSpan > 1 && 's'}
    </span>
  );

  const cardTitle = <span>Transactions {spanSelect}</span>;

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
      title: '',
      dataIndex: 'refunded',
      render: refunded => (refunded ? 'REFUNDED' : ''),
    },
  ];
  const table = (
    <PerfectScrolbar>
      <Table
        dataSource={payments}
        columns={tableColumns}
        rowKey="id"
        style={{ minWidth: 800 }}
      />
    </PerfectScrolbar>
  );

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card title={cardTitle} className="admin-transaction">
          {table}
        </Card>
      </Col>
    </Row>
  );
};

export default Payments;
