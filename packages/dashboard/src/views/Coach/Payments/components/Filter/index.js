import React, { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'antd/lib/select';

import { COACH_PAYMENTS } from 'src/resolvers/payment/query';
import { setTransactions } from 'src/state/ducks/payments/actions';
import centToDollar from 'src/utils/cent-to-dollar';

import 'antd/lib/select/style';

import './style.less';

const moment = require('custom-moment');

const { Option } = Select;

const Filter = () => {
  const dispatch = useDispatch();
  const [incomeSpan, setIncomeSpan] = useState(7);
  const payments = useSelector(store => store.paymentState.payments);

  const [getCoachPayments, { data }] = useLazyQuery(COACH_PAYMENTS);

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
      dispatch(setTransactions(data.coachPayments.charges));
    }
  }, [data, dispatch, getCoachPayments, incomeSpan]);

  const income = payments
    .filter(c => !c.refunded)
    .reduce((prev, cur) => prev + cur.amount, 0);
  return (
    <span className="transaction-filter">
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
};

export default Filter;
