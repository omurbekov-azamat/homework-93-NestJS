import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArtistsController } from './artists/artists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Artist, AristSchema } from './artists/artists.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/spotify-nest'),
    MongooseModule.forFeature([{ name: Artist.name, schema: AristSchema }]),
  ],
  controllers: [AppController, ArtistsController],
  providers: [AppService],
})
export class AppModule {}
