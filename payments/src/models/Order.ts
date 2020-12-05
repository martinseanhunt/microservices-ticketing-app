import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

import { OrderStatus } from '@mhunt/ticketing-common'

// We're storing information from orders created via the orders service so we can
// valudate an incoming payment request (that the user is correct and that the
// price paid is correct, the status is in the right state etc)

// Note that we don't need to store the expiresAt here as the orders service will tell
// us when an order is expired by changing the status to cancelled

// similarly we don't need to store ticket id as any crossover between the ticket
// and an order is happening in the orders service. We only care that an order needs paying for,
// that the status of the order is in the correct state to accept payment, that the user is correct
// and the tickets price is right. Th we will emit an event telling the orders service that the order has
// been completed and that it should change the status of the order.

// Of course we care about the version so that we can implement optimistic ocncurrency control!

// see other models for more detailed comments on model creation and TS interfaces
interface OrderAttrs {
  id: string
  version: number
  userId: string
  // Not that we don't have to replicate the nested relationship between
  // order and ticket that we have in the orders service... We can just
  // pull of the price of the ticket and store it here without putting it
  // under a ticket property keeping this model simple and flat.
  price: number
  status: OrderStatus
}

interface OrderDoc extends mongoose.Document {
  // no need to explicity provide Id to a returned orderdoc as it's
  // already included by the mongoose.Document type we're extending
  version: number
  userId: string
  price: number
  status: OrderStatus
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc
  findWithVersion(event: {
    id: string
    version: number
  }): Promise<OrderDoc | null>
}

const orderSchema = new mongoose.Schema(
  {
    // remember the version property is being maintained automatically by
    // the plugin we're using for version control.
    userId: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      // Even though our TS interfaces should catch if
      // we don't pass a valid OrderStatus we should still
      // set it up the mongoose way here and type check at the
      // schema level.
      enum: Object.values(OrderStatus),
    },
  },
  {
    // define what we return from a document over http etc
    toJSON: {
      transform(doc, ret) {
        // renaming _id to id for consistent id property
        // across services which may not all be using mongoose
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)

// renames mongoose default __V to version
orderSchema.set('versionKey', 'version')

// wire up updateIfCurrentPlugin for auto incremeting versions and
// not allowing out of sync writes.
orderSchema.plugin(updateIfCurrentPlugin)

// Adding a static method that is responsible for taking an event (e.g. Order cancelled)
// coming from another service and using the version and ID properties to find the previous
// sequential version... E.g. if a orderCancelled event is coming across with version 2
// we want to find version 1 in this service so we can bring it up to date. If nothing is
// found the events have liekly arrived in the wrong order so we don't want to make the update
// or acknowledge the message. Then nats will retry until the events are processed in the right order
orderSchema.statics.findWithVersion = (event: {
  id: string
  version: number
}) => {
  return Order.findOne({
    _id: event.id,
    version: event.version - 1,
  })
}

// custom build function so we can type check incoming attribuets
orderSchema.statics.build = (attrs: OrderAttrs) => {
  const { id, ...rest } = attrs

  return new Order({
    // renaming the incoming id to _id before creation since it's what mongoose needs
    _id: attrs.id,
    // rest of the properties can jus tbe added as-is
    ...rest,
  })
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
