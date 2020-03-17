import React, { useState } from 'react';
import Popconfirm from 'antd/lib/popconfirm';
import message from 'antd/lib/message';

import 'antd/lib/popconfirm/style';
import 'antd/lib/message/style';

import ButtonLoading from 'src/components/ButtonLoading';
import formatError from 'src/utils/format-error';

const ItemDelete = ({ text, submitDelete, placement, children }) => {
  const [loading, setLoading] = useState(false);
  async function confirm() {
    setLoading(true);
    try {
      await submitDelete();
      message.success(`Successfully Deleted ${text}`);
    } catch (error) {
      console.log({ error });
      message.error(formatError(error));
    }
    setLoading(false);
  }
  return (
    <Popconfirm
      placement={placement || 'left'}
      title={`Are you sure to delete this ${text}?`}
      onConfirm={confirm}
      okText={
        loading ? (
          <span>
            <ButtonLoading />
            Yes
          </span>
        ) : (
          'Yes'
        )
      }
      cancelText="No"
    >
      {children}
    </Popconfirm>
  );
};

export default ItemDelete;
