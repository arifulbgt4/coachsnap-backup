import React, { memo } from 'react';
// NOTE to put on readme: do not import/destructure ant components
// currently importing the package directly or from es directory causes follwoing error
// Cannot find module '../../../node_modules/antd/es/pagination/index.js'
import Table from 'antd/lib/table';
import Form from 'antd/lib/form';
import Card from 'antd/lib/card';
import { useQuery } from '@apollo/react-hooks';
import PerfectScrollbar from 'react-perfect-scrollbar';

import { COACHES } from 'src/resolvers/user/query';
import columns from './columns';

import 'antd/lib/table/style';
import 'antd/lib/form/style';
import 'antd/lib/card/style';

const CoachTable = () => {
  const { loading, data } = useQuery(COACHES);

  return (
    <Card title="Coach List">
      <PerfectScrollbar>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data && data.coaches.coaches}
          loading={loading}
          style={{ minWidth: 768 }}
        />
      </PerfectScrollbar>
    </Card>
  );
};

export default Form.create()(memo(CoachTable));
