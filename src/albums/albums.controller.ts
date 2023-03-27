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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Album, AlbumDocument } from '../schemas/albums.schema';
import { Model } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAlbumDto } from './create-album.dto';
import { Track, TrackDocument } from '../schemas/tracks.schema';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { AdminAuthGuard } from '../auth/admin-auth.guard';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
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

      if (albumsByArtist.length === 0)
        throw new NotFoundException('Albums by artist are not found!');

      return albumsByArtist;
    }

    const albums = await this.albumModel.find();

    if (albums.length === 0)
      throw new NotFoundException('Albums are not found!');

    return albums;
  }

  @Get(':id')
  async getOneAlbum(@Param('id') id: string) {
    const album = await this.albumModel.findById(id);

    if (!album) throw new NotFoundException('Album is not found!');

    return this.albumModel.findById(id);
  }

  @Delete(':id')
  @UseGuards(TokenAuthGuard, AdminAuthGuard)
  async deleteAlbum(@Param('id') id: string) {
    const album = await this.albumModel.findById(id);

    if (!album) throw new NotFoundException('Album is not found!');

    const tracks = await this.trackModel.find({ album: album._id });

    if (tracks.length === 0) {
      await this.albumModel.deleteOne(album._id);
      return { message: 'Delete was successfully' };
    }

    return { message: 'You can not delete, album has tracks ' };
  }
}
