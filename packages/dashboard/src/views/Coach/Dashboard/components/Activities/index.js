import React, { useEffect } from 'react';
import List from 'antd/lib/list';
import 'antd/lib/list/style';
import Avatar from 'antd/lib/avatar';
import 'antd/lib/avatar/style';
import Skeleton from 'antd/lib/skeleton';
import 'antd/lib/skeleton/style';
import Empty from 'antd/lib/empty';
import 'antd/lib/empty/style';
import Icon from 'src/components/Icon';
import Calendar from '@ant-design/icons-svg/lib/asn/CalendarOutlined';
import User from '@ant-design/icons-svg/lib/asn/UserOutlined';
import Schedule from '@ant-design/icons-svg/lib/asn/ScheduleOutlined';
import { useQuery } from '@apollo/react-hooks';
import { useSelector } from 'react-redux';

import ScrollDiv from 'src/components/ScrollDiv';
import { COACH_ACTIVITIES } from 'src/resolvers/activity/query';
import { getWeekDay } from 'src/utils/date';

import './style.less';

const moment = require('custom-moment');

const { weekStart, weekEnd } = getWeekDay();

const SessionTypeList = () => {
  const activityState = useSelector(state => state.uiState.activity);
  const user = useSelector(store => store.authState.user);

  const { data, loading, refetch } = useQuery(COACH_ACTIVITIES, {
    variables: {
      where: {
        AND: [{ createdAt_gte: weekStart }, { createdAt_lte: weekEnd }],
      },
    },
  });

  useEffect(() => {
    refetch({
      variables: {
        where: {
          AND: [{ createdAt_gte: weekStart }, { createdAt_lte: weekEnd }],
        },
      },
    });
  }, [activityState, refetch]);

  if (loading) {
    return <Skeleton active />;
  }
  if (!data) {
    return <Empty description="No Activity to Display" />;
  }
  return (
    <ScrollDiv height={338}>
      <List
        dataSource={data.activities}
        size="small"
        className="session-type-list activities"
        renderItem={({ createdAt, content: { type, message } }) => {
          let icon = Calendar;
          let color = '#000';
          if (message.includes('removed') || message.includes('deleted')) {
            color = '#fd5d60';
          }
          if (message.includes('updated') || message.includes('edited')) {
            color = '#ffc552';
          }

          if (type.includes('Customer')) {
            icon = User;
          }
          if (type === 'New Appt.') {
            icon = Schedule;
            color = '#038f3ef2';
          }
          if (type === 'Created') {
            color = '#516cf0';
          }
          return (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar style={{ background: '#00a2ae' }}>
                    <Icon type={icon} />
                  </Avatar>
                }
                title={
                  <span style={{ color }}>
                    <strong>{type} </strong>
                    {message}
                  </span>
                }
                description={moment(createdAt)
                  .tz(user.timezone)
                  .fromNow()}
              />
            </List.Item>
          );
        }}
      />
    </ScrollDiv>
  );
};

export default SessionTypeList;
