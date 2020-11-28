import mongoose from 'mongoose'

import { OrderStatus } from '@mhunt/ticketing-common'

// Look at comments in user model for detailed notes on types
// This collection will be used to store a subset of information
// from a ticket which is owned by the ticket service.
// only the information this service needs to take care of it's
// primary responsibilities

// We listen for relevant events streaming in from NATS and
// update our duplicated data here acoordingly.

interface TicketAttrs {
  title: string
  price: number
}

export interface TicketDoc extends mongoose.Document {
  title: string
  price: number
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

ticketSchema.statics.build((attrs: TicketAttrs) => {
  return new Ticket(attrs)
})

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticekt', ticketSchema)

export { Ticket }
