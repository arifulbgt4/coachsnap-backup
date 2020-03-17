import types from './types';

export const setSession = payload => dispatch =>
  dispatch({
    type: types.SET_SESSION,
    payload,
  });

export const setSessions = payload => dispatch =>
  dispatch({
    type: types.SET_SESSIONS,
    payload,
  });

export const deleteSession = id => dispatch =>
  dispatch({
    type: types.DELETE_SESSION,
    id,
  });

export default { setSession, setSessions };
