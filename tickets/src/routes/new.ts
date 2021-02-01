import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { requireAuth, validateRequest } from '@ticketingsarthak/common';

import { Ticket } from './../models/tickets';
import { TicketCreatedPublisher } from './../events/publisher/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();
router.post(
  '/api/tickets',
  requireAuth,
  body('title').not().isEmpty().withMessage('invalid title'),
  body('price')
    .isFloat({
      gt: 0,
    })
    .withMessage('invalid price'),
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title: title,
      price: price,
      userID: req.currentUser!.id,
    });
    await ticket.save();

    // its good practice to use ticket.(item)
    //because extracting items from the req.body items
    // might be different from ticket.(item)
    // because of mongoose pre- post- hooks
    new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      version: ticket.version,
      price: ticket.price,
      userId: ticket.userID,
    });
    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
