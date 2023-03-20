import { getModelForClass, prop } from '@typegoose/typegoose'
import { Document } from 'mongoose'

export class UserSchema {
    @prop({ type: String, required: true, unique: true })
    public jid!: string

    @prop({ type: Boolean, required: true, default: false })
    public banned!: boolean

    @prop({ type: String, required: true })
    public tag!: string
}

export type TUserModel = UserSchema & Document

export const userSchema = getModelForClass(UserSchema)
