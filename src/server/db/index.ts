import { connect, connection, Connection } from 'mongoose';
import { Channel } from '../models/Channel'
import { User } from '../models/User'
import { Video } from '../models/Video'
import { Group } from '../models/Group'

declare interface IModels {
  Channel: typeof Channel
  User: typeof User
  Video: typeof Video
  Group: typeof Group
}

export class DB {

  private static instance: DB;

  private _db: Connection;
  private _models: IModels;

  private constructor() {
    connect(process.env.MONGO_DB_HOST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      autoIndex: process.env.NODE_ENV === 'development',
    })
    this._db = connection;
    this._db.on('open', this.connected);
    this._db.on('error', this.error);

    this._models = {
      Channel,
      User,
      Video,
      Group,
    };
  }

  public static get Models() {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance._models;
  }

  private connected() {
    console.log('Mongoose has connected');
  }

  private error(error) {
    console.log('Mongoose has errored', error);
  }
}

