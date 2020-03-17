import React from 'react';
import { CardElement, injectStripe } from 'react-stripe-elements';

const CheckoutForm = ({ stripe, onChange }) => {
  const submit = async () => {
    const { token } = await stripe.createToken({ name: 'Name' });
    onChange(token?.id);
  };
  return <CardElement onChange={submit} />;
};

export default injectStripe(CheckoutForm);
