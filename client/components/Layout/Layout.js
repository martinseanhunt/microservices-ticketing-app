// Doing this here because we can't use getServerSideProps in the _app to get the user info server side
// to pass to the header, provider etc... I'm sur ethere's a better solution than this but it works

// woiulnd't even use SSR to get the user in the real world but we're doing it for the purpouse of the course
// because it create some k8s infrastructure challenges that are good to learn about :)

import { Container } from '@chakra-ui/react'

import CurrentUserProvider from '../../contexts/CurrentUser'
import Header from './Header'

export default function Home({ currentUser, children, render }) {
  return (
    <CurrentUserProvider value={currentUser}>
      <Container maxWidth="900px">
        <Header />
        {children}
      </Container>
    </CurrentUserProvider>
  )
}
