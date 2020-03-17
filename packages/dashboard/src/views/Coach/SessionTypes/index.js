import React from 'react';
import { useSelector } from 'react-redux';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import { useQuery } from '@apollo/react-hooks';
import Skeleton from 'antd/lib/skeleton';

import CreateSessionType from './components/CreateSessionType';
import SessionTypeList from './components/SessionTypeList';
import { SESSION_TYPES } from '../../../resolvers/session-types/query';

import './style.less';

const SessionTypes = () => {
  const userId = useSelector(store => store.authState.user.id);
  const { data, loading } = useQuery(SESSION_TYPES, {
    variables: { coachId: userId },
  });
  return (
    <Row>
      <Col>
        <Card
          title={`ALL SESSION TYPES ${
            !loading ? `(${data.sessionTypes.sessionTypes.length})` : `(0)`
          }`}
          extra={<CreateSessionType type="create" />}
        >
          {loading ? (
            <Skeleton avatar active paragraph={{ rows: 1 }} />
          ) : (
            <SessionTypeList dataSource={data.sessionTypes.sessionTypes} />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default SessionTypes;
