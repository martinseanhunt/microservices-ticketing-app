import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

import { OrderStatus, ExpirationCompleteEvent } from '@mhunt/ticketing-common'

import { ExpirationCompleteListener } from '../ExpirationCompleteListener'
import { Order } from '../../../models/Order'
import { Ticket } from '../../../models/Ticket'

// mocked
import { natsWrapper } from '../../natsWrapper'

const setup = async () => {
  // init the litener
  const listener = new ExpirationCompleteListener(natsWrapper.client)

  // create a ticket which we will attach to an order
  const ticket = Ticket.build({
    title: 'test',
    price: 123,
    id: mongoose.Types.ObjectId().toHexString(),
  })

  await ticket.save()

  // create an order with the ticket attached
  const order = Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket,
  })

  await order.save()

  // init the data to send with the event
  const data: ExpirationCompleteEvent['data'] = { orderId: order.id }

  // Really, rather than doing ts ignore here we could use a helper function here since we're
  // doing this in so many test files. Then we could build out the msg properly
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { ticket, order, listener, data, msg }
}

it('cancels an order when an order expired is revceived', async () => {
  const { listener, order, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updated = await Order.findById(order.id)

  expect(updated?.status).toBe(OrderStatus.Cancelled)
})

it('emits an order cancelled event', async () => {
  const { listener, order, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)
  expect(
    JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]).id
  ).toBe(order.id)
})

it('aks the message', async () => {
  const { listener, order, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalledTimes(1)
})

// it doesn't cancel cancelled or completed orders
