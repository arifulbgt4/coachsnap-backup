const moment = require('custom-moment');
const createServer = require('./loaders/server');

moment.tz.setDefault('America/New_York');

const server = createServer();

const options = {
  port: process.env.API_PORT,
  debug: process.env.NODE_ENV === 'development', // show error only on development
};

server.start(options, listener =>
  console.log(`Server is now running on port http://localhost:${listener.port}`)
);
