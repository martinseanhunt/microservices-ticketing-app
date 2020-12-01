import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

import { TicketUpdatedListener } from '../TicketUpdatedListener'
import { TicketUpdatedEvent, Subjects } from '@mhunt/ticketing-common'
import { Ticket } from '../../../models/Ticket'

// mocked
import { natsWrapper } from '../../natsWrapper'

const setup = async (): Promise<{
  data: TicketUpdatedEvent['data']
  msg: Message
  listener: TicketUpdatedListener
}> => {
  // Create an initial ticket to update
  const init = Ticket.build({
    id: mongoose.Types.ObjectId().toString(),
    title: 'testing',
    price: 22.3,
  })

  await init.save()

  // create an instance of the listner
  const listener = new TicketUpdatedListener(natsWrapper.client)

  // create a fake data event
  // could have done const data: TicketCreatedEvent['data']
  const data: TicketUpdatedEvent['data'] = {
    id: init.id,
    title: 'testing update',
    price: 22.3,
    userId: '235235365',
    version: 1,
  }

  // create a fake message object
  // @ts-ignore - ignoring becuase we only care about ack
  const msg: Message = {
    ack: jest.fn(),
  }

  return { data, msg, listener }
}

it('finds and updates a ticket from an incoming event', async () => {
  const { data, listener, msg } = await setup()

  // run a message through
  await listener.onMessage(data, msg)

  // make sure a ticket was created
  const ticket = await Ticket.findById(data.id)

  expect(ticket?.title).toBe(data.title)
})

it('aks the message', async () => {
  const { data, msg, listener } = await setup()

  // run a message through
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalledTimes(1)
})

it('doesnt ack the message if orders arrive out of sync', async () => {
  const { data, msg, listener } = await setup()

  // run a message through with an incorrect version
  await listener.onMessage({ ...data, version: 2 }, msg)
  await listener.onMessage({ ...data, version: 3 }, msg)
  await listener.onMessage({ ...data, version: 4 }, msg)

  expect(msg.ack).toHaveBeenCalledTimes(0)
})

it('doesnt acks the messages that come in correctly', async () => {
  const { data, msg, listener } = await setup()

  // run a message through with an incorrect version
  await listener.onMessage({ ...data, version: 2 }, msg)
  expect(msg.ack).toHaveBeenCalledTimes(0)

  await listener.onMessage({ ...data, version: 1 }, msg)
  await listener.onMessage({ ...data, version: 2 }, msg)
  expect(msg.ack).toHaveBeenCalledTimes(2)
})
