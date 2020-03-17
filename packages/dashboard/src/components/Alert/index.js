import React from 'react';
import './style.less';

export default ({ children, type }) => (
  <div className={`alert-box ${type || 'primary'}`}>{children}</div>
);
