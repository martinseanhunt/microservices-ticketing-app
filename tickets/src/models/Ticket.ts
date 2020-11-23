import mongoose from 'mongoose'

// The attributes that are provided when creating a new ticket
// used with the build funciton we're creating ourselves
interface TicketAttrs {
  title: string
  price: number
  userId: string
}

// The attributest that are returned when requesting a ticket document
interface TicketDoc extends mongoose.Document {
  title: string
  price: number
  userId: string
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
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
      },
      // removes _id
      versionKey: false,
    },
  }
)

// Creating a custom funciton fre creating a new document so we an type check it using our
// TicketAttrs interface above
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs)
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }
