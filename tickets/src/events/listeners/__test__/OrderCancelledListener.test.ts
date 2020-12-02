import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

// These tests are mostly copy / pasted with a few quick edits... Don't use as
// a reference as these could easily be better designed

import {
  OrderCancelledEvent,
  OrderStatus,
  Listener,
} from '@mhunt/ticketing-common'
import { OrderCancelledListener } from '../OrderCancelledListener'
import { Ticket } from '../../../models/Ticket'

// Mocked
import { natsWrapper } from '../../natsWrapper'

const init = (): {
  listener: Listener<OrderCancelledEvent>
  msg: Message
} => {
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  // Initialise the listner
  // Note: I don't think we're actually testing the listen() function anywhere
  // Should prbably do this.
  const listener = new OrderCancelledListener(natsWrapper.client)

  return {
    listener,
    msg,
  }
}

it('Removes the orderID when reveiving a cancelled event', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    title: 'test ticket',
    price: 108,
    userId: '108',
  })
  ticket.set({ orderId: mongoose.Types.ObjectId().toHexString() })

  await ticket.save()

  // init the listener
  const { listener, msg } = init()

  // init the data to send
  const data: OrderCancelledEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Cancelled,
    userId: '108',
    version: 0,
    ticket: {
      id: ticket.id,
    },
  }

  // Pass a fake event to our onMessage function
  await listener.onMessage(data, msg)

  // check that the ticket now has NO order ID saved
  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket?.orderId).toBeFalsy()

  // check that the message is acked
  expect(msg.ack).toHaveBeenCalledTimes(1)
})

it('doesnt ack the message if no ticket exists', async () => {
  // Create a ticketId without an associated ticket in the db
  const ticketId = mongoose.Types.ObjectId().toHexString()

  // init the listener
  const { listener, msg } = init()

  // init the data to send
  const data: OrderCancelledEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: '108',
    version: 0,
    ticket: {
      id: ticketId,
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
  const data: OrderCancelledEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: '108',
    version: 0,
    ticket: {
      id: ticket.id,
    },
  }

  // Pass a fake event to our onMessage function
  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(natsWrapper.client.publish).toBeCalledTimes(1)

  expect(
    JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  ).toMatchObject({
    title: updatedTicket?.title,
    price: updatedTicket?.price,
    userId: updatedTicket?.userId,
    id: updatedTicket?.id,
    version: 1,
    // orderId is't included in the published event since it's undefined
  })
})
