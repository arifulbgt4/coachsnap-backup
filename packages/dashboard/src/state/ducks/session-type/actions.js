import types from './types';

export const setSessionType = payload => dispatch =>
  dispatch({
    type: types.SET_SESSION_TYPE,
    payload,
  });

export default { setSessionType };
