// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// @Schema() 
// export class User extends Document {
//   @Prop({ required: true })
//   username: string;

//   @Prop({ required: true, unique: true })
//   email: string;

//   @Prop({ required: true })
//   password: string;

//   @Prop({ default: Date.now })
//   createdAt: Date;
// }

// export const UserSchema = SchemaFactory.createForClass(User);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema() 
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ unique: true, sparse: true }) // Add Google ID, make it unique and sparse
  googleId?: string; // Optional, since not all users will have a Google ID
}

export const UserSchema = SchemaFactory.createForClass(User);
