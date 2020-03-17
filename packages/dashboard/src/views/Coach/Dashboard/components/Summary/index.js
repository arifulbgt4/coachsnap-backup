import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import Dollar from '@ant-design/icons-svg/lib/asn/DollarCircleOutlined';
import Icon from 'src/components/Icon';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Statistic from 'antd/lib/statistic';
import 'antd/lib/statistic/style';
import Skeleton from 'antd/lib/skeleton';
import 'antd/lib/skeleton/style';
import { useQuery } from '@apollo/react-hooks';

import { COACH_SUMMARY } from 'src/resolvers/payment/query';

function Summary() {
  const activityState = useSelector(state => state.uiState.activity);

  const { loading, data, refetch } = useQuery(COACH_SUMMARY);

  useEffect(() => {
    const { type } = activityState;
    if (type === 'SESSION') {
      refetch();
    }
  }, [activityState, refetch]);

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {['a', 'b', 'c'].map(i => (
          <Col md={8} key={i}>
            <Card>
              <Skeleton active paragraph={{ rows: 2 }} title={false} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }
  const { totalBookings, last30DaysEarning, totalEarning } = data.coachSummary;
  return (
    <Row gutter={[16, 16]}>
      <Col md={8}>
        <Card>
          <Statistic title="Number of Purchases" value={totalBookings} />
        </Card>
      </Col>
      <Col md={8}>
        <Card>
          <Statistic
            title="Last 30 days' Earning"
            prefix={<Icon type={Dollar} />}
            value={last30DaysEarning}
          />
        </Card>
      </Col>
      <Col md={8}>
        <Card>
          <Statistic
            title="Total Earning"
            prefix={<Icon type={Dollar} />}
            value={totalEarning}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default Summary;
