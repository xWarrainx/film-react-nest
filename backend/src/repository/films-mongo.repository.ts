import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film } from '../films/film.schema';
import { FilmDto, ScheduleItemDto } from '../films/dto/films.dto';
import { IFilmsRepository } from './films.repository.interface';

@Injectable()
export class FilmsMongoRepository implements IFilmsRepository {
  constructor(@InjectModel(Film.name) private filmModel: Model<Film>) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmModel.find({}).exec();
    return films.map(this.toFilmDto);
  }

  async findSchedule(filmId: string): Promise<ScheduleItemDto[]> {
    const film = await this.filmModel.findById(filmId).exec();

    if (!film) {
      throw new NotFoundException(`Film with id ${filmId} not found`);
    }

    return film.schedule.map((item) => ({
      id: item.id,
      film: filmId,
      daytime: item.daytime,
      hall: item.hall.toString(),
      rows: item.rows,
      seats: item.seats,
      price: item.price,
      taken: item.taken || [],
    }));
  }

  async reserveSeats(
    filmId: string,
    scheduleId: string,
    seats: string[],
  ): Promise<boolean> {
    const film = await this.filmModel.findById(filmId).exec();
    if (!film) {
      throw new BadRequestException(`Film with id ${filmId} not found`);
    }

    const scheduleItem = film.schedule.find((item) => item.id === scheduleId);
    if (!scheduleItem) {
      throw new BadRequestException(`Schedule with id ${scheduleId} not found`);
    }

    // Проверяем каждое место
    for (const seat of seats) {
      if (!this.isValidSeatFormat(seat)) {
        throw new BadRequestException(`Invalid seat format: ${seat}`);
      }

      if (scheduleItem.taken.includes(seat)) {
        throw new BadRequestException(`Seat ${seat} is already taken`);
      }

      const [row, seatNum] = seat.split(':').map(Number);
      if (
        row < 1 ||
        row > scheduleItem.rows ||
        seatNum < 1 ||
        seatNum > scheduleItem.seats
      ) {
        throw new BadRequestException(`Seat ${seat} is out of range`);
      }
    }

    // Добавляем места к занятым
    scheduleItem.taken.push(...seats);

    await film.save();
    return true;
  }

  private isValidSeatFormat(seat: string): boolean {
    const regex = /^\d+:\d+$/;
    return regex.test(seat);
  }

  private toFilmDto(film: Film): FilmDto {
    const filmObj = film.toJSON();

    const scheduleWithFilmId = filmObj.schedule.map((item) => ({
      ...item,
      film: filmObj.id,
      hall: item.hall.toString(),
    }));

    return {
      id: filmObj.id,
      rating: filmObj.rating,
      director: filmObj.director,
      tags: filmObj.tags,
      image: filmObj.image,
      cover: filmObj.cover,
      title: filmObj.title,
      about: filmObj.about,
      description: filmObj.description,
      schedule: scheduleWithFilmId,
    };
  }
  async findSession(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleItemDto | null> {
    const film = await this.filmModel.findById(filmId).exec();

    if (!film) {
      return null;
    }

    const session = film.schedule.find((item) => item.id === sessionId);

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      film: filmId,
      daytime: session.daytime,
      hall: session.hall.toString(),
      rows: session.rows,
      seats: session.seats,
      price: session.price,
      taken: session.taken || [],
    };
  }
}
