import request from 'supertest';
import { app } from './../../app';
import { Order } from './../../models/order';
import mongoose from 'mongoose';
import { OrderStatus } from '@ticketingsarthak/common';
import { stripe } from './../../stripe';
import { Payment } from '../../models/payment';

jest.mock('./../../stripe.ts');

it('returns 404 if order doesnt exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', await global.signIn())
    .send({
      token: 'aswd',
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns 401 if order doesnt belong to the user', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    price: 1212,
    version: 0,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', await global.signIn())
    .send({
      token: 'aswd',
      orderId: order.id,
    })
    .expect(401);
});
it('returns 400 on purchase of cancelled order', async () => {
  const userID = mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: userID,
    price: 1212,
    version: 0,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', await global.signIn(userID))
    .send({
      orderId: order.id,
      token: 'swe3e',
    })
    .expect(400);
});

// mock test. takes less time than real stripe API test
it('returns a 201 with valid inputs', async () => {
  const userID = mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: userID,
    price: 1212,
    version: 0,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', await global.signIn(userID))
    .send({
      orderId: order.id,
      token: 'tok_visa', // token by stripe to mock transactions
    })
    .expect(201);

  const chargedOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargedOptions.source).toEqual('tok_visa');
  expect(chargedOptions.amount).toEqual(order.price * 100);
  expect(chargedOptions.currency).toEqual('inr');
});
