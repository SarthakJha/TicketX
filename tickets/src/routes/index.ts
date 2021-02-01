import express from 'express';
import { Ticket } from './../models/tickets';

const router = express.Router();
router.get('/api/tickets', async (req, res, next) => {
  const tickets = await Ticket.find({});
  if (!tickets) {
    res.status(200).send({
      message: '0 tickets',
    });
  }
  res.status(200).send(tickets);
});
export { router as indexRouter };
