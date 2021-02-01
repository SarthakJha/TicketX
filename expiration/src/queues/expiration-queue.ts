import Queue from 'bull';
import { ExpirationCompletePublisher } from './../events/publisher/expiration-complete-publisher';
import { natsWrapper } from './../nats-wrapper';

// optional technical step
interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  // publishes this event, when event is complete
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
