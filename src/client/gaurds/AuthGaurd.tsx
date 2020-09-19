import { UserContext } from '../context/User';
import React, { FC, ReactNode, useContext } from 'react';
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types';

interface AuthGuardProps {
  children?: ReactNode
}

const AuthGuard: FC<AuthGuardProps> = ({ children }) => {

  const user = useContext(UserContext)

  if (!user.loggedIn) {
    return <Redirect to="/login" />
  }

  return (
    <>
      {children}
    </>
  )
}

AuthGuard.propTypes = {
  children: PropTypes.node
}

export default AuthGuard
