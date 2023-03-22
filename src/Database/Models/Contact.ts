import { getModelForClass, prop } from '@typegoose/typegoose'
import { Document } from 'mongoose'

export class Contact {
  @prop({ type: String, required: true, unique: true })
  public ID!: string

  @prop({ type: () => contact, required: true, default: [] })
  public data!: contact[]
}

export class contact {
  @prop({ type: String, required: true })
  public id!: string

  @prop({ type: String })
  public notify?: string

  @prop({ type: String })
  public name?: string

  @prop({ type: String })
  public verifiedName?: string

  @prop({ type: String })
  public status?: string

  @prop({ type: String })
  public imgUrl?: string

  @prop({ type: Boolean, required: true, default: true })
  public broadcast!: boolean
}

export type TContactModel = Contact & Document

export const contactSchema = getModelForClass(Contact)
