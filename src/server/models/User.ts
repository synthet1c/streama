import { prop, getModelForClass, Ref, DocumentType, ReturnModelType, mongoose } from '@typegoose/typegoose';
import { Group, GroupModel } from './Group';
import { DB } from '../db/index';


class UserModel {

  @prop({ required: true })
  name !: string

  @prop({ required: true, unique: true })
  login !: string

  @prop({ required: true, unique: true })
  email !: string

  @prop()
  sessionId ?: string

  @prop({ ref: () => Group })
  groups ?: Ref<typeof Group>[]

  @prop()
  online ?: boolean

  public isLoggedIn(): boolean {
    return !!this.sessionId
  }

  public async loginUser(this: DocumentType<UserModel>, sessionId: string) {
    this.sessionId = sessionId
    return await this.save()
  }

  public async logoutUser(this: DocumentType<UserModel>) {
    this.sessionId = ''
    return await this.save()
  }

  public isMemberOfGroupId(this: DocumentType<UserModel>, groupId: mongoose.Types.ObjectId): boolean  {
    return this.groups.includes(groupId)
  }

  public async hasAccess(this: DocumentType<UserModel>, level: number|number[]): Promise<boolean> {
    const groups = await this.model(DB.Models.Group.modelName).find({
      _id: { $in: this.groups }
    })
    const highestUserLevel = groups.reduce((a, b: DocumentType<GroupModel>) => Math.max(a, b.level), 0)
    const highestAccessLevel = Array.isArray(level) ? level.reduce((a, b) => Math.max(a, b), 0) : level
    return highestUserLevel >= highestAccessLevel
  }

  public static async findBySessionId(this: ReturnModelType<typeof UserModel>, sessionId: string) {
    return this.findOne({ sessionId }).exec()
  }

}

export const User = getModelForClass(UserModel);
