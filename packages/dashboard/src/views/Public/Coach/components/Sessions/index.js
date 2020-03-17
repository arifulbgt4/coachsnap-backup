import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import Empty from 'antd/lib/empty';
import 'antd/lib/empty/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import moment from 'moment';

import randomBackground from 'src/utils/random-background';
import CardView from '../CardView';

import './style.less';

const SessionsOfCoach = ({ coach, username, sessions }) => {
  if (sessions.length > 0) {
    return (
      <div className="session-list-area">
        <Row gutter={[16, 16]}>
          {sessions.map(session => {
            return (
              <Col
                className="session-big-card"
                xs={24}
                sm={24}
                md={24}
                lg={12}
                xl={6}
                key={session.id}
              >
                <Link to={`/public/c/${username}/s/${session.id}`}>
                  <CardView
                    key={session.id}
                    {...session}
                    coach={coach}
                    backgroundImg={randomBackground}
                    img={session.coverImage?.url}
                    cardSize="big"
                  />
                </Link>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  }
  return (
    <Empty
      className="empty-session"
      description={<span className="h1">This coach has no sessions</span>}
    >
      <Link to="/public">
        <Button type="primary">GO BACK</Button>
      </Link>
    </Empty>
  );
};

export default withRouter(SessionsOfCoach);
