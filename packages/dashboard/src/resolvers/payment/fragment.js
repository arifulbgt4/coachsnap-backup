/**
 * Parvez M Robin
 * this@parvezmrobin.com
 * Date: Jan 04, 2020
 */

const CHARGE_FRAGMENT = `
  fragment Charge on Charge {
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
`;

export default CHARGE_FRAGMENT;
