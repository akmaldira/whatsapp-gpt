import { getModelForClass, prop } from '@typegoose/typegoose'
import { Document } from 'mongoose'

export class GroupSchema {
  @prop({ type: String, unique: true, required: true })
  public jid!: string

  @prop({ type: Boolean, required: true, default: false })
  public events!: boolean

  @prop({ type: Boolean, required: true, default: false })
  public mods!: boolean

  @prop({ type: Boolean, required: true, default: false })
  public nsfw!: boolean

  @prop({ type: Boolean, required: true, default: false })
  public voicegpt!: boolean

  @prop({ type: Boolean, required: true, default: false })
  public badword!: boolean
}

export type TGroupModel = GroupSchema & Document

export const groupSchema = getModelForClass(GroupSchema)
