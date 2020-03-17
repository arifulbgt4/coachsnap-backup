import React, { useEffect } from 'react';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Skeleton from 'antd/lib/skeleton';
import 'antd/lib/skeleton/style';
import { useQuery } from '@apollo/react-hooks';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { SESSION } from 'src/resolvers/session/query';
import NotFound from 'src/components/404';
import useActivitySubscription from 'src/hooks/useActivitySubscription';

import SessionInfo from '../components/SessionInfo';
import Form from './components/Form';

const BookSession = ({
  match: {
    params: { sessionId },
  },
}) => {
  const { data, error, loading, refetch } = useQuery(SESSION, {
    variables: { id: sessionId },
  });
  const activityState = useSelector(state => state.uiState.activity);

  useEffect(() => {
    const { type } = activityState;
    if (type === 'SESSION') {
      refetch({
        variables: { id: sessionId },
      });
    }
  }, [activityState, refetch, sessionId]);

  useActivitySubscription(data && data.session.coach.id);

  if (error) return <NotFound message="Session not found!" />;

  return (
    <Row gutter={[16, 16]}>
      <Col sm={24} md={24} lg={8} xl={{ span: 6, offset: 3 }}>
        <SessionInfo data={data} />
      </Col>
      <Col sm={24} md={24} lg={16} xl={12}>
        {loading ? (
          <Card>
            <Skeleton active />
          </Card>
        ) : (
          data && <Form data={data} />
        )}
      </Col>
    </Row>
  );
};

export default withRouter(BookSession);
