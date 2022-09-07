import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({minlength: 2, required: true})
  firstname: string;

  @Prop({minlength: 2, required: true})
  lastname: string;

  @Prop({unique: true, required: true})
  email: string;

  @Prop({required: true})
  password: string;

  @Prop({
    validate: /\d\d [A-Z][a-z][a-z] \d\d\d\d \d\d:\d\d:\d\d \w\w\w/g,
    required: true
  })
  birthDate: string;

  @Prop({
    default: () => new Date(Date.now()).toUTCString(),
    required: true
  })
  createdAt: string;
}

export const UserSchema = SchemaFactory.createForClass(User);