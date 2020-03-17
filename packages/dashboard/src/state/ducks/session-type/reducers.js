import { combineReducers } from 'redux';

import types from './types';

const sessionType = (state = {}, action) => {
  switch (action.type) {
    case types.SET_SESSION_TYPE:
      return { ...action.payload };
    default:
      return state;
  }
};

const sessionTypeReducer = combineReducers({ sessionType });

export default sessionTypeReducer;
