import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { BadRequestError } from '@ticketingsarthak/common';
import { User } from '../models/user';
import { validateRequest } from '@ticketingsarthak/common';

const router = express.Router();

router.post(
  '/api/users/signup',
  body('email').isEmail().withMessage('not a valid email address'),
  body('password')
    .trim() //sanitizes the password i.e takes care if blank spaces
    .isLength({ min: 4, max: 20 })
    .withMessage('password is too weak'),
  validateRequest,
  async (req: Request, res: Response) => {
    //withMessage() is sent when there is an error
    // adding async - express-async-errors package

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      if (salt) {
        bcrypt.hash(req.body.password, salt, (err, haspass) => {
          if (!err) {
            const user = User.build({
              email: req.body.email,
              password: haspass,
            });
            user.save();

            // generate jwt
            const userJwt = jwt.sign(
              {
                id: user.id,
                email: user.email,
              },
              process.env.JWT_KEY! //using k8s secret we fetched in auth-depl
            );
            //store it on session object
            req.session = {
              jwt: userJwt,
            };
            res.status(201).send(user);
          } else {
            console.log(err);
            throw new BadRequestError(err.message);
          }
        });
      }
    } else {
      throw new BadRequestError('user already exists');
    }
  }
);

// Gets all existing users
router.get('/api/users', async (req: Request, res: Response) => {
  const users = await User.find({});
  res.status(200).send(users);
});

// Deletes all users
router.delete('/api/users', async (req: Request, res: Response) => {
  const stat = await User.deleteMany({});
  res.status(204).send(stat);
});

export { router as signupRouter };
