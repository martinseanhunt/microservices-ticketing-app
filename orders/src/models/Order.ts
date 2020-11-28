import mongoose from 'mongoose'

import { OrderStatus } from '@mhunt/ticketing-common'

import { Ticket, TicketDoc } from './Ticket'

// Look at comments in user model for detailed notes on types

interface OrderAttrs {
  userId: string
  status: OrderStatus
  exiresAt: Date
  ticket: TicketDoc
}

interface OrderDoc extends mongoose.Document {
  userId: string
  status: OrderStatus
  exiresAt: Date
  ticket: TicketDoc
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      // Even though our TS interfaces should catch if
      // we don't pass a valid OrderStatus we should still
      // set it up the mongoose way here. Using onvject.values to
      // get the various enum options
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    // Creating a reference to another mongoose collection
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)

orderSchema.statics.build((attrs: OrderAttrs) => {
  return new Order(attrs)
})

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
