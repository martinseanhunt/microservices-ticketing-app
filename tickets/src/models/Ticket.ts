import mongoose from 'mongoose'

// For optimistic concurrency control. Allows us to only update
// a record if it's the next version... e.g. updating from v1 - v3 will fail
// This helps us handle concurrentcy issues when updating records between services.
// See the tests for a better idea of exactly what this is doing

// NOTE: Apparetly mongoose has this natively now... Look in to it!
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

// The attributes that are provided when creating a new ticket
// used with the build funciton we're creating ourselves
interface TicketAttrs {
  title: string
  price: number
  userId: string
}

// The attributest that are returned when requesting a ticket document
interface TicketDoc extends mongoose.Document {
  id: string
  title: string
  price: number
  userId: string
  // our custom version propery since we're not using the standard
  // __v from mongoose.doc
  version: number
  // Order ID of an associated ticket. If this is not null then the ticket is locked
  orderId?: string
}

// Any methods or properties (statics) the Model itself has
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc
}

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    userId: { type: String, required: true },
    orderId: { type: String, required: false },
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

// Using our own 'version' field rather than the default __V for nicer formatted events etc
ticketSchema.set('versionKey', 'version')

// wire up the update if current plugin for optimistic concurrency control
ticketSchema.plugin(updateIfCurrentPlugin)

// Creating a custom funciton fre creating a new document so we an type check it using our
// TicketAttrs interface above
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs)
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }
