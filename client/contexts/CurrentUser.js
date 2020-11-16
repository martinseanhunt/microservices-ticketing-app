import { createContext, useContext, useState, useEffect } from 'react'

import { getCurrentUser } from '../lib/api'

const CurrentUser = createContext()
const useCurrentUser = () => useContext(CurrentUser)

const CurrentUserProvider = (props) => {
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const get = async () => {
      const res = await getCurrentUser()
      setCurrentUser(res.currentUser)
    }
    get()
  }, [])

  const value = {
    currentUser,
    setCurrentUser,
  }

  return (
    <CurrentUser.Provider value={props.value || value}>
      {props.children}
    </CurrentUser.Provider>
  )
}

export default CurrentUserProvider
export { useCurrentUser }
