/**
 * .custom((input: string)=> { mongoose.Types.ObjectId.isValid(input)})
 * checks if id is of mongodb id format
 
 *  $in : [
          OrderStatus.AwaitingPayment,
          OrderStatus.Complete,
          OrderStatus.Created
        ]
    '$in' returns only the documents with status as above mentioned conditions
 */

import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order } from './orders';
import { OrderStatus } from '@ticketingsarthak/common';

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.set('versionKey', 'version'); // __v -> version
ticketSchema.plugin(updateIfCurrentPlugin); // to implement OCC

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    // maintaining custom ids across Ticket and order service
    title: attrs.title,
    price: attrs.price,
  });
};

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

// using function() instead of arrow functions bc 'this' keyword will give error
ticketSchema.methods.isReserved = async function () {
  // this === the ticket documents we just called isReserved on
  // #1 run query to look at all orders. find the order with the ticket
  // #2 if found, check if *status* is not cancelled
  // i.e the ticket *is* reserved
  console.log(this);
  const existingOrder = await Order.findOne({
    // this === the ticket document that we just called 'isReserved' on
    ticket: this,
    status: {
      $in: [
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
        OrderStatus.Created,
      ],
    },
  });
  // console.log(!!existingOrder) will return bool (think as 'not not of existing order)

  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
