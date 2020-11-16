import { createContext, useContext, useState, useEffect } from 'react'

const CurrentUser = createContext()
const useCurrentUser = () => useContext(CurrentUser)

const CurrentUserProvider = (props) => {
  const [currentUser, setCurrentUser] = useState(props.value)

  const value = {
    currentUser,
    setCurrentUser,
  }

  return (
    <CurrentUser.Provider value={value}>{props.children}</CurrentUser.Provider>
  )
}

export default CurrentUserProvider
export { useCurrentUser }
