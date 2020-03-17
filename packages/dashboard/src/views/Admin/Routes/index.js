import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Layout from 'antd/lib/layout';
import 'antd/lib/layout/style';

import withTitle from 'src/components/TitleComponent';
import Sidebar from 'src/components/Sidebar';
import Header from 'src/components/Header';
import NotFound from 'src/components/404';

import Dashboard from '../Dashboard';
import CoachManagement from '../CoachManagement';
import Payments from '../Payments';
import SingleCoach from '../SingleCoach';

import './style.less';

const { Content } = Layout;

const AdminPanel = ({ match: { url } }) => {
  return (
    <>
      <Header />
      <Layout>
        <Sidebar />
        <Layout className="admin-panel-layout">
          <Content className="admin-panel-layout">
            <Switch>
              <Route
                exact
                path={`${url}`}
                render={props =>
                  withTitle({
                    component: Dashboard,
                    title: 'Dashboard',
                    ...props,
                  })
                }
              />
              <Route
                exact
                path={`${url}/coaches`}
                render={props =>
                  withTitle({
                    component: CoachManagement,
                    title: 'Coach Management',
                    ...props,
                  })
                }
              />
              <Route
                path={`${url}/coaches/c/:coachId`}
                render={props =>
                  withTitle({
                    component: SingleCoach,
                    title: 'Edit Coach',
                    ...props,
                  })
                }
              />
              <Route
                path={`${url}/payment`}
                render={props =>
                  withTitle({
                    component: Payments,
                    title: 'Payments',
                    ...props,
                  })
                }
              />
              {/* Default 404 */}
              <Route render={NotFound} />
            </Switch>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default AdminPanel;
