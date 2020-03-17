import { combineReducers } from 'redux';
import types from './types';

const session = (state = {}, action) => {
  switch (action.type) {
    case types.SET_SESSION:
      // reset store
      if (!Object.keys(action.payload).length) return {};

      return {
        ...state,
        ...action.payload,
      };
    case types.DELETE_SESSION:
      return state.filter(item => item.id !== action.id);
    // return action.id;
    default:
      return state;
  }
};
const sessions = (state = [], action) => {
  switch (action.type) {
    case types.SET_SESSIONS:
      return action.payload;
    default:
      return state;
  }
};

const sessionReducer = combineReducers({ session, sessions });

export default sessionReducer;
