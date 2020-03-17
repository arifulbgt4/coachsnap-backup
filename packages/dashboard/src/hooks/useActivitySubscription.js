import React from 'react';
import { useDispatch } from 'react-redux';
import { useSubscription } from '@apollo/react-hooks';

import { ACTIVITIES } from 'src/resolvers/activity/subscription';
import { addActivity } from 'src/state/ducks/ui/actions';

function useActivitySubscription(coachId) {
  const dispatch = useDispatch();
  const res = useSubscription(ACTIVITIES, {
    variables: { coachId },
    onSubscriptionData: ({ subscriptionData }) => {
      const {
        data: { activityPubSub },
      } = subscriptionData;
      dispatch(addActivity(activityPubSub));
    },
  });
  return res;
}

export default useActivitySubscription;
