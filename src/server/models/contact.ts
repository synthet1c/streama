import { Schema, model, Document, Model } from 'mongoose'

declare interface IContact extends Document {
  name: string,
  email: string,
}

export interface ContactModel extends Model<IContact> {}

export class Contact {
  private _model: Model<IContact>

  constructor() {
    const schema = new Schema({
      name: { type: String, required: true },
      email: { type: String, required: true }
    })

    this._model = model<IContact>('User', schema)
  }

  public get model(): Model<IContact> {
    return this._model
  }
}
