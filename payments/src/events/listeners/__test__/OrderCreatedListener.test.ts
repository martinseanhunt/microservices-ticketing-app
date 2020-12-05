import mongoose from 'mongoose'

import { OrderCreatedEvent, OrderStatus } from '@mhunt/ticketing-common'
import { OrderCreatedListener } from '../OrderCreatedListener'
import { Order } from '../../../models/Order'

// mocked
import { natsWrapper } from '../../natsWrapper'

const setup = async () => {
  // init listener
  const listener = new OrderCreatedListener(natsWrapper.client)

  // create an order created event to run through the lsitener
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: '108',
    expiresAt: 'some date stringf',
    ticket: {
      id: '8902384',
      price: 108,
    },
    status: OrderStatus.Created,
  }

  // mock the msg... again, should probably create a helper for this so
  // we can mock it properly and not have to ts-ignore
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg }
}

it('replicates the order info', async () => {
  const { listener, data, msg } = await setup()

  // run our event through the listener
  await listener.onMessage(data, msg)

  // check the DB to see if the record has been created as expected
  const order = await Order.findById(data.id)

  expect(order).toBeTruthy()
  expect(order?.price).toBe(data.ticket.price)
})

it('acks the message', async () => {
  const { listener, data, msg } = await setup()

  // run our event through the listener
  await listener.onMessage(data, msg)

  // check the DB to see if the record has been created as expected
  const order = await Order.findById(data.id)

  expect(msg.ack).toHaveBeenCalledTimes(1)
})
