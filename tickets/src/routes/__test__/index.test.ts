import request from 'supertest';
import { app } from './../../app';

// function to post a ticket
const createTicket = async () => {
  const cookie = await global.signIn();
  await request(app).post('/api/tickets').set('Cookie', cookie).send({
    title: 'blah',
    price: 123,
  });
};

it('returns a list of tickets', async () => {
  for (let i = 0; i < 8; i++) {
    await createTicket();
  }
  const response = await request(app).get('/api/tickets').expect(200);
  expect(response.body.length).toEqual(8);
});
