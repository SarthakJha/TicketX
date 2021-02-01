import request from 'supertest';
import { app } from './../../app';

it('returns 400 on invalid email', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'saasd',
      password: '1234',
    })
    .expect(400);
});

it('returns 400 on invalid password', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: '123',
    })
    .expect(400);
});

it('returns 400 on empty email and pass fields', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
    })
    .expect(400);
});

it('fails when email supplied doesnt exist', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: '12345',
    })
    .expect(400);
});

it('fails when credentials are wrong', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '12345',
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: '1345',
    })
    .expect(400);
});

it('responds with a cookie when creds are correct', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '12345',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: '12345',
    })
    .expect(200);
  expect(response.get('Set-Cookie')).toBeDefined();
});
