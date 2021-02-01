import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan;

  // client getter
  get client() {
    if (!this._client) {
      throw new Error('cannot access nats client before connecting');
    }
    return this._client;
  }

  connect(clusterID: string, clientID: string, url: string) {
    this._client = nats.connect(clusterID, clientID, { url });
    return new Promise((resolve, rej) => {
      // resolving promise
      this.client.on('connect', () => {
        console.log('Connected to NATS...');
        resolve();
      });
      // rejecting promise
      this.client.on('error', (e) => {
        rej(e);
      });
    });
  }
}

// exporting stan singleton
export const natsWrapper = new NatsWrapper();
