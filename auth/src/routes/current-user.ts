import express from 'express';

import { currentUser } from '@ticketingsarthak/common';
const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res, next) => {
  res.status(200).send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
