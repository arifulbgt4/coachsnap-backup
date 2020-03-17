import React from 'react';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import { useQuery } from '@apollo/react-hooks';

import Fallback from 'src/components/Fallback';
import Alert from 'src/components/Alert';
import { COACHES } from 'src/resolvers/user/query';

import Coach from './components/CoachCard';

import './style.less';

const CoachList = ({ location }) => {
  const { data, loading } = useQuery(COACHES, { fetchPolicy: 'network-only' });
  if (loading) return <Fallback />;
  return (
    <>
      <Row gutter={[{ lg: 32 }]}>
        {location.state && (
          <Col span={24}>
            <Alert type="success">{location.state.message}</Alert>
          </Col>
        )}
      </Row>
      <Row gutter={[{ xs: 6, sm: 12, md: 24 }, 24]} className="coach-cards-row">
        {data.coaches.coaches.length ? (
          data.coaches.coaches.map(coach => <Coach key={coach.id} {...coach} />)
        ) : (
          <h1 style={{ textAlign: 'center' }}>Welcome to CoachSnap</h1>
        )}
      </Row>
    </>
  );
};

export default CoachList;
