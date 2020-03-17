import React from 'react';
import { connect } from 'react-redux';
import { useMutation } from 'react-apollo';

import Button from 'antd/lib/button';
import 'antd/lib/button/style';

import { SEND_VERIFICATION } from '../../resolvers/user/mutation';

const ResendVerification = ({ user: { email } }) => {
  const [resendVerification, { loading, data }] = useMutation(
    SEND_VERIFICATION,
    {
      variables: { email },
    }
  );
  return (
    <span>
      Can't find the confirmation email?{' '}
      <Button
        onClick={async () => resendVerification()}
        ghost
        type="primary"
        size="small"
      >
        {!data && loading ? 'sending' : 'resend' || 'sent'}
      </Button>
    </span>
  );
};

const mapStateToProps = state => ({
  user: state.authState.user,
});

export default connect(mapStateToProps, {})(ResendVerification);
