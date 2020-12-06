import Link from 'next/link'
import { Grid, Heading, Button, useColorMode } from '@chakra-ui/react'
import { SunIcon } from '@chakra-ui/icons'

import useRequest from '../../hooks/useRequest'
import { useCurrentUser } from '../../contexts/CurrentUser'

export default function Header() {
  const { colorMode, toggleColorMode } = useColorMode()
  const { currentUser, setCurrentUser } = useCurrentUser()

  const { doRequest } = useRequest({
    url: '/api/users/signout',
    method: 'POST',
    onSuccess: () => {
      setCurrentUser(null)
    },
  })

  const onSignout = async () => await doRequest()

  return (
    <Grid
      templateColumns={['1fr', '250px 1fr']}
      p={['20px 0', '30px 0']}
      alignItems="center"
      justifyItems={['center', 'stretch']}
    >
      <Heading as="h1" size="md" textTransform="uppercase">
        <Link href="/">Ticketing.dev</Link>
      </Heading>
      <Grid
        gap="10px"
        templateColumns="repeat(3, min-content)"
        justifyContent="end"
        justifyItems="end"
        pt={['10px', '0']}
      >
        {currentUser ? (
          <>
            <Link href="/tickets/new">
              <Button size="sm" colorScheme="pink" variant="outline">
                Sell a ticket
              </Button>
            </Link>
            <Button size="sm" onClick={onSignout}>
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link href="/signup">
              <Button size="sm" colorScheme="pink" variant="outline">
                Sign Up
              </Button>
            </Link>
            <Link href="/signin">
              <Button size="sm" colorScheme="pink" variant="outline">
                Sign In
              </Button>
            </Link>
          </>
        )}

        <Button
          colorScheme="pink"
          size="sm"
          onClick={toggleColorMode}
          variant={colorMode === 'light' ? 'outline' : 'solid'}
        >
          <SunIcon />
        </Button>
      </Grid>
    </Grid>
  )
}
