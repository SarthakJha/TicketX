//  ALL ENV VARIABLES ARE IN DEPLOYMENT FILE

import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
const PORT = 3000;

const start = async () => {
  //* this step is necessary else ts shows error when using jwt in anyother file
  //(implementing this will still show an error) we will force-unwrap
  // process.env.JWT_KEY
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID env variable missing');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID env variable missing');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL env variable missing');
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('Shutting down nats client');
      process.exit();
    });

    // gracefull shutdown of NATS client
    process.on('SIGABRT', () => {
      natsWrapper.client.close();
    });
    process.on('SIGTERM', () => {
      natsWrapper.client.close();
    });

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (e) {
    console.log(e);
  }
  /*
  here the url is not mongodb://localhost:27017 because we're not running mdb locally
  so,
  we have to connect to its clusterIp service domain name i.e auth-mongo-srv
  and
  mongodb://auth-mongo-srv:27017/<name_of_db>
  mongo will automatically setup the db with name <name_of_db>
   */
};
start();
