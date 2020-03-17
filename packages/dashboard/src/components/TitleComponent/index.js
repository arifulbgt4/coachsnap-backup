import React from 'react';
import Helmet from 'react-helmet';
import { Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

import useActivitySubscription from 'src/hooks/useActivitySubscription';

const TitleComponent = ({ title }) => {
  const defaultTitle = 'CoachSnap';
  return (
    <Helmet>
      <title>{title ? `${title} - CoachSnap` : defaultTitle}</title>
    </Helmet>
  );
};

const withTitle = ({ component: Component, title, ...props }) => {
  return (
    <React.Fragment>
      <TitleComponent title={title} />
      <Component {...props} />
    </React.Fragment>
  );
};

export const TitleRoute = ({ path, component, title }) => {
  const coachId = useSelector(state => state.authState.user.id);

  const {
    loading: activityLoading,
    data: activityData,
    error: activityError,
  } = useActivitySubscription(coachId);


  return (
    <Route
      exact
      path={path}
      render={props =>
        withTitle({
          component,
          title,
          activityData,
          ...props,
        })
      }
    />
  );
};

export default withTitle;
