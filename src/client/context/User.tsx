import React from 'react';

export interface IUser {
  name: string
  login: string
  email: string
  loggedIn: boolean
  avatar: string
}

export const user: IUser = {
  name: 'Guest',
  login: '',
  email: '',
  avatar: '',
  loggedIn: false,
}

export const UserContext = React.createContext(user)
