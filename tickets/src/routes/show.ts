import express from 'express';

import { NotFoundError } from '@ticketingsarthak/common';

import { Ticket } from './../models/tickets';

const router = express.Router();

router.get('/api/tickets/:id', async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new NotFoundError();
  }
  res.status(200).send(ticket);
});

export { router as showTicketRouter };
