import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';

import App from './views/App';
import client from './config/client';
import configureStore from './state/store';

function Container() {
  const reduxStore = configureStore(window.REDUX_INITIAL_DATA);

  return (
    <ApolloProvider client={client}>
      <Router>
        <Provider store={reduxStore}>
          <App />
        </Provider>
      </Router>
    </ApolloProvider>
  );
}

ReactDOM.render(<Container />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept('./views/App', () => {
    ReactDOM.render(<Container />, document.getElementById('root'));
  });
}
