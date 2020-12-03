import Queue from 'bull'

// Creating an interface to tell TS what kind of data we're going to
// store in the job so that jobs are type safe.
interface Payload {
  orderId: string
}

// Creating a new bull Queue which will contain a job for every order created.
// When the timer expires, bull will send the job to our worker where we'll
// emit an event using nats to tell other services that the order has now expired.
// it will be the job of other services to decide what to do with that event
// as this service doesn't know anything about the state of the order. It might
// have already been paid (completed), or the user might have already cancelled etc.

// Pass the payload to Queue which tells bull what Type to expect as a job
const expirationQueue = new Queue<Payload>(
  // Queue name
  'order:expiration',
  // options
  {
    // tell bull to use redis (an in memory data store) to store the jobs
    redis: {
      host: process.env.REDIS_HOST,
    },
  }
)

// Set up our function that will process each job as it comes back from bull
// This is somewhat of an atypical usage / setup of bull in that often the processing
// would be happening in some other service to the one that adds jobs to the queue.
// e.g. an express server may create jobs on http request and some other service may
// process the computaitonally expensive jobs
expirationQueue.process(async (job) => {
  console.log(`the order ${job.data.orderId} has expired`)
})

export { expirationQueue }
