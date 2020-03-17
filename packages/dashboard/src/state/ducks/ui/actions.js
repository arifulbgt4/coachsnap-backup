import types from './types';

export const toggleShareModal = payload => dispatch =>
  dispatch({
    type: types.TOGGLE_SHARE_BUTTON,
    payload,
  });

export const toggleSessionModal = payload => dispatch =>
  dispatch({
    type: types.TOGGLE_SESSION_MODAL,
    payload,
  });

export const toggleSessionDrawer = payload => dispatch =>
  dispatch({
    type: types.TOGGLE_SESSION_DRAWER,
    payload,
  });

export const toggleSidebar = payload => dispatch =>
  dispatch({
    type: types.TOGGLE_SIDEBAR,
    payload,
  });

export const toggleAssignModal = payload => dispatch =>
  dispatch({
    type: types.TOGGLE_ASSIGN_MODAL,
    payload,
  });

export const addActivity = payload => dispatch =>
  dispatch({
    type: types.ADD_ACTIVITY,
    payload,
  });

export default {
  toggleShareModal,
  toggleSidebar,
  toggleSessionModal,
  toggleSessionDrawer,
  toggleAssignModal,
};
