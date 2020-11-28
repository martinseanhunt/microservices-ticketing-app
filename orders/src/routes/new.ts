import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { protectedRoute, handleValidationErrors } from '@mhunt/ticketing-common'

const router = express.Router()

router.post(
  '/api/orders',
  protectedRoute,
  // be aware that introduces a very subtle coupling between services becuase we're
  // expecting that all services use mongodb.
  [body('ticketId').isMongoId().withMessage('please provide a ticket i')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.send({})
  }
)

export { router as createOrderRouter }
