/**
 *   const { body: orderTwo } = await request(app) ?????
 */

import request from 'supertest';
import { app } from './../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

var counter = 0;
const buildTicket = async () => {
  counter += 1;
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert' + counter.toString(),
    price: 20,
  });
  await ticket.save();
  return ticket;
};

it('fetches orders for a particular user', async () => {
  // create 3 tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOne = await global.signIn();
  const userTwo = await global.signIn();
  // create one order as user #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({
      ticketId: ticketOne.id,
    })
    .expect(201);

  // create 2 orders as user #2
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({
      ticketId: ticketTwo.id,
    })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({
      ticketId: ticketThree.id,
    })
    .expect(201);

  // make request to get orders for user #2
  const { body } = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);

  // make sure we ony get orders for user #2
  // checking length of the response
  expect(body.length).toEqual(2);

  // cross checking the ticket ids
  expect(body[0].ticket.id).toEqual(ticketTwo.id);
  expect(body[1].ticket.id).toEqual(ticketThree.id);

  // cross checking the order ids
  expect(body[0].id).toEqual(orderOne.id);
  expect(body[1].id).toEqual(orderTwo.id);
});
