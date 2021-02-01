/**
 * creating a separate file for app bcos
 * when we run our test with super test , it assigns a random port
 * so we dont put the start function in this
 * check implementation documentation
 */

import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { errorHandler } from '@ticketingsarthak/common';
import { NotFoundError } from '@ticketingsarthak/common';

const app = express();
app.set('trust proxy', true); //trust ingress proxy
app.use(cors());
app.use(json());
app.use(
  cookieSession({
    // secure should be false for testing env( cant catch cookies)
    //process.env.NODE_ENV !== 'test' will be false in test env(thats what we need)
    signed: false, // sets encryption, false bcos jwt will already be encrypted
    secure: process.env.NODE_ENV !== 'test', // use in https mode of communication
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

/*
to run the code below install:
express-async-errors
import this after express **
this package allows us to avoid using nextFunction for errors
*/
app.all('*', async (req, res) => {
  throw new NotFoundError();
});
// whenever using async
/*
app.all('*', async (req, res,next) => {
   next(new NotFoundError());
 });
 */

app.use(errorHandler);

export { app };
