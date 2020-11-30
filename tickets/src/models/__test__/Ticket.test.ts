// Testing that optimistic version control is working correctly

import { Ticket } from '../Ticket'

it('implements optimistic concurrency control', async () => {
  // creat an instance of a Ticket
  // save th ticket to the db
  // fetch the ticket twice
  // make two seperate changes to the tickets we fetched
  // save the first fetched ticket
  // save the second fetched ticket (which will now have an outdated version number)
})
