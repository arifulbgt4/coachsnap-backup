import React from 'react';
import List from 'antd/lib/list';
import 'antd/lib/list/style';
import Avatar from 'antd/lib/avatar';
import 'antd/lib/avatar/style';
import Icon from 'src/components/Icon';
import Schedule from '@ant-design/icons-svg/lib/asn/ScheduleOutlined';
import { useLazyQuery } from '@apollo/react-hooks';
import ScrollDiv from 'src/components/ScrollDiv';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'custom-moment';

import { setSession } from 'src/state/ducks/session/actions';
import { toggleSessionDrawer } from 'src/state/ducks/ui/actions';
import { COACH_SESSIONS } from 'src/resolvers/session/query';
import { getWeekDay, concatTimeWithDate } from 'src/utils/date';
import SingleSession from 'src/components/SingleSession';
import { ListContext } from './context';

import DrawerForm from './DrawerForm';

import './style.less';
import { ProfileImage } from '../Image';

const { mockTimezone } = require('custom-moment/utils');

const getStartEndToggle = (singleEvent, availability, businessHour) => {
  const rawStart = singleEvent
    ? moment(availability.start)
    : moment(concatTimeWithDate(availability.start, businessHour.start));
  const rawEnd = singleEvent
    ? moment(availability.end)
    : moment(concatTimeWithDate(availability.end, businessHour.end));

  const start = rawStart.format('ddd MMM DD, YYYY | h:mm a');
  const end = rawEnd.format('h:mm a');
  return { start, end, rawStart, rawEnd };
};

const SessionList = props => {
  const { sessions, type, height, responsive } = props;
  const { weekStart, weekEnd } = getWeekDay();
  const user = useSelector(state => state.authState.user);
  const dispatch = useDispatch();

  const [getCoachSessions] = useLazyQuery(COACH_SESSIONS, {
    variables: {
      where: {
        coach: { id: user && user.id },
        availability: {
          AND: [{ start_gte: weekStart }, { start_lte: weekEnd }],
        },
      },
    },
    fetchPolicy: 'network-only',
  });

  const userTime = time => mockTimezone(time, user.timezone);

  const checkStatus = ({ availability, businessHour, singleEvent }) => {
    const { rawStart, rawEnd } = getStartEndToggle(
      singleEvent,
      availability,
      businessHour
    );
    const rawTimeNow = moment(Date.now()).tz(moment.tz.guess());
    const timeNow = userTime(rawTimeNow);
    const start = userTime(rawStart);
    const end = userTime(rawEnd);

    const diffStartWithNow = start.diff(timeNow) / 60000;
    const diffEndWithNow = end.diff(timeNow) / 60000;

    if (diffStartWithNow < 0 && diffEndWithNow > 0) {
      return 'Now';
    }
    if (diffStartWithNow > 0 && diffEndWithNow > 0) {
      return timeNow.to(start);
    }
    return 'Complete';
  };

  const onClick = session => {
    dispatch(setSession(session));
    dispatch(toggleSessionDrawer(true));
  };

  return (
    <ListContext.Provider value={{ type, getCoachSessions }}>
      <ScrollDiv resAuto height={height}>
        <List
          dataSource={sessions}
          size="small"
          className={`session-list ${responsive && 'responsive'}`}
          renderItem={item => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => onClick(item)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar style={{ background: '#00a2ae' }}>
                    {item.coverImage.url.length ? (
                      <ProfileImage src={item.coverImage.url} width="50" />
                    ) : (
                      <Icon type={Schedule} />
                    )}
                  </Avatar>
                }
                title={item.name}
                description={<SingleSession item={item} user={user} />}
              />
              {type !== 'dashboard' && item.cost && (
                <span className="cost">
                  {item.cost ? `$${item.cost}` : 'Free'}
                </span>
              )}
              {type === 'dashboard' && (
                <span className="date-details">{checkStatus(item)}</span>
              )}
            </List.Item>
          )}
        />

        <DrawerForm />
      </ScrollDiv>
    </ListContext.Provider>
  );
};

export default SessionList;
