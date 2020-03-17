import jwtDecode from 'jwt-decode';

import client from 'src/config/client';
import types from './types';

export const setCurrentUser = ({ token, username }) => {
  if (typeof token !== 'object' && typeof token !== 'undefined') {
    const decoded = jwtDecode(token);
    if (username) {
      localStorage.setItem(username, token);
    } else {
      localStorage.setItem('jwtToken', token);
    }
    return {
      type: types.SET_CURRENT_USER,
      payload: decoded,
    };
  }
  return {
    type: types.SET_CURRENT_USER,
    payload: {},
  };
};

export const logoutUser = ({ username }) => dispatch => {
  client.cache.reset();
  if (!username) {
    localStorage.removeItem('jwtToken');
  } else {
    localStorage.removeItem(username);
  }
  // This is just to reset the store on logout
  // ref: https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store
  dispatch({ type: types.LOGOUT_USER });
};

export default { setCurrentUser, logoutUser };
