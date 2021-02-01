import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from './../app';

let mongo: any;

declare global {
  namespace NodeJS {
    interface Global {
      signIn(): Promise<string[]>;
    }
  }
}

// before all is a jest function
//function that before test starts
beforeAll(async () => {
  /**
   * mentioning jwtkey here bcos
   * process.env.JWT_KEY runs only in a pod and
   * it shows an error while running test bcos we
   * dont run test in pod
   */
  process.env.JWT_KEY = '123456';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

//fucntion that runs before every test
beforeEach(async () => {
  // clearing the database
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

//this will run after all the test are complete
afterAll(async () => {
  // killing connection from mongoserver
  await mongo.stop();
  await mongoose.disconnect();
});

//declaring this global function
// to ease up a little
// we dont have to write signup it() every time for cookie
//another way of doing is to make a separate file and export
global.signIn = async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '12345',
    })
    .expect(201);

  const cookie = response.get('Set-Cookie');

  return cookie;
};
