// fake nats wrapper for testing

import { Subjects } from '@ticketingsarthak/common';

export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: String, data: String, callback: () => void) => {
          callback();
        }
      ),
  },
};
