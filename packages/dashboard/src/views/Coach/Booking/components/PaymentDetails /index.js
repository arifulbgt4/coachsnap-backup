import React from 'react';
import moment from 'custom-moment';
import Descriptions from 'antd/lib/descriptions';

import centToDollar from 'src/utils/cent-to-dollar';

import 'antd/lib/descriptions/style';
import './style.less';

const format = 'dddd, MMMM Do YYYY, h:mm a';

const Details = ({ customer, charge }) => {
  return (
    <Descriptions bordered>
      <Descriptions.Item label="Customer name" span={2}>
        {customer.name}
      </Descriptions.Item>
      <Descriptions.Item label="Customer email" span={2}>
        {customer.email}
      </Descriptions.Item>
      {charge && (
        <>
          <Descriptions.Item label="Charge ID" span={2}>
            {charge.id}
          </Descriptions.Item>
          <Descriptions.Item label="Charge At" span={2}>
            {moment(charge.createdAt).format(format)}
          </Descriptions.Item>
          <Descriptions.Item label="Currency" span={2}>
            {charge.currency}
          </Descriptions.Item>
          <Descriptions.Item label="Refunded" span={2}>
            {charge.refunded ? 'Yes' : 'No'}
          </Descriptions.Item>
          <Descriptions.Item label="Charged amount" span={2}>
            ${centToDollar(charge.amount)}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={4}>
            {charge.description}
          </Descriptions.Item>
        </>
      )}
    </Descriptions>
  );
};

export default Details;
