import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { User } from './User';
import { Video } from './Video'

export default class ChannelModel {

  @prop({ required: true })
  name!: string;

  @prop({ required: true, unique: true })
  slug!: string;

  @prop()
  live?: boolean;

  @prop({ ref: () => User, required: true })
  public owner!: Ref<typeof User>;

  @prop({ ref: () => Video })
  public videos?: Ref<typeof Video>

}

export const Channel = getModelForClass(ChannelModel);
