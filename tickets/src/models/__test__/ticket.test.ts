import { Ticket } from './../tickets';

it('implements optmistic concurrency control', async (done) => {
  // create instance of ticket
  const ticket = Ticket.build({
    title: 'aaaa',
    price: 123,
    userID: 'aasadedccc',
  });

  // save to db
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the ticket
  firstInstance!.set({ price: 100 });
  secondInstance!.set({ price: 300 });

  // save first fetched ticket
  await firstInstance!.save();

  // save second fetched ticket  (EXPECT ERROR)
  try {
    expect(secondInstance!.save()).toThrow();
  } catch (err) {
    // done() is a method to tell jest to gracefully exit test suite
    return done();
  }

  throw new Error('test should not reach this point');
});

it('increments the version number on save', async () => {
  const ticket = Ticket.build({
    title: 'aaaa',
    price: 123,
    userID: 'aasadedccc',
  });

  // save to db
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
