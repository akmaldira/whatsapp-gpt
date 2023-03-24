import { getModelForClass, prop } from '@typegoose/typegoose'
import { Document } from 'mongoose'

export class UserSchema {
  @prop({ type: String, required: true, unique: true })
  public jid!: string

  @prop({ type: Boolean, required: true, default: false })
  public banned!: boolean

  @prop({ type: String, required: true })
  public tag!: string

  @prop({ type: Number, required: true, default: 0 })
  public badwordCount!: number
}

export type TUserModel = UserSchema & Document

export const userSchema = getModelForClass(UserSchema)
