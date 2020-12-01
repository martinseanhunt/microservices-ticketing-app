import mongoose from 'mongoose'

// We could use this plugin to handle updating the version of our copied
// ticket data but in larger scale applications this might not be a good
// idea becase we can't be certain of the semantics that another service might
// be using to create it's version numbers.

// this all works but going to comment out everything todo with this plugin here
// in this branch just so I can play with building an alternative solution
// to manage and increment version numbers without the help of a plugin
// import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

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
  version: number
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc
  findWithVersion(event: {
    id: string
    version: number
  }): Promise<TicketDoc | null>
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

// using our own version property instead of __v
ticketSchema.set('versionKey', 'version')

// plugin to handle optimistic concurrency control
// increments version on each save and prevents previous versions
// being saved over the current version

// not using for this branch
// ticketSchema.plugin(updateIfCurrentPlugin)

// Since we're not using the updateIfCurrent plugin for this
// branch we can use a pre-save hook to handle only allowing
// save when the version numbers match instead.
ticketSchema.pre('save', function (done) {
  // modifying how mongoose is finding the record to update / overwrite
  // @ts-ignore // types file doesn't know about the $where property
  this.$where = {
    version: this.get('version') - 1,
  }
  done()
})

// Adding a static method on to Ticket
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  // Turning a passed 'id' back in to the _id that mongo needs
  const { id, ...rest } = attrs

  return new Ticket({
    _id: id,
    ...rest,
  })
}

// Adding a static method that is responsible for taking an event (e.g. ticket updated)
// coming from another service and using the version and ID properties to find the previous
// sequential version... E.g. if a ticketUpdated event is coming across with version 2
// we want to find version 1 in this service so we can bring it up to date. If nothing is
// found the events have liekly arrived in the wrong order so we don't want to make the update
// or acknowledge the message. Then nats will retry until the events are processed in the right order
ticketSchema.statics.findWithVersion = (event: {
  id: string
  version: number
}) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
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
