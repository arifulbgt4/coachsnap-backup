import types from './types';

export const setCustomer = payload => dispatch =>
  dispatch({
    type: types.SET_CUSTOMER,
    payload,
  });

export const setBooking = payload => dispatch =>
  dispatch({
    type: types.SET_BOOKING,
    payload,
  });

export default { setCustomer, setBooking };
