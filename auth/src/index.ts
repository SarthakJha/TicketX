import mongoose from 'mongoose';
import { app } from './app';

const PORT = 3000;

const start = async () => {
  //* this step is necessary else ts shows error when using jwt in anyother file
  //(implementing this will still show an error) we will force-unwrap
  // process.env.JWT_KEY

  console.log('Starting up....');
  if (!process.env.JWT_KEY) {
    throw new Error('jwtkey missing');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI env variable missing');
  }
  await mongoose
    // declaring auth-mongo-srv as environment variable
    // to avoid errors (env vars declared in depl file)
    .connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    })
    .then((res) => {
      console.log('mongo connection successful');
      app.listen(PORT, () => {
        console.log(`listening on port: ${PORT}`);
      });
    })
    .catch((err) => {
      console.log(err);
    });
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
