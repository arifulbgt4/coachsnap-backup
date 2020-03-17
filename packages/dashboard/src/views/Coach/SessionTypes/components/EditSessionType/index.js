import React from 'react';
import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Edit from '@ant-design/icons-svg/lib/asn/EditOutlined';
import Icon from 'src/components/Icon';
import { connect } from 'react-redux';
import { useWindowSize } from '@reach/window-size';

import useModalVisible from 'src/hooks/useModalVisible';
import { setSessionType } from 'src/state/ducks/session-type/actions';
import SessionTypeForm from '../SessionTypeForm';

const EditSessionType = props => {
  const [visible, open, close, cancle] = useModalVisible(false);
  const { height: windowHeight, width: windowWidth } = useWindowSize();

  function handelEdit(e) {
    props.setSessionType(props.data);
    open(e);
  }

  return (
    <>
      <Button
        size={windowWidth > 575 ? 'default' : 'small'}
        onClick={e => handelEdit(e)}
      >
        <Icon type={Edit} />
      </Button>
      <Modal
        title="Edit Session Type"
        visible={visible}
        onCancel={cancle}
        footer={null}
        width={750}
        distroyOnClose
      >
        <SessionTypeForm
          handleOk={close}
          handleCancel={cancle}
          type="update"
          action
          visible={visible}
        />
      </Modal>
    </>
  );
};

export default connect(null, { setSessionType })(EditSessionType);
