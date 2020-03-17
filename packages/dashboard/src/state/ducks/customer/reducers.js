import { combineReducers } from 'redux';
import types from './types';

const customer = (state = {}, action) => {
  switch (action.type) {
    case types.SET_CUSTOMER:
      return action.payload;
    default:
      return state;
  }
};

const booking = (state = false, action) => {
  switch (action.type) {
    case types.SET_BOOKING:
      return action.payload;
    default:
      return state;
  }
};

const customerReducer = combineReducers({ customer, booking });

export default customerReducer;
