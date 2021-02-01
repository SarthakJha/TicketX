import express from 'express';
import { Ticket } from './../models/tickets';
import { body } from 'express-validator';
import {
  validateRequest,
  requireAuth,
  NotAuthorizedError,
  NotFoundError,
  BadRequestError,
} from '@ticketingsarthak/common';
import { TicketUpdatedPublisher } from './../events/publisher/ticket-updated-publisher';
import { natsWrapper } from './../nats-wrapper';
const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  body('title').not().isEmpty().withMessage('invalid title'),
  body('price').isFloat({ gt: 0 }).withMessage('invalid price'),
  validateRequest,
  async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }

    // checking if ticket is reserved
    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }

    if (req.currentUser!.id !== ticket.userID) {
      throw new NotAuthorizedError();
    } else {
      // ticket.set is a better method of doing this
      // const updatedTicket = await Ticket.findByIdAndUpdate(
      //   req.params.id,
      //   req.body
      // );
      ticket.set(req.body);
      await ticket.save();
      new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        userId: ticket.userID,
        version: ticket.version,
        price: ticket.price,
      });

      res.status(200).send(ticket);
      console.log(ticket);
    }
  }
);

export { router as updateRouter };
