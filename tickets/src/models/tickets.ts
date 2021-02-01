import mongoose from 'mongoose';
// implementing OCC
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
  title: string;
  price: number;
  userID: string;
}

interface TicketDocs extends mongoose.Document {
  title: string;
  price: number;
  userID: string;
  version: number; // mongoose.Document doesnt have any version (rather has __v)
  orderId?: string;
}

interface TicketModel extends mongoose.Model<TicketDocs> {
  build(attrs: TicketAttrs): TicketDocs;
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
    },
    userID: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        (ret.id = ret._id), delete ret._id;
      },
    },
  }
);

ticketSchema.set('versionKey', 'version'); // __v -> version
ticketSchema.plugin(updateIfCurrentPlugin); // to implement OCC

ticketSchema.statics.build = (attrs: TicketAttrs): TicketDocs => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDocs, TicketModel>('Ticket', ticketSchema);

export { Ticket };
