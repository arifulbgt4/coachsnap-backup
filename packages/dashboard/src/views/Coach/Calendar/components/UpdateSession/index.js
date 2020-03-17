// External Components
import React from 'react';
import Button from 'antd/lib/button';
import ArrowLeft from '@ant-design/icons-svg/lib/asn/ArrowLeftOutlined';

// Own global components
import Icon from 'src/components/Icon';
import SessionForm from 'src/components/SessionForm';

// Library Style
import 'antd/lib/button/style';

// Own Style
import './style.less';

const UpdateSession = ({ close, cancel }) => {
  return (
    <div className="session-form-in-calendar">
      <Button className="back-btn" type="link" onClick={cancel}>
        <Icon type={ArrowLeft} />
        Back
      </Button>

      {/* Session form for Update session */}
      <SessionForm
        handleOk={close}
        cancel={cancel}
        formType="update"
        createdFrom="calendar"
        height={0}
      />
    </div>
  );
};

export default UpdateSession;
