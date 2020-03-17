import React, { memo } from 'react';
import Layout from 'antd/lib/layout';
import 'antd/lib/layout/style';
import { Switch, Route, Redirect } from 'react-router-dom';

import Sidebar from 'src/components/Sidebar';
import Header from 'src/components/Header';
import NotFound from 'src/components/404';

import { TitleRoute } from 'src/components/TitleComponent';

import CustomerDashboard from '../Dashboard';

import './style.less';

const CustomerPanel = props => {
  const {
    match: {
      params: { username },
    },
  } = props;
  return (
    <>
      <Header username={username} />

      <Layout>
        <Sidebar />

        <Layout className="customer-panel-layout">
          <Layout.Content>
            <Switch>
              <Route exact path={`/${username}/customer`}>
                <Redirect to={`/${username}/customer/dashboard`} />
              </Route>
              <TitleRoute
                path={`/${username}/customer/dashboard`}
                component={CustomerDashboard}
                title="Customer Dashboard"
              />
              <Route render={NotFound} />
            </Switch>
          </Layout.Content>
        </Layout>
      </Layout>
    </>
  );
};

export default memo(CustomerPanel);
