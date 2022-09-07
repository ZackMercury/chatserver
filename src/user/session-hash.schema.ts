import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import { User } from './user.schema';

export type SessionHashDocument = SessionHash & Document;

@Schema()
export class SessionHash {
  @Prop({type: mongoose.Types.ObjectId, ref: "User", required: true})
  user: ObjectId;

  @Prop({required: true})
  ip: string;

  @Prop({required: true})
  location: string;

  @Prop({required: true})
  userAgent: string;

  @Prop({unique: true, required: true})
  hashRt: string;

  @Prop({unique: true, required: true})
  hashAt: string;

  @Prop({required: true})
  expiresAt: Date;
}

export const SessionHashSchema = SchemaFactory.createForClass(SessionHash);