import React from 'react';
import Spin from 'antd/lib/spin';
import Icon from 'src/components/Icon';
import Loading from '@ant-design/icons-svg/lib/asn/LoadingOutlined';
import 'antd/lib/spin/style';

import './style.less';

const antIcon = <Icon type={Loading} className="loading" />;

function Fallback() {
  return <Spin indicator={antIcon} />;
}

export default Fallback;
