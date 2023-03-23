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
import { Artist, ArtistDocument } from './artists.schema';
import { Model } from 'mongoose';
import { CreateArtistDto } from './create-artist.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<ArtistDocument>,
  ) {}

  @Get()
  async getAll() {
    return this.artistModel.find();
  }

  @Get(':id')
  async getOneArtist(@Param('id') id: string) {
    const artist = await this.artistModel.findById(id);

    if (!artist) throw new NotFoundException('Artist not Found');

    return artist;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', { dest: '.public/uploads/artists' }),
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

  @Delete(':id')
  async deleteArtist(@Param('id') id: string) {
    const artist = await this.artistModel.findById(id);

    if (!artist) throw new NotFoundException('Artist not Found');

    await this.artistModel.deleteOne(artist._id);

    return { message: 'Delete was successfully' };
  }
}
