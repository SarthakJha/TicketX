import request from 'supertest';
import { app } from './../../app';

it('returns 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '1234',
    })
    .expect(201);
});

it('returns 400 on invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'saasd',
      password: '1234',
    })
    .expect(400);
});

it('returns 400 on invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '123',
    })
    .expect(400);
});

it('returns 400 on empty email and pass fields', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
    })
    .expect(400);

  return request(app)
    .post('/api/users/signup')
    .send({
      password: '1234',
    })
    .expect(400);
});

it('dissallows dupicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: '1@1.com',
      password: '12344',
    })
    .expect(201);
  return request(app)
    .post('/api/users/signup')
    .send({
      email: '1@1.com',
      password: '12345',
    })
    .expect(400);
});

it('sets a cookie after successful signup', async () => {
  // this test will fail if https is used
  // check app.ts for cookieSession env
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: '1@1.com',
      password: '12344',
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
