import mongoose from 'mongoose'

// An interface that decribes the properties that are required to create a new user
interface UserAttrs {
  email: string
  password: string
}

// An interface that descibes the properties that the user model has
interface UserModel extends mongoose.Model<any> {
  build(attrs: UserAttrs): any
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
})

// Custom build user function so we can use TS to type check the attributes
// so now we use User.build() instead of new User()
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

const User = mongoose.model<any, UserModel>('User', userSchema)

export { User }
