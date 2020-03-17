import { combineReducers } from 'redux';

import types from './types';

const payments = (state = [], action) => {
  switch (action.type) {
    case types.SET_TRANSACTIONS:
      return action.payload;
    default:
      return state;
  }
};

const paymentReducer = combineReducers({ payments });

export default paymentReducer;
