import express from 'express'

import { protectedRoute } from '../middlewares/protectedRoute'

const router = express.Router()

router.get('/api/users/currentuser', protectedRoute, async (req, res) => {
  // if it is try to get the user - in the course SG suggests to just send
  // back the decoded info from the HWT but I'm not sure about this. WHat if we've deleted
  // the user from db or changed their email address etc
  // const user = await User.findOne({ email: decodedJWT.email})

  // Sends the user object that we've put on to the request in our currentUser middleware
  return res.send({ currentUser: req.currentUser || null })
})

export { router as currentUserRouter }
