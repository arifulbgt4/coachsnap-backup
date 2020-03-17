import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const ProtectedRoute = ({ component: ProtectedComponent, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      const hasAccess = rest.isAuthenticated && rest.role === 'COACH';
      if (hasAccess) {
        return <ProtectedComponent {...props} />;
      }
      return (
        <Redirect
          to={{
            pathname: '/signin',
            state: 'You are not accessible to this route',
          }}
        />
      );
    }}
  />
);

export default ProtectedRoute;
