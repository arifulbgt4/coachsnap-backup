import types from './types';

export const setTransactions = payload => dispatch =>
  dispatch({
    type: types.SET_TRANSACTIONS,
    payload,
  });

export default { setTransactions };
