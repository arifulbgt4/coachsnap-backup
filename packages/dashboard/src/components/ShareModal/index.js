import React, { useState } from 'react';
import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import RollBack from '@ant-design/icons-svg/lib/asn/RollbackOutlined';
import Copy from '@ant-design/icons-svg/lib/asn/CopyOutlined';
import Icon from 'src/components/Icon';
import { connect } from 'react-redux';
import ClickToSelect from '@mapbox/react-click-to-select';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { toggleShareModal } from 'src/state/ducks/ui/actions';

import './style.less';

const ShareModal = props => {
  const [copied, setCopy] = useState(false);
  const { session, shareModal } = props;

  const handleOk = () => {
    setCopy(false);
    props.toggleShareModal(false);
  };

  const link = `${window.location.origin}/public/c/${session.coach.username}/s/${session.id}`;

  return (
    <Modal
      title={`Share ${session.name}`}
      visible={shareModal}
      onOk={handleOk}
      onCancel={handleOk}
      style={{ textAlign: 'center' }}
      footer={[
        <Button key="back" onClick={handleOk}>
          <Icon type={RollBack} />
          Close
        </Button>,
      ]}
    >
      <ClickToSelect>
        <div className="link-field">
          <CopyToClipboard text={link} onCopy={() => setCopy(true)}>
            <span>{link}</span>
          </CopyToClipboard>
        </div>
        <br />
        <CopyToClipboard text={link} onCopy={() => setCopy(true)}>
          <Button type="primary">
            <Icon type={Copy} />
            {copied ? 'Link copied!' : 'Click to copy'}
          </Button>
        </CopyToClipboard>
      </ClickToSelect>
    </Modal>
  );
};

const mapStateToProps = state => ({
  session: state.sessionState.session,
  shareModal: state.uiState.shareModal,
});

export default connect(mapStateToProps, { toggleShareModal })(ShareModal);
