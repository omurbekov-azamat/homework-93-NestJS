import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Track, TrackDocument } from '../schemas/tracks.schema';
import { Model } from 'mongoose';
import { CreateTrackDto } from './create-track.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { AdminAuthGuard } from '../auth/admin-auth.guard';

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>,
  ) {}

  @Post()
  async createTrack(@Body() trackData: CreateTrackDto) {
    const track = new this.trackModel({
      album: trackData.album,
      name: trackData.name,
      duration: trackData.duration,
      trackNumber: trackData.trackNumber,
    });

    return track.save();
  }

  @Get()
  async getAll(@Query() query: { album: string }) {
    if (query.album) {
      const tracksByAlbum = await this.trackModel
        .find({ album: query.album })
        .populate('album');

      if (tracksByAlbum.length === 0)
        throw new NotFoundException('Tracks by album are not found!');

      return tracksByAlbum;
    }

    const tracks = await this.trackModel.find();

    if (tracks.length === 0)
      throw new NotFoundException('Tracks are not found!');

    return tracks;
  }

  @Delete(':id')
  @UseGuards(TokenAuthGuard, AdminAuthGuard)
  async deleteOneTrack(@Param('id') id: string) {
    const track = await this.trackModel.findById(id);

    if (!track) throw new NotFoundException('Track is not found!');

    await this.trackModel.deleteOne(track._id);

    return { message: 'Delete was successfully ' };
  }
}
