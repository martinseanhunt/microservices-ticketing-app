import mongoose from 'mongoose'

import { app } from './app'
import { natsWrapper } from './events/natsWrapper'

import { TicketCreatedListener } from './events/listeners/TicketCreatedListener'
import { TicketUpdatedListener } from './events/listeners/TicketUpdatedListener'
import { ExpirationCompleteListener } from './events/listeners/ExpirationCompleteListener'

// Connect to database and start server
const connectAndStart = async () => {
  // check that our env variables are all set up
  // We have to check this exists because TS doesn't let us assume it is set
  // it does this by giving env vars a type of string | undefined so we can't
  // reference it unless it's been checked
  if (!process.env.JWT_KEY) throw new Error('Environment var jwt key not found')
  if (!process.env.MONGO_URI)
    throw new Error('Environment var MONGO_URI not found')

  if (
    !process.env.NATS_URI ||
    !process.env.NATS_CLUSTER_ID ||
    !process.env.NATS_CLIENT_ID
  )
    throw new Error('Environment variables for NATS not found')

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log('Connected to mongo db')

    // connecting to nats in a way that we're able to pass the client down to
    // routes and know that the client is connected at the point we try to do
    // anything with it. the natsClient module is acting as a singleton and working
    // similarly to the way mongoose does. We await the connection here and then
    // can import the client from the same file in our routes. Because we've awaited
    // here we know that the client will always be connected at the point we try to
    // use it.
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      // Remember, this  needs to be unique so that when we have multiple instances
      // of a service running each instance has it's own nats client ID
      // all client ID's connected to the nats server needs to be unique
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URI
    )

    // listening for the close event and shutting down the server when
    // the connection closes for graceful shutdown. Doing this here instead
    // of in the class because it doesn't feel like a good idea to hide away
    // anything that can shut down the entire server!
    natsWrapper.client.on('close', () => {
      console.log('closing nats connection')
      process.exit()
    })

    // listening for terminate and interrupt signals and telling
    // nats to close, ultimately shutting down the server
    process.on('SIGINT', () => natsWrapper.client.close())
    process.on('SIGTERM', () => natsWrapper.client.close())
  } catch (e) {
    console.error(e)
  }

  // listeners
  new TicketCreatedListener(natsWrapper.client).listen()
  new TicketUpdatedListener(natsWrapper.client).listen()
  new ExpirationCompleteListener(natsWrapper.client).listen()

  // Start server
  app.listen(3000, () => console.log('Orders service listening on port 3000!'))
}

connectAndStart()
