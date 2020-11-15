import Link from 'next/link'
import { Grid, Heading, Button, useColorMode } from '@chakra-ui/react'
import { SunIcon } from '@chakra-ui/icons'

import { useCurrentUser } from '../../contexts/CurrentUser'

export default function Header() {
  const { toggleColorMode } = useColorMode()
  const { currentUser, setCurrentUser } = useCurrentUser()

  // TODO: move this
  const signOut = async () => {
    const res = await (
      await fetch('/api/users/signout', {
        method: 'POST',
      })
    ).json()
    if (res.errors) return console.error(res.errors)

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
          <Button size="sm" onClick={signOut}>
            Sign Out
          </Button>
        ) : (
          <>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          </>
        )}

        <Button size="sm" onClick={toggleColorMode}>
          <SunIcon />
        </Button>
      </Grid>
    </Grid>
  )
}
