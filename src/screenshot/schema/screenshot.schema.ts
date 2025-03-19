import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Screenshot extends Document {
  @Prop({ required: true, ref: 'User' }) 
  userId: string;

  @Prop({ required: true }) 
  ss: string; // Stores file path like "/uploads/xyz123.png"
}

export const ScreenshotSchema = SchemaFactory.createForClass(Screenshot);
