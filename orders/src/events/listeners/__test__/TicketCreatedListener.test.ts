import mongoose from 'mongoose'

import { TicketCreatedListener } from '../TicketCreatedListener'
import { TicketCreatedEvent, Subjects } from '@mhunt/ticketing-common'
import { Ticket } from '../../../models/Ticket'

// mocked
import { natsWrapper } from '../../natsWrapper'

const setup = async (): Promise<{
  event: TicketCreatedEvent
  msg: any
  listener: TicketCreatedListener
}> => {
  // create an instance of the listner
  const listener = new TicketCreatedListener(natsWrapper.client)

  // create a fake data event
  // could have done const data: TicketCreatedEvent['data']
  const event: TicketCreatedEvent = {
    subject: Subjects.TicketCreated,
    data: {
      id: mongoose.Types.ObjectId().toString(),
      title: 'test',
      price: 22.3,
      userId: '235235365',
      version: 0,
    },
  }

  // create a fake message object
  // @ts-ignore - ignoring becuase we only care about ack
  const msg: Message = {
    ack: jest.fn(),
  }

  // call the onmessage function
  await listener.onMessage(event.data, msg)

  return { event, msg, listener }
}

it('creates and saves a ticket from an incoming event', async () => {
  const { event } = await setup()

  // make sure a ticket was created
  const ticket = await Ticket.findById(event.data.id)

  expect(ticket?.title).toBe(event.data.title)
})

it('aks the message', async () => {
  const { event, msg, listener } = await setup()

  expect(msg.ack).toHaveBeenCalledTimes(1)
})
