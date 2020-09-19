import { useContext } from 'react'
import { UserContext } from '../context/User'

const useAuth = () => useContext(UserContext)

export default useAuth
