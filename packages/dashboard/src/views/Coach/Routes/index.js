import React, { memo } from 'react';
import Layout from 'antd/lib/layout';
import 'antd/lib/layout/style';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Alert from 'src/components/Alert';
import Sidebar from 'src/components/Sidebar';
import Header from 'src/components/Header';
import NotFound from 'src/components/404';

import { TitleRoute } from 'src/components/TitleComponent';
import ResendVerification from 'src/components/ResendVerification';

import SessionsTypes from '../SessionTypes';
import CustomerManagement from '../Customers';
import CoachSettings from '../Settings';
import CoachDashboard from '../Dashboard';
import Calendar from '../Calendar';
import CoachPayment from '../Payments';
import Booking from '../Booking';

import './style.less';

const CoachPanel = ({ match: { url } }) => {
  const {
    authState: { user, isAuthenticated },
  } = useSelector(state => state);

  return (
    <>
      {isAuthenticated && <Header />}

      <Layout>
        {isAuthenticated && <Sidebar />}

        <Layout className="coach-panel-layout">
          <Layout.Content>
            {!user.verified && (
              <Alert>
                You are almost ready to coach. Please verify your email to
                continue. <ResendVerification />
              </Alert>
            )}
            <Switch>
              <Route exact path={url}>
                <Redirect to={`${url}/dashboard`} />
              </Route>
              <TitleRoute
                path={`${url}/dashboard`}
                component={CoachDashboard}
                title="Coach Dashboard"
              />
              <TitleRoute
                path="/coach/sessions"
                component={SessionsTypes}
                title="Session types"
              />
              <TitleRoute
                path="/coach/customers/c/:customerId/:bookingId"
                component={Booking}
                title="Booking"
              />
              <TitleRoute
                path="/coach/customers"
                component={CustomerManagement}
                title="Customers"
              />
              <TitleRoute
                path="/coach/settings"
                component={CoachSettings}
                title="Settings"
              />
              <TitleRoute
                path="/coach/payment"
                component={CoachPayment}
                title="Payment"
              />
              <TitleRoute
                path="/coach/calendar"
                component={Calendar}
                title="Calendar"
              />
              <Route render={NotFound} />
            </Switch>
          </Layout.Content>
        </Layout>
      </Layout>
    </>
  );
};

export default memo(CoachPanel);
