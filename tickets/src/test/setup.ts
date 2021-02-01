import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';

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

  const mongo = new MongoMemoryServer();

  //mongoMemoryServer generates own uri
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// mock nats wrapper for tests (decalring here rather than indivisual files)
jest.mock('../nats-wrapper.ts');

//fucntion that runs before every test
beforeEach(async () => {
  // clears values of mock publish implementation in different suites
  jest.clearAllMocks();
  // clearing the database
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

//this will run after all the test are complete
afterAll(async () => {
  // killing connection from mongoserver
  //await mongo.stop();
  await mongoose.disconnect();
});

//declaring this global function
// to ease up a little
// we dont have to write signup it() every time for cookie
//another way of doing is to make a separate file and export
global.signIn = async () => {
  /**
   *  the code below wont work in any other service except auth service
   * bcos '/api/users/signup' only exist in auth (will return 404 error)
   * we need to fabricate the cookie ourselves
   */
  // const response = await request(app).post('/api/users/signup')
  //   .send({
  //     email: 'test@test.com',
  //     password: '12345',
  //   }).expect(201);
  // const cookie = response.get('Set-Cookie');
  // return cookie;

  //build a JWT payload {email,id}
  const payload = {
    // generates a valid id (its fake tho)
    id: new mongoose.Types.ObjectId().toHexString(),
    email: '1@1.com',
  };

  //create JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //build session object ({jwt: ''})
  const session = { jwt: token };
  //console.log(session);
  /*{
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMTM0diIsImVtYWlsIjoiMUAxLmNvbSIsImlhdCI6MTU5NTg0NTc2N30.0mmXREPMjCYsV8jXlIOIAzkGaq_7DBkxj0WSqJdyNOA'
}*/

  //turn that session into json
  const sessionJSON = JSON.stringify(session); //.stringify converts json to json String
  //console.log(sessionJSON);
  //{"jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMTM0diIsImVtYWlsIjoiMUAxLmNvbSIsImlhdCI6MTU5NTg0NTc2N30.0mmXREPMjCYsV8jXlIOIAzkGaq_7DBkxj0WSqJdyNOA"}

  //take json and encode it as Base64
  const base64 = Buffer.from(sessionJSON).toString('base64');
  //console.log(base64);
  /*
 eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJakV5TVRNMGRpSXNJbVZ0WVdsc0lqb2lNVUF4TG1OdmJTSXNJbWxoZENJNk1UVTVOVGcw
 TlRjMk4zMC4wbW1YUkVQTWpDWXNWOGpYbElPSUF6a0dhcV83REJreGowV1NxSmR5Tk9BIn0=
 */

  //return string (thats the cookie!)
  return [`express:sess=${base64}`];
};
