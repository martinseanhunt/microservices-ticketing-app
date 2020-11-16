import { Heading, Box } from '@chakra-ui/react'

import { useCurrentUser } from '../contexts/CurrentUser'

export default function Home() {
  const { currentUser } = useCurrentUser()

  return (
    <Box>
      <Heading as="h1" size="lg" fontWeight="300">
        Welcome to{' '}
        <a href="https://nextjs.org">
          Ticketing.dev <b>{currentUser?.email}</b>!
        </a>
      </Heading>
    </Box>
  )
}
