/**
 * important methods inside Message class of node-nats streaming
 
 Returns the subject associated with this Message
    getSubject():string;

     Returns the sequence number of the message in the stream.
    getSequence():number;

     Returns the data associated with the message payload. If the stanEncoding is not
     set to 'binary', a string is returned.
    getData():String|Buffer;
 */

/*
 Durable subscriptions allow clients to assign a 
  durable name to a subscription when it is created. 
  Doing this causes the NATS Streaming server to track the last acknowledged message 
  for that clientID + durable name, so that only messages since the last
  acknowledged message will be delivered to the client.
 */

import nats, { Message, Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();
// second parametre is the client id(which should be unique for every listener)
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('listener connected to NATS');

  // .setManualAckMode(true) [manual acknowledgement mode] i.e we manually have to send an
  //ack back to the nats to tell info has been recieved without any error
  /**
   * if we dont ack the event it'll resend the event to the a different copy of
   * the pod(if exists) after 30 sec till we acknowledge the event
   *
   * .setManualAckMode(true) this is better to mention it bcos
   * if any thing goes wrong while proccessing the event in the service(like storing to db)
   * we cant rectify that error
   */

  stan.on('closed', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

/// GRACEFULL SHUTDOWN
// SIGTERM:- signal termination; SIGINT:- signal interrupt
process.on('SIGTERM', () => stan.close());
process.on('SIGINT', () => stan.close());
