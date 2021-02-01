import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

stan.on('connect', async () => {
  console.log('connected to nats publishing');
  ///: BEFORE USING CLASSES

  // const data = JSON.stringify({
  //   id: '123',
  //   name: 'concert',
  //   price: 30,
  // });

  // stan.publish('ticket:created', data, () => {
  //   console.log('Event pubished!!');
  // });

  const publisher = new TicketCreatedPublisher(stan);
  ///: AFTER USING CLASSES (type checking is improved (i.e less typo error))
  try {
    await publisher.publish({
      id: '123',
      title: 'concert',
      price: 20,
    });
  } catch (err) {
    console.log(err);
  }
});
