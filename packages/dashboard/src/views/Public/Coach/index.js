import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Calendar from 'antd/lib/calendar';
import Button from 'antd/lib/button';
import 'antd/lib/calendar/style';
import Spin from 'antd/lib/spin';
import 'antd/lib/spin/style';
import Icon from 'src/components/Icon';
import Loading from '@ant-design/icons-svg/lib/asn/LoadingOutlined';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Skeleton from 'antd/lib/skeleton';
import 'antd/lib/skeleton/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import 'antd/lib/button/style';
import { useQuery, useSubscription } from '@apollo/react-hooks';

import NotFound from 'src/components/404';
import { CoverImage } from 'src/components/Image';

import { GET_COACH } from 'src/resolvers/user/query';
import { COACH_SESSIONS } from 'src/resolvers/session/query';
import { ACTIVITIES } from 'src/resolvers/activity/subscription';
import { addActivity } from 'src/state/ducks/ui/actions';

import CoverImagePlaceholder from 'src/assets/images/placeholder-image-cover.png';
import CoachInfo from './components/CoachInfo';
import Sessions from './components/Sessions';

import './style.less';

const moment = require('custom-moment');

const Loader = <Icon type={Loading} className="loading" />;

const date = moment();

const Coach = ({
  match: {
    params: { username },
  },
}) => {
  const [filterSessionDate, setFilterSessionDate] = useState(null);
  const [month, setMonth] = useState(date);
  const activityState = useSelector(state => state.uiState.activity);

  const dispatch = useDispatch();

  const { data, loading, error, refetch: refetchCoach } = useQuery(GET_COACH, {
    variables: { username },
  });

  const { data: sessionData, loading: sessionLoading, refetch } = useQuery(
    COACH_SESSIONS,
    {
      variables: {
        where: {
          coach: { username },
          AND: [
            {
              availability: {
                start_gte: month.startOf('month').format(),
                start_lte: month.endOf('month').format(),
              },
            },
          ],
        },
      },
    }
  );

  const onChangeMonth = (value, type) => {
    if (type === 'month') {
      const currMonth = moment(value);
      setMonth(currMonth);
    }
  };

  useEffect(() => {
    const where = {
      coach: { username },
      AND: [
        {
          availability: {
            start_gte: month.startOf('month').format(),
            start_lte: month.endOf('month').format(),
          },
        },
      ],
    };
    if (filterSessionDate) {
      const from = moment(filterSessionDate).startOf('day');
      const to = moment(filterSessionDate).endOf('day');
      where.AND = [
        {
          availability: { start_gte: from.format(), start_lt: to.format() },
        },
      ];
    }
    refetch({ where });
  }, [filterSessionDate, month, refetch, username]);

  useEffect(() => {
    const { type } = activityState;
    if (type === 'PROFILE') {
      refetchCoach({
        variables: { username },
      });
    }
    if (type === 'SESSION') {
      refetch();
    }
  }, [activityState, month, refetch, refetchCoach, username]);

  useSubscription(ACTIVITIES, {
    variables: { coachId: data && data.coach.id },
    onSubscriptionData: ({ subscriptionData }) => {
      const {
        data: { activityPubSub },
      } = subscriptionData;
      dispatch(addActivity(activityPubSub));
    },
  });
  if (error) return <NotFound message="Coach not found!" />;

  const coach = data?.coach;
  const sessions = sessionData ? sessionData.getCoachSessions.sessions : [];

  function onFullRender(date) {
    const day = moment(date).format('DD');
    const dayCheck = moment(date).format('YYYY-MM-DD');
    let style = {};
    if (sessions.length > 0) {
      sessions.map(obj => {
        const { start } = obj.availability;
        const dateFormated = moment(start).format('YYYY-MM-DD');
        if (dateFormated === dayCheck) {
          style = {
            pointerEvents: 'painted',
            background: '#1890ff',
            color: '#fff',
            cursor: 'pointer',
          };
        }
        if (dayCheck === filterSessionDate) {
          style.background = '#722ed1';
        }
      });
    }

    return (
      <div
        onClick={() =>
          setFilterSessionDate(dayCheck !== filterSessionDate && dayCheck)
        }
        style={style}
        className="date-cell"
      >
        {day}
      </div>
    );
  }
  return (
    <>
      <Card
        className="coach-profile-card-bio"
        cover={
          <CoverImage
            className="cover-image"
            src={
              coach?.coverImage?.url?.length
                ? coach.coverImage.url
                : CoverImagePlaceholder
            }
          />
        }
      >
        <div className="profile-card">
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={12} className="coach-bio">
              {loading ? (
                <Skeleton active paragraph={{ rows: 2 }} title={false} />
              ) : (
                coach && <CoachInfo {...coach} />
              )}
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}
              xl={12}
              className="coach-calendar"
            >
              <div className="session-calendar">
                <div className="calendar">
                  <Calendar
                    fullscreen={false}
                    dateFullCellRender={onFullRender}
                    onPanelChange={onChangeMonth}
                    disabledDate={current => {
                      return (
                        current &&
                        current <
                          moment()
                            .clone()
                            .add(1, 'month')
                      );
                    }}
                  />
                  <Button
                    size="small"
                    className="clear-filter-btn"
                    onClick={() => setFilterSessionDate(null)}
                  >
                    Clear filter
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <Spin
          tip="Loading sessions"
          indicator={Loader}
          spinning={sessionLoading}
        >
          {coach && (
            <Sessions coach={coach} username={username} sessions={sessions} />
          )}
        </Spin>
      </Card>
    </>
  );
};

export default withRouter(Coach);
