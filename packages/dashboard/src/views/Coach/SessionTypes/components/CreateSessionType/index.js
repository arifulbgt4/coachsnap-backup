import React from 'react';
import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Plus from '@ant-design/icons-svg/lib/asn/PlusOutlined';
import Icon from 'src/components/Icon';

import useModalVisible from '../../../../../hooks/useModalVisible';
import SessionTypeForm from '../SessionTypeForm';

const CreateSessionType = () => {
  const sessionTypeObj = {
    name: null,
    cost: null,
    duration: 15,
    maxSeats: 1,
    description: null,
  };
  const [visible, open, close, cancel] = useModalVisible(false);

  return (
    <>
      <Button type="primary" onClick={e => open(e)}>
        <Icon type={Plus} />
      </Button>
      <Modal
        title="Create New Session Type"
        visible={visible}
        onCancel={cancel}
        footer={null}
        width={750}
        distroyOnClose
      >
        <SessionTypeForm
          handleOk={close}
          handleCancel={cancel}
          initial={sessionTypeObj}
          visible={visible}
          type="create"
        />
      </Modal>
    </>
  );
};

export default CreateSessionType;
