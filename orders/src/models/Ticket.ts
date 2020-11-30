import mongoose from 'mongoose'

import { OrderStatus } from '@mhunt/ticketing-common'
import { Order } from './Order'

// Look at comments in user model for detailed notes on types
// This collection will be used to store a subset of information
// from a ticket which is owned by the ticket service.
// only the information this service needs to take care of it's
// primary responsibilities

// We listen for relevant events streaming in from NATS and
// update our duplicated data here acoordingly.

interface TicketAttrs {
  // We must provide an ID as we're mirrong data from another service.
  // We need to be able to tie the tickets from ticketsservice and tickets
  // on this service together
  id: string
  title: string
  price: number
}

export interface TicketDoc extends mongoose.Document {
  title: string
  price: number
  // helper method to find out whether a ticket has been reserved
  isReserved(): Promise<boolean>
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      price: true,
      min: 0,
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

// Adding a static method on to Ticket
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  // Turning a passed 'id' back in to the _id that mongo needs
  const { id, ...rest } = attrs

  return new Ticket({
    _id: id,
    ...rest,
  })
}

// Adding a method to each document (instance of ticket) to find an order which has already
// reserved this ticket and return whether it exists or not
ticketSchema.methods.isReserved = async function () {
  // Make sure the ticket is not already reserved or purchased
  // if we have a result here we know the ticket is reserved
  const isTicketAlreadyReserved = await Order.findOne({
    status: {
      // Looking for any order associated with the ticket that isn't cancelled
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
    // mongoose handles comparing the ID's under the hood because
    // ticket is set up as a ref in the Order model
    ticket: this,
  })

  return !!isTicketAlreadyReserved
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }
