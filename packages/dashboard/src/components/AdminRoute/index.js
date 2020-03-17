import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const AdminRoute = ({ component: AdminComponent, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      const hasAccess = rest.isAuthenticated && rest.role === 'ADMIN';
      if (hasAccess) {
        return <AdminComponent {...props} />;
      }
      return (
        <Redirect
          to={{
            pathname: '/signin',
            state: { message: 'You are not accessible to this route' },
          }}
        />
      );
    }}
  />
);

export default AdminRoute;
