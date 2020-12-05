import mongoose from 'mongoose'

// not trackign the version number in this model since we're
// not going to be updating these records in this application.
// this would really need to be added in a production app becuase
// we'd be likely to add the ability update these records

interface PaymentAttrs {
  orderId: string
  stripeId: string
}

interface PaymentDoc extends mongoose.Document {
  orderId: string
  stripeId: string
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(arrs: PaymentAttrs): PaymentDoc
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: { required: true, type: String },
    stripeId: { required: true, type: String },
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

// custom build function so we can type check incoming attribuets
paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs)
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  'Payment',
  paymentSchema
)

export { Payment }
