import React, { useEffect } from 'react';
import List from 'antd/lib/list';
import 'antd/lib/list/style';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Avatar from 'antd/lib/avatar';
import 'antd/lib/avatar/style';
import Empty from 'antd/lib/empty';
import 'antd/lib/empty/style';
import Skeleton from 'antd/lib/skeleton';
import 'antd/lib/skeleton/style';
import Icon from 'src/components/Icon';
import User from '@ant-design/icons-svg/lib/asn/UserOutlined';
import { useQuery } from 'react-apollo';
import { useSelector, useDispatch } from 'react-redux';

import ScrollDiv from 'src/components/ScrollDiv';
import { setCustomer } from 'src/state/ducks/customer/actions';
import { GET_ALL_CUSTOMERS } from 'src/resolvers/user/query';
import CreateCustomer from '../Create';

import './style.less';

const CustomerList = () => {
  const dispatch = useDispatch();
  const activityState = useSelector(state => state.uiState.activity);

  const { loading, data, refetch } = useQuery(GET_ALL_CUSTOMERS);

  useEffect(() => {
    const { type } = activityState;
    if (type === 'SESSION') {
      refetch();
    }
  }, [activityState, refetch]);

  return (
    <Card
      hoverable
      title="ALL CUSTOMERS"
      style={{ cursor: 'default' }}
      headStyle={{ padding: '0 10px' }}
      bodyStyle={{ padding: 20 }}
      extra={<CreateCustomer />}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      ) : (
        <ScrollDiv height={220}>
          {data.customers.count < 1 ? (
            <Empty description="No customers" />
          ) : (
            <List
              size="small"
              bordered={false}
              dataSource={data.customers.customers}
              renderItem={c => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '8px 10px' }}
                  onClick={() => dispatch(setCustomer(c))}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar src={c.profileImage}>
                        <Icon type={User} />
                      </Avatar>
                    }
                    title={c.name}
                  />
                </List.Item>
              )}
            />
          )}
        </ScrollDiv>
      )}
    </Card>
  );
};

export default CustomerList;
