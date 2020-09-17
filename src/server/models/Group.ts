import { DocumentType, getModelForClass, prop } from '@typegoose/typegoose';

export interface LEVELS {
  VIEWER: 0,
  USER: 1,
  SUBSCRIBER: 2,
  MODERATOR: 3,
  CREATOR: 4,
  ADMIN: 5,
  DEVELOPER: 6,
  ACCOUNTS: 7,
  GOD_MODE: 8,
}

export const LEVELS: LEVELS = {
  VIEWER: 0,
  USER: 1,
  SUBSCRIBER: 2,
  MODERATOR: 3,
  CREATOR: 4,
  ADMIN: 5,
  DEVELOPER: 6,
  ACCOUNTS: 7,
  GOD_MODE: 8,
};


export class GroupModel {

  @prop({ required: true })
  name !: string;

  @prop({ required: true })
  level !: number;

  public async getMembers(this: DocumentType<GroupModel>) {
    return this.model('User').find({ 'group._id': this._id });
  };

}

export const Group = getModelForClass(GroupModel);
