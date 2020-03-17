const paymentFragment = `
  fragment Booking on Booking {
    charge {
      id
      stripe_user_id
      amount
      amount_refunded
      refunded
      application_fee_amount
      currency
      description
      createdAt
      updatedAt
    }
  }
`;
module.exports = paymentFragment;
