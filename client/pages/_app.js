import { ChakraProvider, extendTheme, Container } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

import CurrentUserProvider from '../contexts/CurrentUser'

import Header from '../components/Layout/Header'

const config = {
  useSystemColorMode: false,
  initialColorMode: 'dark',
}

const customTheme = extendTheme({
  styles: {
    global: (props) => ({
      body: {
        bg: mode('pink.50', 'pink.900')(props),
      },
    }),
  },
  config,
})

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={customTheme}>
      <CurrentUserProvider>
        <Container maxW="lg">
          <Header />
          <Component {...pageProps} />
        </Container>
      </CurrentUserProvider>
    </ChakraProvider>
  )
}

export default MyApp
