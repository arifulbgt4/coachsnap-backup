import React from 'react';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style';
import Plus from '@ant-design/icons-svg/lib/asn/PlusOutlined';
import Icon from 'src/components/Icon';
import { useMutation } from 'react-apollo';
import { connect } from 'react-redux';

import useModalVisible from 'src/hooks/useModalVisible';

import { CREATE_CUSTOMER } from 'src/resolvers/user/mutation';
import { GET_ALL_CUSTOMERS } from 'src/resolvers/user/query';
import { setCustomer } from 'src/state/ducks/customer/actions';
import CustomerForm from '../../../CustomerForm';

const Create = props => {
  const [visible, open, close, cancel] = useModalVisible(false);
  const [createCustomer] = useMutation(CREATE_CUSTOMER, {
    update: (cache, response) => {
      const newCustomer = response.data.createCustomer;
      props.setCustomer(newCustomer);
      const query = { query: GET_ALL_CUSTOMERS };
      const { customers } = cache.readQuery(query);
      cache.writeQuery({
        ...query,
        data: {
          customers: {
            ...customers,
            count: customers.count + 1,
            customers: [...customers.customers, newCustomer],
          },
        },
      });
    },
  });

  return (
    <>
      <Button size="small" type="primary" onClick={e => open(e)}>
        <Icon type={Plus} />
      </Button>
      <Modal
        title="CREATE NEW CUSTOMER"
        visible={visible}
        onCancel={cancel}
        footer={null}
        width={750}
      >
        <CustomerForm
          handleOk={close}
          dispatch={createCustomer}
          formType="customer"
          action="create"
        />
      </Modal>
    </>
  );
};

export default connect(null, { setCustomer })(Create);
