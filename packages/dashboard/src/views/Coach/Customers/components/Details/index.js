import React from 'react';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Descriptions from 'antd/lib/descriptions';
import 'antd/lib/descriptions/style';
import Avatar from 'antd/lib/avatar';
import 'antd/lib/avatar/style';
import Empty from 'antd/lib/empty';
import 'antd/lib/empty/style';
import Button from 'antd/lib/button';
import User from '@ant-design/icons-svg/lib/asn/UserOutlined';
import Icon from 'src/components/Icon';
import { connect } from 'react-redux';
import { useMutation } from 'react-apollo';
import Delete from '@ant-design/icons-svg/lib/asn/DeleteOutlined';
import { setCustomer } from 'src/state/ducks/customer/actions';

import ScrollDiv from 'src/components/ScrollDiv';
import ItemDelete from 'src/components/ItemDelete';
import { DELETE_CUSTOMER } from 'src/resolvers/user/mutation';
import { GET_ALL_CUSTOMERS } from 'src/resolvers/user/query';

import Edit from '../Edit';
import Assign from '../Assign';

import './style.less';

const CustomerDetails = props => {
  const { customer } = props;
  const title = 'CUSTOMER DETAILS';
  const style = { cursor: 'default' };

  const [deleteCustomer] = useMutation(DELETE_CUSTOMER, {
    variables: { id: customer.id },
    update: (cache, response) => {
      const query = { query: GET_ALL_CUSTOMERS };
      const { customers } = cache.readQuery(query);
      props.setCustomer({});
      cache.writeQuery({
        ...query,
        data: {
          customers: {
            ...customers,
            count: customers.count - 1,
            customers: customers.customers.filter(
              c => c.id !== response.data.removeCustomer.id
            ),
          },
        },
      });
    },
  });

  return customer.id ? (
    <Card
      hoverable
      title={title}
      bordered={false}
      style={style}
      bodyStyle={{ padding: 0 }}
      className="customer-details"
      actions={[
        <ItemDelete
          text="Customer"
          placement="topLeft"
          submitDelete={async () => deleteCustomer(customer.id)}
        >
          <Button type="danger" size="large" block>
            <Icon type={Delete} />
          </Button>
        </ItemDelete>,
        <Assign />,
        <Edit />,
      ]}
      extra={
        <Avatar size={70}>
          <Icon type={User} className="user" />
        </Avatar>
      }
    >
      <ScrollDiv height={220}>
        <Descriptions bordered>
          <Descriptions.Item span={3} label="Name">
            {customer.name}
          </Descriptions.Item>
          <Descriptions.Item span={3} label="Email">
            {customer.email}
          </Descriptions.Item>
        </Descriptions>
      </ScrollDiv>
    </Card>
  ) : (
    <Card
      hoverable
      title={title}
      bordered={false}
      style={style}
      className="customer-details"
    >
      <ScrollDiv height={225}>
        <Empty />
      </ScrollDiv>
    </Card>
  );
};

const mapStateToProps = state => ({
  customer: state.customerState.customer,
});

export default connect(mapStateToProps, { setCustomer })(CustomerDetails);
