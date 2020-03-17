import { combineReducers } from 'redux';

import types from './types';

const toggleReducer = (state, action, TYPE) => {
  switch (action.type) {
    case TYPE:
      return action.payload;
    default:
      return state;
  }
};

const activity = (state = {}, action) => {
  switch (action.type) {
    case types.ADD_ACTIVITY:
      return action.payload;
    default:
      return state;
  }
};

const uiReducer = combineReducers({
  shareModal: (state = false, action) =>
    toggleReducer(state, action, types.TOGGLE_SHARE_BUTTON),
  sessionModal: (state = false, action) =>
    toggleReducer(state, action, types.TOGGLE_SESSION_MODAL),
  sessionDrawer: (state = false, action) =>
    toggleReducer(state, action, types.TOGGLE_SESSION_DRAWER),
  showSideBar: (state = false, action) =>
    toggleReducer(state, action, types.TOGGLE_SIDEBAR),
  showAssignModal: (state = false, action) =>
    toggleReducer(state, action, types.TOGGLE_ASSIGN_MODAL),
  activity,
});

export default uiReducer;
