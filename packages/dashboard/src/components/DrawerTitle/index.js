import React from 'react';
import Button from 'antd/lib/button';
import Icon from 'src/components/Icon';
import ArrowLeft from '@ant-design/icons-svg/lib/asn/ArrowLeftOutlined';
import 'antd/lib/button/style';
import './style.less';

export default ({ title, close }) => {
  return (
    <div className="drawer-title">
      <Button onClick={close} size="small" type="link">
        <Icon type={ArrowLeft} />
      </Button>
      <span>{title}</span>
    </div>
  );
};
