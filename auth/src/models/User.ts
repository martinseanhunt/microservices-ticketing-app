import mongoose from 'mongoose'

import { Password } from '../utils/Password'

// An interface that decribes the properties that are required to create a new user
interface UserAttrs {
  email: string
  password: string
}

// An interface that descibes the properties / methods that the user model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc
}

// An interface that describes the properties that a User Document has.
export interface UserDoc extends mongoose.Document {
  email: string
  password: string
  // If there are other properties which get added in along the creation pipeline or by mongoose
  // you'd add them in here.
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    // This is going to define what properties we see when using JSON.stringinfy on the
    // object. E.g. when returning the user object when responding to an incoming API request
    toJSON: {
      transform: (doc, ret) => {
        // make direct changes to the ret object (which is the plain object version of the document)
        // in order to see them reflected in what gets returned from JSON.stringifyt
        delete ret.password
        ret.id = ret._id
      },
    },
    // deletes the __V property
    versionKey: false,
  }
)

// Pre save hook to hash the password
// using regular function syntax because we're making use of 'this'
userSchema.pre('save', async function (done) {
  // We only want to hash the password if it's been changed otherwise we'd
  // be rehashing the password any time we make any update to a given user document
  // this will return true if the user is changing their password AND when a new
  // user is created
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'))
    this.set('password', hashed)
  }

  // mongo is weird and doesn't know how to handle async... We have to call done explicitly
  done()
})

// Custom build user function so we can use TS to type check the attributes
// so now we use User.build() instead of new User()
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }
