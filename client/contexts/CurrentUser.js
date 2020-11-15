import { createContext, useContext, useState, useEffect } from 'react'

const CurrentUser = createContext()
const useCurrentUser = () => useContext(CurrentUser)

const CurrentUserProvider = (props) => {
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const get = async () => {
      // TODO: move this in to an API folder
      const res = await (await fetch('/api/users/currentUser')).json()
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
