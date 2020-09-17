import { prop, getModelForClass, Ref } from '@typegoose/typegoose';

class VideoModel {

  @prop()
  title!: string;

}

export const Video = getModelForClass(VideoModel);
