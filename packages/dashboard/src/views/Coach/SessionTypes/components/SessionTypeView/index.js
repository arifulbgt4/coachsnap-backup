import React from 'react';
import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import Eye from '@ant-design/icons-svg/lib/asn/EyeOutlined';
import Icon from 'src/components/Icon';
import Descriptions from 'antd/lib/descriptions';
import 'antd/lib/descriptions/style';
import useModalVisible from '../../../../../hooks/useModalVisible';

export default ({ value }) => {
  const [visible, open, cancel] = useModalVisible(false);

  const { name, cost, maxSeats, description } = value;
  return (
    <>
      <Button onClick={e => open(e)}>
        <Icon type={Eye} />
      </Button>
      <Modal visible={visible} onCancel={cancel} footer={null}>
        <Descriptions bordered layout="vertical" title={name}>
          <Descriptions.Item label="Cost">${cost || 0}</Descriptions.Item>
          <Descriptions.Item label="Seats">{maxSeats || 0}</Descriptions.Item>
          <Descriptions.Item label="Description">
            {description || 'No Description'}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </>
  );
};
