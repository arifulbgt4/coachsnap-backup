import { combineReducers } from 'redux';

import types from './types';
import isEmpty from '../../../utils/is-empty';

const user = (state = {}, action) => {
  switch (action.type) {
    case types.SET_CURRENT_USER:
      return action.payload;

    case types.LOGOUT_USER:
      // Set empty value on logout
      return state;
    default:
      return state;
  }
};

const isAuthenticated = (state = false, action) => {
  switch (action.type) {
    case types.SET_CURRENT_USER:
      return !isEmpty(action.payload);
    default:
      return state;
  }
};

const authReducer = combineReducers({
  user,
  isAuthenticated,
});

export default authReducer;
