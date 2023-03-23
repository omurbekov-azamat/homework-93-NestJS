import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist, ArtistDocument } from '../schemas/artists.schema';
import { Model } from 'mongoose';
import { CreateArtistDto } from './create-artist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Album, AlbumDocument } from '../schemas/albums.schema';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', { dest: './public/uploads/artists' }),
  )
  async createArtist(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistDto: CreateArtistDto,
  ) {
    const artist = new this.artistModel({
      name: artistDto.name,
      information: artistDto.information,
      image: file ? '/uploads/artists/' + file.filename : null,
    });

    return await artist.save();
  }

  @Get()
  async getAll() {
    const artist = await this.artistModel.find();

    if (artist.length === 0) throw new NotFoundException('Artist is not Found');

    return artist;
  }

  @Get(':id')
  async getOneArtist(@Param('id') id: string) {
    const artist = await this.artistModel.findById(id);

    if (!artist) throw new NotFoundException('Artist is not Found');

    return artist;
  }

  @Delete(':id')
  async deleteArtist(@Param('id') id: string) {
    const artist = await this.artistModel.findById(id);

    if (!artist) throw new NotFoundException('Artist is not Found');

    const albums = await this.albumModel.find({ artist: artist._id });

    if (albums.length === 0) {
      await this.artistModel.deleteOne(artist._id);
      return { message: 'Delete was successfully' };
    }

    return { message: 'You can not delete, artist has albums' };
  }
}
