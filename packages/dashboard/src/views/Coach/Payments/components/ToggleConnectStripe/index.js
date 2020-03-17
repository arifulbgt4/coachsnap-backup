import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation } from '@apollo/react-hooks';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import {
  CONNECT_STRIPE,
  DISCONNECT_STRIPE,
} from 'src/resolvers/payment/mutation';
import { setCurrentUser } from 'src/state/ducks/authentication/actions';

import 'antd/lib/button/style';
import 'antd/lib/message/style';
import './style.less';
import formatError from 'src/utils/format-error';

const ToggleConnectStripe = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const user = useSelector(store => store.authState.user);

  const [connectStripe] = useMutation(CONNECT_STRIPE);
  const [disconnectStripe] = useMutation(DISCONNECT_STRIPE);
  const isStripeConnected = !!user.stripeAccount;

  const handleDisconnectStripe = async () => {
    try {
      const {
        data: {
          disconnectStripe: { token },
        },
      } = await disconnectStripe();
      dispatch(setCurrentUser({ token }));
      message.success('Successfully disconnected to your stripe account');
    } catch (error) {
      message.error(formatError(error));
    }
  };

  const redirectToStripe = () => {
    window.open(
      `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${process.env.DASHBOARD_URL}/coach/payment`,
      '_top'
    );
  };

  useEffect(() => {
    if (!isStripeConnected) {
      const stripeCode = new URLSearchParams(window.location.search).get(
        'code'
      );
      if (stripeCode) {
        const handleConnectStripe = async code => {
          try {
            const {
              data: {
                connectStripe: { token },
              },
            } = await connectStripe({ variables: { code } });
            dispatch(setCurrentUser({ token }));
            history.replace(window.location.pathname);
            message.success('Successfully connected to your stripe account');
          } catch (error) {
            message.error(formatError(error));
          }
        };
        handleConnectStripe(stripeCode);
      }
    }
  }, [connectStripe, dispatch, history, isStripeConnected]);

  return (
    <span>
      Transactions
      <span className="transaction-actions">
        <Button
          type={isStripeConnected ? 'danger' : 'primary'}
          onClick={() =>
            isStripeConnected ? handleDisconnectStripe() : redirectToStripe()
          }
          style={{ float: 'right' }}
        >
          {isStripeConnected ? 'Disconnect Stripe' : 'Connect Stripe'}
        </Button>
      </span>
    </span>
  );
};

export default ToggleConnectStripe;
