import React, { useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useSelector } from 'react-redux';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Statistic from 'antd/lib/statistic';
import Skeleton from 'antd/lib/skeleton';
import Card from 'antd/lib/card';
import Calendar from '@ant-design/icons-svg/lib/asn/CalendarOutlined';
import Dollar from '@ant-design/icons-svg/lib/asn/DollarCircleOutlined';
import UserGroup from '@ant-design/icons-svg/lib/asn/UsergroupAddOutlined';
import Icon from 'src/components/Icon';

import { COACH_SESSIONS } from 'src/resolvers/session/query';
import { CUSTOMERS_OF_COACH } from 'src/resolvers/user/query';
import { COACH_SUMMARY } from 'src/resolvers/payment/query';

import 'antd/lib/row/style';
import 'antd/lib/col/style';
import 'antd/lib/statistic/style';
import 'antd/lib/card/style';
import 'antd/lib/skeleton/style';

const SingleCoach = ({ coachId }) => {
  const activityState = useSelector(state => state.uiState.activity);

  const {
    data: sessionData,
    loading: sessionLoading,
    refetch: refetchSessions,
  } = useQuery(COACH_SESSIONS, {
    variables: { where: { coach: { id: coachId } } },
  });

  const {
    data: customersData,
    loading: customersLoading,
    refetch: refetchCoach,
  } = useQuery(CUSTOMERS_OF_COACH, { variables: { coachId } });

  const {
    data: coachData,
    loading: coachLoading,
    refetch: refetchSummary,
  } = useQuery(COACH_SUMMARY, {
    variables: { coachId },
  });

  useEffect(() => {
    const { type } = activityState;
    if (type === 'SESSION') {
      refetchSessions({
        variables: { where: { coach: { id: coachId } } },
      });
      refetchCoach({
        variables: { coachId },
      });
      refetchSummary({
        variables: { coachId },
      });
    }
  }, [activityState, coachId, refetchCoach, refetchSessions, refetchSummary]);

  return (
    <Row gutter={[16, 16]}>
      <Col md={8}>
        <Card>
          {sessionLoading ? (
            <Skeleton active paragraph={{ rows: 2 }} title={false} />
          ) : (
            <Statistic
              title={
                <>
                  <Icon type={Calendar} /> Total Sessions
                </>
              }
              value={sessionData.getCoachSessions.count}
            />
          )}
        </Card>
      </Col>
      <Col md={8}>
        <Card>
          {customersLoading ? (
            <Skeleton active paragraph={{ rows: 2 }} title={false} />
          ) : (
            <Statistic
              title={
                <>
                  <Icon type={UserGroup} /> Total Customers
                </>
              }
              value={customersData.customersOfCoach.count}
            />
          )}
        </Card>
      </Col>
      <Col md={8}>
        <Card>
          {coachLoading ? (
            <Skeleton active paragraph={{ rows: 2 }} title={false} />
          ) : (
            <Statistic
              title={
                <>
                  <Icon type={Dollar} /> Net Income
                </>
              }
              value={coachData.coachSummary.totalEarning}
            />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default SingleCoach;
