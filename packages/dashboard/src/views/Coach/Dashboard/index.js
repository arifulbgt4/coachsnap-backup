import React, { useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useSelector } from 'react-redux';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import Skeleton from 'antd/lib/skeleton';
import 'antd/lib/skeleton/style';

import SessionList from 'src/components/SessionList';
import { COACH_SESSIONS } from 'src/resolvers/session/query';

import { getWeekDay } from 'src/utils/date';
import ScrollDiv from 'src/components/ScrollDiv';
import ActivityList from './components/Activities';
import Summary from './components/Summary';

const { weekStart, weekEnd } = getWeekDay();

const CoachDashboard = () => {
  const user = useSelector(state => state.authState.user);
  const activityState = useSelector(state => state.uiState.activity);

  const { data, loading, refetch } = useQuery(COACH_SESSIONS, {
    variables: {
      where: {
        coach: { id: user && user.id },
        availability: {
          AND: [{ start_gte: weekStart }, { start_lte: weekEnd }],
        },
      },
    },
  });

  useEffect(() => {
    const { type } = activityState;
    if (type === 'SESSION') {
      refetch({
        variables: {
          where: {
            coach: { id: user && user.id },
            availability: {
              AND: [{ start_gte: weekStart }, { start_lte: weekEnd }],
            },
          },
        },
      });
    }
  }, [refetch, activityState, user]);

  return (
    <Row gutter={[16, 16]}>
      <Summary />
      <Row gutter={[16, 16]}>
        <Col lg={{ span: 24 }} xl={{ span: 16 }}>
          <Card title="THIS WEEK'S SCHEDULE" bodyStyle={{ padding: 20 }}>
            {loading ? (
              <Skeleton active avatar />
            ) : (
              <ScrollDiv height={338}>
                <div style={{ minWidth: 375 }}>
                  <SessionList
                    sessions={data.getCoachSessions.sessions}
                    type="dashboard"
                    height={338}
                  />
                </div>
              </ScrollDiv>
            )}
          </Card>
        </Col>

        <Col lg={{ span: 24 }} xl={{ span: 8 }}>
          <Card title="THIS WEEK'S ACTIVITIES" bodyStyle={{ padding: 20 }}>
            <ActivityList />
          </Card>
        </Col>
      </Row>
    </Row>
  );
};

export default CoachDashboard;
