import express from 'express'

const router = express.Router()

router.get('/api/users/currentuser', (req, res) => {
  return res.send('success')
})

export { router as currentUserRouter }
