import React, { lazy } from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import Layout from 'antd/lib/layout';
import 'antd/lib/layout/style';

import withTitle from 'src/components/TitleComponent';
import Navbar from 'src/components/Navbar';
import NotFound from 'src/components/404';

import './style.less';

const Coach = lazy(() => import('../Coach'));
const CoachList = lazy(() => import('../CoachList'));
const Booking = lazy(() => import('../Booking'));
const ConfirmBooking = lazy(() => import('../ConfirmBooking'));

const { Content } = Layout;

const PublicPage = ({ match: { url } }) => {
  return (
    <>
      <Navbar />
      <Content className="public-page-layout">
        <Router>
          <Switch>
            <Route exact path={`${url}`} component={CoachList} />
            <Route
              exact
              path={`${url}/c/:username`}
              render={props =>
                withTitle({
                  component: Coach,
                  title: 'Profile',
                  ...props,
                })
              }
            />
            <Route
              exact
              path={`${url}/c/:username/s/:sessionId`}
              render={props =>
                withTitle({
                  component: Booking,
                  title: 'Reserve Your Spot',
                  ...props,
                })
              }
            />
            <Route
              exact
              path={`${url}/c/:username/s/:sessionId/b/:bookingId`}
              render={props =>
                withTitle({
                  component: ConfirmBooking,
                  title: 'Confirm Booking',
                  ...props,
                })
              }
            />
            <Route render={NotFound} />
          </Switch>
        </Router>
      </Content>
    </>
  );
};

export default PublicPage;
