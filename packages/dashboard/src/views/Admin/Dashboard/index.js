import React from 'react';
import { useQuery } from 'react-apollo';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import Icon from 'src/components/Icon';
import Dollar from '@ant-design/icons-svg/lib/asn/DollarCircleOutlined';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Statistic from 'antd/lib/statistic';
import 'antd/lib/statistic/style';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Skeleton from 'antd/lib/skeleton';

import { ADMIN_SUMMARY } from 'src/resolvers/payment/query';

const Dashboard = () => {
  const { loading, data: { adminSummary } = {} } = useQuery(ADMIN_SUMMARY);

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

  return (
    <Row gutter={[16, 16]}>
      <Col md={8}>
        <Card>
          <Statistic
            title="Number of Purchases"
            value={adminSummary.totalBookings}
          />
        </Card>
      </Col>
      <Col md={8}>
        <Card>
          <Statistic
            title="Last 30 days' Earning"
            prefix={<Icon type={Dollar} />}
            value={adminSummary.last30DaysEarning}
          />
        </Card>
      </Col>
      <Col md={8}>
        <Card>
          <Statistic
            title="Total Earning"
            prefix={<Icon type={Dollar} />}
            value={adminSummary.totalEarning}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default Dashboard;
