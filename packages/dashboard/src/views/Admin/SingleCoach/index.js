import React, { useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useSelector } from 'react-redux';

import { GET_USER } from 'src/resolvers/user/query';
import NotFound from 'src/components/404';
import useActivitySubscription from 'src/hooks/useActivitySubscription';

import Analytics from './components/Analitycs';
import UpdateProfile from './components/UpdateProfile';

const SingleCoach = ({
  match: {
    params: { coachId },
  },
}) => {
  const activityState = useSelector(state => state.uiState.activity);

  const { data, loading, error, refetch } = useQuery(GET_USER, {
    variables: { id: coachId },
  });

  useActivitySubscription(coachId);

  useEffect(() => {
    const { type } = activityState;
    if (type === 'PROFILE') {
      refetch({
        variables: { id: coachId },
      });
    }
  }, [activityState, coachId, refetch]);

  if (error) return <NotFound message="Coach not found!" />;
  return (
    <>
      <Analytics coachId={coachId} />
      <br />
      {!loading && <UpdateProfile coach={data} loading={loading} />}
    </>
  );
};

export default SingleCoach;
