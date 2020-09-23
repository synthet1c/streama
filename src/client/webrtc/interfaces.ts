import { UserID } from './types';

export interface IMessage {
  type: string
  origin: UserID
  target: UserID
  from: UserID
  payload: any
  created: string
  isPrivate: boolean
}

export interface IMessagePartial {
  type: string
  origin?: UserID
  target?: UserID
  from?: UserID
  payload?: any
  created?: string
  isPrivate?: boolean
}

export interface IMessageSubscriptions {
  [event: string]: IMessageSubscription[]
}

export interface IMessageSubscription {
  event: string
  callback: () => any
  source: 'server' | 'network' | 'private'
}

export interface ConnectionInfo {
  reliability: number
  quality: 1080 | 720 | 420 | 'audio'
  isHost: boolean
}
