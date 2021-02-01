import request from 'supertest';
import { app } from './../../app';
import { Ticket } from './../../models/tickets';
import { natsWrapper } from '../../nats-wrapper';

it('handles POST requests at /api/tickets', async () => {
  const response = await request(app).post('/api/tickets').send({
    title: 'lakers',
    price: '100',
  });
  expect(response.status).not.toEqual(404);
});

it('only authenticated users can POST', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('doesnt return 401 if user is signed-in', async () => {
  const cookie = await global.signIn();

  //console.log(cookie);
  /*    [
    'express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJakV5TVRNMGRpSXNJbVZ0WVdsc0lqb2lNVUF4TG1OdmJTSXNJbWxoZENJNk1UVTVOVGcwTlRjMk4zMC4wbW1YUkVQTWpDWXNWOGpYbElPSUF6a0dhcV83REJreGowV1NxSmR5Tk9BIn0='
  ]*/
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'bleh',
      price: 10,
    });

  expect(response.status).toEqual(201);
});

it('throws error on invalid title', async () => {
  const cookie = await global.signIn();
  await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: null,
      price: 10,
    })
    .expect(400);
});

it('throws error on invalid price', async () => {
  const cookie = await global.signIn();
  await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'bleh',
      price: -3,
    })
    .expect(400);
});

it('creates a ticket when valid creds are supplied', async () => {
  const cookie = await global.signIn();
  let ticket = await Ticket.find({});
  expect(ticket.length).toEqual(0);

  const testTicket = {
    title: 'test',
    price: 1234,
  };
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(testTicket);
  expect(201);

  ticket = await Ticket.find({});
  expect(ticket.length).toEqual(1);
  expect(response.body.title).toEqual(ticket[0].title);
  expect(response.body.price).toEqual(ticket[0].price);
});

it('publishes an event on new ticket creation', async () => {
  const cookie = await global.signIn();
  let ticket = await Ticket.find({});
  expect(ticket.length).toEqual(0);

  const testTicket = {
    title: 'test',
    price: 1234,
  };
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(testTicket);
  expect(201);

  // console.log(natsWrapper);
  /**
   * {
        client: {
          publish: [Function: mockConstructor] {
            _isMockFunction: true,
            getMockImplementation: [Function],
            mock: [Getter/Setter],
            mockClear: [Function],
            mockReset: [Function],
            mockRestore: [Function],
            mockReturnValueOnce: [Function],
            mockResolvedValueOnce: [Function],
            mockRejectedValueOnce: [Function],
            mockReturnValue: [Function],
            mockResolvedValue: [Function],
            mockRejectedValue: [Function],
            mockImplementationOnce: [Function],
            mockImplementation: [Function],
            mockReturnThis: [Function],
            mockName: [Function],
            getMockName: [Function]
          }
        }
      }
   */
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
