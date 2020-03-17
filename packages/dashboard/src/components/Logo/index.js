import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { setCurrentUser } from 'src/state/ducks/authentication/actions';

import './style.less';

const Logo = ({ user }) => {
  const dispatch = useDispatch();
  return (
    <Link
      to={user.role === 'ADMIN' ? '/admin' : '/'}
      onClick={() =>
        user.role === 'CUSTOMER' &&
        dispatch({
          type: 'SET_CURRENT_USER',
          payload: {},
        })
      }
      className="coach-panel-logo"
    >
      C<span style={{ color: '#1890ff' }}>S</span>
    </Link>
  );
};

const mapStateToProps = state => ({});

export default connect(mapStateToProps)(Logo);
