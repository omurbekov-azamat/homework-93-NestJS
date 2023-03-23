import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Album, AlbumDocument } from '../schemas/albums.schema';
import { Model } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAlbumDto } from './create-album.dto';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', { dest: './public/uploads/albums' }),
  )
  async createAlbum(
    @UploadedFile() file: Express.Multer.File,
    @Body() albumDto: CreateAlbumDto,
  ) {
    const album = new this.albumModel({
      artist: albumDto.artist,
      name: albumDto.name,
      releaseDate: albumDto.releaseDate,
      image: file ? '/uploads/albums/' + file.filename : null,
    });

    return album.save();
  }

  @Get()
  async getAll(@Query() query: { artist: string }) {
    if (query.artist) {
      const albumsByArtist = await this.albumModel
        .find({ artist: query.artist })
        .populate('artist');

      if (!albumsByArtist) throw new NotFoundException('Album is not found!');

      return albumsByArtist;
    } else {
      const albums = await this.albumModel.find();

      if (albums.length === 0)
        throw new NotFoundException('Album is not found!');

      return albums;
    }
  }

  @Get(':id')
  async getOneAlbum(@Param('id') id: string) {
    const album = await this.albumModel.findById(id);

    if (!album) throw new NotFoundException('Album is not found!');

    return this.albumModel.findById(id);
  }

  @Delete(':id')
  async deleteAlbum(@Param('id') id: string) {
    const album = await this.albumModel.findById(id);

    if (!album) throw new NotFoundException('Album is not found!');

    await this.albumModel.deleteOne(album._id);

    return { message: 'Delete was successfully' };
  }
}
