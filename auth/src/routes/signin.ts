import express from 'express';
import bcrypt from 'bcrypt';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { BadRequestError } from '@ticketingsarthak/common';
import { validateRequest } from '@ticketingsarthak/common';
import { User } from './../models/user';
const router = express.Router();

router.post(
  '/api/users/signin',
  body('email').isEmail().withMessage('enter a valid email address'),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('enter a valid password')
    .isLength({ min: 4, max: 20 }),

  validateRequest,

  async (req, res) => {
    // not required bcos validateRequest middleware placed
    // const error = validationResult(req);
    // if (!error.isEmpty()) {
    //   throw new RequestValidationError(error.array());
    // }
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('invalid credentials');
    } else {
      const credStatus = await bcrypt.compare(password, existingUser.password);
      if (!credStatus) {
        throw new BadRequestError('invalid credentials');
      } else {
        const userJwt = jwt.sign(
          {
            id: existingUser.id,
            email: existingUser.email,
          },
          process.env.JWT_KEY! //using k8s secret we fetched in auth-depl
        );
        //console.log('token signed');
        //store it on session object
        req.session = {
          jwt: userJwt,
        };
        //console.log('stored in sess obj');
        //console.log(req.session.jwt);
        res.status(200).send(existingUser);
      }
    }
  }
);

export { router as signinRouter };
