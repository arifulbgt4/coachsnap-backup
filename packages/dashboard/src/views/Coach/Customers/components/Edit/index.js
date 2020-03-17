import React from 'react';
import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import { useMutation } from 'react-apollo';
import { connect } from 'react-redux';
import Icon from 'src/components/Icon';
import Edit from '@ant-design/icons-svg/lib/asn/EditOutlined';

import useModalVisible from 'src/hooks/useModalVisible';
import { UPDATE_CUSTOMER } from 'src/resolvers/user/mutation';
import { setCustomer } from 'src/state/ducks/customer/actions';
import CustomerForm from '../../../CustomerForm';

const EditCustomer = props => {
  const { customer } = props;
  const [updateCustomer] = useMutation(UPDATE_CUSTOMER, {
    onCompleted: data => props.setCustomer(data.updateCustomer),
  });
  const [visible, open, close, cancel] = useModalVisible(false);
  return (
    <>
      <Button onClick={e => open(e)} type="primary" size="large" block>
        <Icon type={Edit} />
      </Button>
      <Modal
        title="Edit Customer Details"
        visible={visible}
        onCancel={cancel}
        footer={null}
        width={750}
      >
        <CustomerForm
          handleOk={close}
          dispatch={updateCustomer}
          initial={customer}
          action="update"
          formType="customer"
        />
      </Modal>
    </>
  );
};
const mapStateToProps = state => ({
  customer: state.customerState.customer,
});

export default connect(mapStateToProps, { setCustomer })(EditCustomer);
