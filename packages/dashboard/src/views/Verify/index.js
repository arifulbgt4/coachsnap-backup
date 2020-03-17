import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { Redirect, withRouter } from 'react-router-dom';
import { useMutation } from '@apollo/react-hooks';
import message from 'antd/lib/message';
import 'antd/lib/message/style';
import formatError from '../../utils/format-error';
import { setCurrentUser } from '../../state/ducks/authentication/actions';

import Fallback from '../../components/Fallback';
import { VERIFY_EMAIL_MUTATION } from '../../resolvers/user/mutation';

const Verify = props => {
  const [redirect, setRedirect] = useState(false);
  const [info, setInfo] = useState(null);
  const { location, history, setCurrentUser } = props;
  const { token, email } = queryString.parse(location.search);
  const variables = {
    emailToken: token,
  };

  if (email) {
    variables.email = email;
  }

  const [verifyEmail, { loading }] = useMutation(VERIFY_EMAIL_MUTATION, {
    variables,
  });

  useEffect(() => {
    const onVerify = async () => {
      try {
        const {
          data: {
            verifyEmail: { token: newToken },
          },
        } = await verifyEmail();
        setRedirect(true);
        setCurrentUser({ token: newToken });
        setInfo(newToken);
      } catch (error) {
        message.error(formatError(error));
        history.push('/');
      }
    };

    onVerify();
  }, [history, setCurrentUser, verifyEmail]);

  if (info && redirect) {
    return (
      <Redirect
        to={{
          pathname: '/public',
          state: { message: 'Your email is now verified.' },
        }}
      />
    );
  }
  return <Fallback />;
};

export default connect(null, { setCurrentUser })(withRouter(Verify));
