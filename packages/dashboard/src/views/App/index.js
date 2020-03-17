import React, { lazy, Suspense } from 'react';
import Layout from 'antd/lib/layout';
import 'antd/lib/layout/style';
import {
  withRouter,
  Route,
  Switch,
  BrowserRouter as Router,
  Redirect,
} from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo';

import Fallback from 'src/components/Fallback';
import NotFound from 'src/components/404';
import AdminRoute from 'src/components/AdminRoute';
import CoachRoute from 'src/components/ProtectedRoute';
import withTitle from 'src/components/TitleComponent';
import { GET_USER, GET_CUSTOMER } from 'src/resolvers/user/query';
import client from 'src/config/client';
import CustomerRoute from 'src/components/CustomerRoute';
import {
  setCurrentUser,
  logoutUser,
} from 'src/state/ducks/authentication/actions';

import './style.less';
import 'react-perfect-scrollbar/dist/css/styles.css';

const CoachPanel = lazy(() => import('../Coach/Routes'));
const AdminPanel = lazy(() => import('../Admin/Routes'));
const Customer = lazy(() => import('../Customer/Routes'));
const PublicRoutes = lazy(() => import('../Public/Routes'));
const Verify = lazy(() => import('../Verify'));
const AccountReset = lazy(() => import('../AccountReset'));
const PasswordReset = lazy(() => import('../PasswordReset'));
const Signin = lazy(() => import('../Signin'));
const Signup = lazy(() => import('../Signup'));

class App extends React.Component {
  state = { collapsed: false, loading: true };

  async componentDidMount() {
    const {
      location: { pathname },
    } = this.props;
    await this.checkAuth(pathname);
    this.setLoading(false);
  }

  setLoading = bool => {
    this.setState({ loading: bool });
  };

  toggle = () => {
    const { collapsed } = this.state;

    this.setState({
      collapsed: !collapsed,
    });
  };

  async checkAuth(pathname) {
    const username = pathname.split('/')[1];
    try {
      if (localStorage.jwtToken) {
        const decoded = jwtDecode(localStorage.jwtToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          return this.logout();
        }

        // verify token with server
        const response = await client.query({
          query: GET_USER,
          variables: { id: decoded.id },
        });

        const user = response?.data.user.user;

        if (user) {
          if (user.role === 'COACH') {
            return this.login({ token: response.data.user.token });
          }
          return this.login({ token: localStorage.jwtToken });
        }

        return this.removeUserData();
      }

      // NOTE: we need to deduplicate this code

      if (
        localStorage.length &&
        !localStorage.jwtToken &&
        username !== 'public'
      ) {
        const decoded = jwtDecode(localStorage[`${username}`]);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          return this.logout(username);
        }

        // verify token with server
        const response = await client.query({
          query: GET_CUSTOMER,
          variables: { id: decoded.id },
        });

        const user = response?.data.customer.customer;

        if (user) {
          return this.login({ token: localStorage[`${username}`], username });
        }

        return this.removeUserData(username);
      }
    } catch (error) {
      if ({ error }.error.message === 'Network error: Failed to fetch') return;
      if (username) {
        this.removeUserData(username);
      } else {
        this.removeUserData();
      }
    }
  }

  async login({ token, username }) {
    if (username) {
      this.props.setCurrentUser({ token, username });
    } else {
      this.props.setCurrentUser({ token });
    }
  }

  async removeUserData(username) {
    if (username) {
      this.props.logoutUser({ username });
    } else {
      this.props.logoutUser({});
    }
  }

  async logout() {
    this.removeUserData();
    const { history } = this.props;
    history.push('/signin');
  }

  render() {
    const { loading } = this.state;
    const {
      authState: {
        user: { role },
        isAuthenticated,
      },
    } = this.props;

    if (loading) return <Fallback />;

    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Suspense fallback={<Fallback />}>
          <Router>
            <Switch>
              <Route exact path="/">
                <Redirect to="/public" />
              </Route>
              <Route
                exact
                path="/:username?/signin"
                render={props =>
                  withTitle({
                    component: Signin,
                    title: 'Sign In',
                    ...props,
                  })
                }
              />
              <Route
                exact
                path="/:username?/signup"
                render={props =>
                  withTitle({
                    component: Signup,
                    title: 'Sign Up',
                    ...props,
                  })
                }
              />
              <Route
                exact
                path="/verify"
                component={Verify}
                render={props =>
                  withTitle({
                    component: Verify,
                    title: 'Verify Email',
                    ...props,
                  })
                }
              />
              <Route
                exact
                path="/:username?/reset-account"
                render={props =>
                  withTitle({
                    component: AccountReset,
                    title: 'Reset Account',
                    ...props,
                  })
                }
              />
              <Route
                exact
                path="/:username?/reset"
                render={props =>
                  withTitle({
                    component: PasswordReset,
                    title: 'Reset Password',
                    ...props,
                  })
                }
              />
              <Route path="/public" component={PublicRoutes} />
              <AdminRoute
                path="/admin"
                component={AdminPanel}
                role={role}
                isAuthenticated={isAuthenticated}
              />
              <CoachRoute
                path="/coach"
                component={CoachPanel}
                role={role}
                isAuthenticated={isAuthenticated}
              />
              <CustomerRoute
                path="/:username/customer/dashboard"
                component={Customer}
                role={role}
                isAuthenticated
              />
              {/* Default 404 */}
              <Route render={NotFound} />
            </Switch>
          </Router>
        </Suspense>
      </Layout>
    );
  }
}

const mapStateToProps = state => ({
  authState: state.authState,
});

export default connect(mapStateToProps, { logoutUser, setCurrentUser })(
  withApollo(withRouter(App))
);
