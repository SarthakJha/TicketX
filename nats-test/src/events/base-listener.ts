import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
  subject: Subjects;
  data: any;
}
/**
 * <T extends Event>
 * every time we extend this class, T have to be mentioned
 * and this T datatype/enum/interface can be used anywhere inside the class
 * i.e T['subject']
 */
export abstract class Listener<T extends Event> {
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  abstract onMessage(msg: Message, data: T['data']): void;

  private client: Stan;
  protected ackTime = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  private subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setManualAckMode(true)
      .setDeliverAllAvailable()
      .setDurableName(this.queueGroupName)
      .setAckWait(this.ackTime);
  }
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );
    subscription.on('message', (msg: Message) => {
      console.log(
        `Message recieved: ${this.subject}/${
          this.queueGroupName
        } at ${msg.getTimestamp()}`
      );

      const parsedData = this.parseMessage(msg);
      this.onMessage(msg, parsedData);
      msg.ack();
    });
  }
  private parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }
}
