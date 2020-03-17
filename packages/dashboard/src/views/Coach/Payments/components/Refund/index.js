import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { useSelector, useDispatch } from 'react-redux';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';

import 'antd/lib/message/style';
import 'antd/lib/button/style';

import { REFUND } from 'src/resolvers/payment/mutation';
import { setTransactions } from 'src/state/ducks/payments/actions';
import formatError from 'src/utils/format-error';

const Refund = ({ id, charge }) => {
  const dispatch = useDispatch();
  const payments = useSelector(store => store.paymentState.payments);
  const user = useSelector(store => store.authState.user);
  const isStripeConnected = !!user.stripeAccount;

  const [refund] = useMutation(REFUND);

  const handleRefund = async () => {
    try {
      const {
        data: { refund: refundCharge },
      } = await refund({
        variables: { chargeId: id },
      });
      const chargeIndex = payments.findIndex(ch => ch.id === id);
      payments[chargeIndex] = refundCharge;
      dispatch(setTransactions(payments));
    } catch (error) {
      message.error(formatError(error));
    }
  };
  return (
    <Button
      type="danger"
      onClick={() => handleRefund()}
      disabled={
        !isStripeConnected ||
        user.stripeAccount.stripe_user_id !== charge.stripe_user_id
      }
    >
      Refund
    </Button>
  );
};

export default Refund;
