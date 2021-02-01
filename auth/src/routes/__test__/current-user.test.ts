import request from 'supertest';
import { app } from './../../app';

it('responds with details of current user', async () => {
  // code below is not required cuz we use global function

  // const response = await request(app)
  //   .post('/api/users/signup')
  //   .send({
  //     email: 'test@test.com',
  //     password: '12345',
  //   })
  //   .expect(201);

  //supertest doesnot manage cookies like browser and postman does
  // so we manually have to set cookie using .set
  const cookie = await global.signIn();

  const res1 = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .expect(200);

  expect(res1.body.currentUser.email).toEqual('test@test.com');
  // console.log(res1.body);
});

it('responds with null if not authenticated', async () => {
  const response = await request(app).get('/api/users/currentuser').expect(200);

  expect(response.body.currentUser).toEqual(null);
});
