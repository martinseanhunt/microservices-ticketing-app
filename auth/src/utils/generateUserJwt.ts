import jwt from 'jsonwebtoken'

import { UserDoc } from '../models/User'

export const generateUserJwt = (user: UserDoc): string => {
  // generate JWT
  const userJWT = jwt.sign(
    {
      email: user.email,
      id: user.id,
    },
    // We're checking this exists when the server starts so we can use ! to suppress
    // the error message from TS
    process.env.JWT_KEY!
  )

  return userJWT
}
