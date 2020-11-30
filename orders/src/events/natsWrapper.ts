import nats, { Stan } from 'node-nats-streaming'

// Create a class that has the instance of the stan client as well as a connect method which
// we can await on using a singleton pattern.
class NatsClientWrapper {
  // int the property that will hold the conencted stan client
  // ? tells TS that this can be undefined (i.e. before we connect)
  private _client?: Stan

  // Getter allows us to hadnle the logic of what to return when we request 'client' as
  // a property on the instance. This way we can throw an error if there's no client
  // defined at the point we try to get it.
  get client() {
    if (!this._client)
      throw new Error('Cannot access NATS client before connecting')
    return this._client
  }

  // The connect method returns a promise so we can await it. Once the stan listener fires
  // we know we're connected to nats so we can set the client instance in this class and
  // resolve the promise
  connect(clusterID: string, clientID: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._client = nats.connect(clusterID, clientID, { url })

      // Now when we resolve the promise we know the client is connected
      // using the getter here rather than trying to access this._cleint directly
      // because we're null checking in the getter so TS is happy that it's not
      // going to be undefined
      this.client.on('connect', () => {
        console.log('connected to nats')
        resolve()
      })

      this.client.on('error', (err) => {
        reject(err)
      })
    })
  }
}

// Create an instance of the class which node will cache and export it.
// We can then import this instance in to multiple files and the we will only ever
// create one instance of the class. We can now import this instance in to index , in
// order to connect as well as in our route files where we can use the connected stan client
export const natsWrapper = new NatsClientWrapper()
