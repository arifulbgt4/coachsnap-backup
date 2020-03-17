import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import message from 'antd/lib/message';
import 'antd/lib/message/style';

const CustomerRoute = ({ component: CustomerComponent, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      const hasAccess = rest.isAuthenticated && rest.role === 'CUSTOMER';
      if (hasAccess) {
        return <CustomerComponent {...props} />;
      }
      if (localStorage.jwtToken) {
        message.warning('Please logout from your coach/admin account first');
      }
      return (
        <Redirect
          to={{
            pathname: '/',
            state: 'You are not accessible to this route',
          }}
        />
      );
    }}
  />
);

export default CustomerRoute;
