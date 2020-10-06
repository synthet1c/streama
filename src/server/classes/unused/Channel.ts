import Cluster from './Cluster'
import Distributor from './Distiributor'
import Node from '../Node'
import { Server, Socket } from 'socket.io';
import Viewer from './Viewer';
import Subscriber from './Subscriber';
import Follower from './Follower';
import Moderator from './Moderator';

export default class Channel {

  public static _channels: Map<string, Channel> = new Map

  public live: boolean = false

  public host: Node
  public members: Node[]
  private distributors: Distributor[]
  private clusters: Cluster[]

  private io: Server
  private socket: Socket

  private stream: any

  public slug: string
  public name: string

  public viewers: Viewer[]
  public subscribers: Subscriber[]
  public followers: Follower[]
  public moderators: Moderator[]

  public rooms: string[] = [
    'turd-flinging-monkey:viewer',
    'turd-flinging-monkey:subscriber',
    'turd-flinging-monkey:follower',
    'turd-flinging-monkey:moderator',
  ]

  public constructor({ slug }) {
    Channel._channels.set(slug, this)
    // create rooms
  }

  public startStream() {
    // open room

    // receive stream

    // spin up distributors

    // send stream to distributor

    // send notification to subscribers and followers
  }

  static getBySlug(slug: string) {
    return Channel._channels.get(slug)
  }

}
