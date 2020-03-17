import { ApolloLink, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createUploadLink } from 'apollo-upload-client';

const isDev = process.env.NODE_ENV === 'development';

const uri = isDev ? process.env.REACT_BACKEND_DEV_API : '/api';

const wsUri = isDev
  ? process.env.REACT_BACKEND_DEV_WS
  : process.env.REACT_BACKEND_PROD_WS;

const getToken = () => {
  const token = localStorage.getItem('jwtToken');
  const headers = {
    Authorization: token || '',
  };
  return headers;
};

// Create an http link:
const AuthLink = (operation, forward) => {
  operation.setContext(context => ({
    ...context,
    headers: {
      ...context.headers,
      authorization: getToken().Authorization,
    },
  }));

  return forward(operation);
};

const httpLink = ApolloLink.from([
  AuthLink,
  createUploadLink({
    uri,
  }),
]);

const wsLink = new WebSocketLink({
  uri: wsUri,
  options: {
    lazy: true,
    reconnect: true,
    inactivityTimeout: 0,
    connectionParams: () => getToken(),
  },
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

export default new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
