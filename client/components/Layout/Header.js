import Link from 'next/link'
import { Grid, Heading, Button, useColorMode } from '@chakra-ui/react'
import { SunIcon } from '@chakra-ui/icons'

import { signout } from '../../lib/api'
import { useCurrentUser } from '../../contexts/CurrentUser'

export default function Header() {
  const { colorMode, toggleColorMode } = useColorMode()
  const { currentUser, setCurrentUser } = useCurrentUser()

  const onSignout = async () => {
    await signout()
    setCurrentUser(null)
  }

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
          <Button size="sm" onClick={onSignout}>
            Sign Out
          </Button>
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
