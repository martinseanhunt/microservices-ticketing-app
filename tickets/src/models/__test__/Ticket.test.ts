// Testing that optimistic concurrency control is working correctly

import { Ticket } from '../Ticket'

it('implements optimistic concurrency control', async (done) => {
  // create an instance of a Ticket
  const ticket = Ticket.build({
    title: 'test ticket',
    price: 5,
    userId: '123',
  })

  await ticket.save()

  // fetch the ticket twice (2 versions of the smae ticket)
  const ticketInstance1 = await Ticket.findById(ticket.id)
  const ticketInstance2 = await Ticket.findById(ticket.id)

  // make a change to each of the tickets we just fetched
  ticketInstance1?.set({
    title: 'george',
  })

  // save the first fetched ticket - creating v2
  await ticketInstance1?.save()

  ticketInstance2?.set({
    title: 'michael',
  })

  // save the second fetched ticket (which will now have an outdated version number) expect an error
  // expect.toThrow not working as expected with TS... Workaround!
  try {
    await ticketInstance2?.save()
  } catch (e) {
    return done()
  }

  throw new Error('Should not reach this point')
})

it('increments the version number on each save', async (done) => {
  // create an instance of a Ticket
  const ticket = Ticket.build({
    title: 'test ticket',
    price: 5,
    userId: '123',
  })
  await ticket.save()

  expect(ticket.version).toBe(0)

  ticket.set({
    title: 'george',
  })
  await ticket.save()

  expect(ticket.version).toBe(1)

  ticket.set({
    title: 'michael',
  })
  await ticket.save()

  expect(ticket.version).toBe(2)

  done()
})
