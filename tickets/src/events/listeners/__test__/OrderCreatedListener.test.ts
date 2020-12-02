import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

import {
  OrderCreatedEvent,
  OrderStatus,
  Listener,
  Subjects,
} from '@mhunt/ticketing-common'
import { OrderCreatedListener } from '../OrderCreatedListener'
import { Ticket } from '../../../models/Ticket'

// Mocked
import { natsWrapper } from '../../natsWrapper'

const init = (): {
  listener: Listener<OrderCreatedEvent>
  msg: Message
} => {
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  // Initialise the listner
  // Note: I don't think we're actually testing the listen() function anywhere
  // Should prbably do this.
  const listener = new OrderCreatedListener(natsWrapper.client)

  return {
    listener,
    msg,
  }
}

it('saves an order ID to the assiciated ticket when receiving an order created event', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    title: 'test ticket',
    price: 108,
    userId: '108',
  })

  await ticket.save()

  // init the listener
  const { listener, msg } = init()

  // init the data to send
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: '108',
    expiresAt: new Date().toISOString(),
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  }

  // Pass a fake event to our onMessage function
  await listener.onMessage(data, msg)

  // check that the ticket now has the correct order ID saved
  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket?.orderId).toBe(data.id)

  // check that the message is acked
  expect(msg.ack).toHaveBeenCalledTimes(1)
})

it('doesnt ack the message if no ticket exists', async () => {
  // Create a ticketId without an associated ticket in the db
  const ticketId = mongoose.Types.ObjectId().toHexString()

  // init the listener
  const { listener, msg } = init()

  // init the data to send
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: '108',
    expiresAt: new Date().toISOString(),
    version: 0,
    ticket: {
      id: ticketId,
      price: 108,
    },
  }

  // Pass a fake event to our onMessage function which we expect to throw
  let errored
  try {
    await listener.onMessage(data, msg)
  } catch (e) {
    errored = true
  }

  expect(errored).toBe(true)

  // check that the message is not acked
  expect(msg.ack).toHaveBeenCalledTimes(0)
})

it('publishes a ticket updated event', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    title: 'test ticket',
    price: 108,
    userId: '108',
  })

  await ticket.save()

  // init the listener
  const { listener, msg } = init()

  // init the data to send
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: '108',
    expiresAt: new Date().toISOString(),
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  }

  // Pass a fake event to our onMessage function
  await listener.onMessage(data, msg)

  // check that the ticket now has the correct order ID saved
  const updatedTicket = await Ticket.findById(ticket.id)

  expect(natsWrapper.client.publish).toBeCalledTimes(1)
  expect(natsWrapper.client.publish).toHaveBeenCalledWith(
    Subjects.TicketUpdated,
    JSON.stringify({
      title: updatedTicket?.title,
      price: updatedTicket?.price,
      userId: updatedTicket?.userId,
      version: 1,
      orderId: updatedTicket?.orderId,
      id: updatedTicket?.id,
    }),
    expect.anything()
  )

  // could also do this to tell TS that the publish function is a mock so we can
  // access .mock.calls on it :)
  // this would be better because we can test on the parsed object

  // (natsWrapper.client.publish as jest.Mock()).mock.calls[0][1]
})
