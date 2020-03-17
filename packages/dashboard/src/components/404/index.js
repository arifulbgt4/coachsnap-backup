import React from 'react';
import Result from 'antd/lib/result';
import Button from 'antd/lib/button';

import 'antd/lib/result/style';
import 'antd/lib/button/style';

const NotFound = ({ message }) => {
  return (
    <Result
      status="404"
      title="404"
      subTitle={message || 'Sorry, the page you visited does not exist.'}
      extra={
        <a href="/">
          <Button type="primary">Back Home</Button>
        </a>
      }
    />
  );
};

export default NotFound;
