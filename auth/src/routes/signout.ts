import express from 'express'

const router = express.Router()

router.post('/api/users/signout', (req, res) => {
  // Destroy the users cookie
  req.session = null
  return res.send({})
})

export { router as signoutRouter }
