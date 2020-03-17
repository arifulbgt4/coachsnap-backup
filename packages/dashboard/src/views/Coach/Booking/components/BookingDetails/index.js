import React from 'react';
import moment from 'custom-moment';
import Descriptions from 'antd/lib/descriptions';
import Badge from 'antd/lib/badge';

import { concatTimeWithDate } from 'src/utils/date';

import 'antd/lib/descriptions/style';
import 'antd/lib/badge/style';
import './style.less';

const format = 'dddd, MMMM Do YYYY, h:mm a';

const Details = ({ booking }) => {
  const {
    id,
    createdAt,
    charge,
    timeSlot,
    session: { cost, description, name, availability, singleEvent },
  } = booking;

  return (
    <Descriptions bordered>
      <Descriptions.Item label="ID" span={2}>
        {id}
      </Descriptions.Item>
      <Descriptions.Item label="Status" span={2}>
        <Badge
          status={charge ? 'success' : 'error'}
          text={charge ? 'Paid' : 'Non paid'}
        />
      </Descriptions.Item>
      <Descriptions.Item label="Cost" span={2}>
        ${cost}
      </Descriptions.Item>
      <Descriptions.Item label="Ordered At" span={2}>
        {moment(createdAt).format(format)}
      </Descriptions.Item>
      <Descriptions.Item label="Session name" span={2}>
        {name}
      </Descriptions.Item>
      <Descriptions.Item label="Session time" span={2}>
        {singleEvent
          ? moment(availability.start).format(format)
          : moment(concatTimeWithDate(availability.start, timeSlot)).format(
              format
            )}
      </Descriptions.Item>
      <Descriptions.Item label="Event type" span={2}>
        {singleEvent ? 'Single' : 'Block'}
      </Descriptions.Item>
      <Descriptions.Item label="Session details" span={4}>
        {description.length ? description : 'No description'}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default Details;
