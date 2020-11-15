import mongoose from 'mongoose'

import { app } from './app'

// Connect to database and start server
const connectAndStart = async () => {
  // check that our env variables are all set up
  // We have to check this exists because TS doesn't let us assume it is set
  // it does this by giving env vars a type of string | undefined so we can't
  // reference it unless it's been checked
  if (!process.env.JWT_KEY) throw new Error('Environment var jwt key not found')

  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log('Connected to mongo db')
  } catch (e) {
    console.error(e)
  }

  // Start server
  app.listen(3000, () => console.log('Auth service listening on 3000!'))
}

connectAndStart()
