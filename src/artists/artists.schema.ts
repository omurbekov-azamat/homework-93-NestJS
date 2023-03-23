import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ArtistDocument = Artist & Document;

@Schema()
export class Artist {
  @Prop({ type: String, required: true })
  name: string;
  @Prop()
  information: string;
  @Prop()
  image: string | null;
}

export const AristSchema = SchemaFactory.createForClass(Artist);
