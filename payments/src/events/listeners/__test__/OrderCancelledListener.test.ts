import mongoose from 'mongoose'

import { OrderCancelledEvent, OrderStatus } from '@mhunt/ticketing-common'
import { OrderCancelledListener } from '../OrderCancelledListener'
import { Order } from '../../../models/Order'

// mocked
import { natsWrapper } from '../../natsWrapper'

const ORDER_ID = mongoose.Types.ObjectId().toHexString()

const setup = async () => {
  // init listener
  const listener = new OrderCancelledListener(natsWrapper.client)

  // create an order created event to run through the lsitener
  const data: OrderCancelledEvent['data'] = {
    id: ORDER_ID,
    version: 1,
    userId: '108',
    ticket: {
      id: '8902384',
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

it('changes an existing order to cancelled', async () => {
  const { listener, data, msg } = await setup()

  // create an order in the database whicht the listeners
  // onmessage function will attempt to update
  const order = Order.build({
    id: ORDER_ID,
    status: OrderStatus.Created,
    version: 0,
    price: 108,
    userId: '108',
  })

  await order.save()

  // run our event through the listener
  await listener.onMessage(data, msg)

  // check the DB to see if the record has been created as expected
  const updatedOrder = await Order.findById(data.id)

  expect(updatedOrder).toBeTruthy()
  expect(updatedOrder?.status).toBe(OrderStatus.Cancelled)
})

it('acks the message', async () => {
  const { listener, data, msg } = await setup()

  // create an order in the database whicht the listeners
  // onmessage function will attempt to update
  const order = Order.build({
    id: ORDER_ID,
    status: OrderStatus.Created,
    version: 0,
    price: 108,
    userId: '108',
  })

  await order.save()

  // run our event through the listener
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalledTimes(1)
})

it('doesnt ack the message if the version numbers are out of sync', async () => {
  const { listener, data, msg } = await setup()

  // create an order in the database whicht the listeners
  // onmessage function will attempt to update only the verison number
  // is out of sync
  const order = Order.build({
    id: ORDER_ID,
    status: OrderStatus.Created,
    version: 2,
    price: 108,
    userId: '108',
  })

  // run our event through the listener (try catch because we expect it to throw
  // and that shouldn't make our test fail)
  let error
  try {
    await listener.onMessage(data, msg)
  } catch (e) {
    error = e
  }

  // we're not throwing here anymore
  //expect(error).toBeTruthy()
  expect(msg.ack).toHaveBeenCalledTimes(0)
})
