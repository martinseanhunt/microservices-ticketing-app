import { useState } from 'react'
import { Button, Heading, Box, Text } from '@chakra-ui/react'

import { useCurrentUser } from '../contexts/CurrentUser'

export default function Home() {
  const { currentUser, setCurrentUser } = useCurrentUser()
  const [errors, setErrors] = useState()

  // TODO: Move this
  const signUp = async () => {
    setErrors()
    const res = await (
      await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          ['content-type']: 'application/json',
        },
        body: JSON.stringify({
          email: `${Math.random()}@martin.com`,
          password: 'trees',
        }),
      })
    ).json()
    if (res.errors) return setErrors(res.errors)

    setCurrentUser(res)
  }

  return (
    <Box>
      <Heading as="h1" size="lg" fontWeight="300">
        Welcome to{' '}
        <a href="https://nextjs.org">
          Next.js <b>{currentUser?.email}</b>!
        </a>
      </Heading>

      <Button mt={30} onClick={signUp}>
        Sign up
      </Button>

      {errors && (
        <Text pt={30} fontSize="sm">
          {errors.map((e) => e.message)}
        </Text>
      )}
    </Box>
  )
}
