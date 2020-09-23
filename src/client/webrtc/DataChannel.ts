import { UserID } from './types';
import Peer from './Peer';
import Member from './Member';

export type ChannelID = string

export interface IDataChannelParams {
  peer: Peer,
  userId: UserID,
  name?: string
  channel: RTCDataChannel
}

export interface ICreateDataChannelParams {
  peer: Peer,
  userId: UserID,
  name?: string
}

export default class DataChannel {

  ['constructor']: DataChannel;

  static userChannels: Map<UserID, DataChannel> = new Map;
  static channels: Map<ChannelID, DataChannel> = new Map;

  channel: RTCDataChannel;
  peer: Peer;
  id: ChannelID;
  members: Map<UserID, Member> = new Map;

  /**
   * !!! IMPORTANT !!! Don't use this constructor
   */
  private constructor({
    peer,
    userId,
    name,
    channel,
  }: IDataChannelParams) {
    this.peer = peer;
    this.id = `${userId}-${name}`;
    this.channel = channel;
    DataChannel.channels.set(this.id, this);
    DataChannel.userChannels.set(userId, this);
  }

  /**
   * Create a data channel asynchronously
   */
  static create = ({
    peer,
    userId,
    name,
  }: ICreateDataChannelParams): Promise<DataChannel> => new Promise((res, rej) => {

    const id = `${userId}-${name}`;
    const channel = peer.connection.createDataChannel(id);
    const dataChannel = new DataChannel({ peer, userId, name, channel });

    channel.onopen = () => {
      res(dataChannel);
    };

    channel.onerror = rej;

    channel.onclose = () => {
      dataChannel.cleanup();
    };
  });

  /**
   * Manually disconnect the data channel
   */
  public disconnect() {
    this.channel.close();
    // NOTE: may need to call cleanup if channel.close doesn't fire
    // this.cleanup()
  }

  /**
   * Cleanup any channel state on disconnect
   */
  private cleanup() {
    for (const [userId, member] of this.members.entries()) {
      DataChannel.userChannels.delete(userId);
    }
    DataChannel.channels.delete(this.id);
  }

  static getUserChannels(userId: UserID) {
    // @ts-ignore
    return DataChannel.userChannels.get(userId);
  }

  static getById(channelId: ChannelID) {
    // @ts-ignore
    return DataChannel.channels.get(channelId);
  }
}
