import React from 'react';

export interface IUser {
  name: string
  login: string
  email: string
  loggedIn: boolean
}

export const user: IUser = {
  name: 'Guest',
  login: '',
  email: '',
  loggedIn: false,
}

export const UserContext = React.createContext(user)
