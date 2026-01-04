import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFilmsRepository } from './films.repository.interface';
import { FilmEntity } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';
import { FilmDto, ScheduleItemDto } from '../films/dto/films.dto';

@Injectable()
export class FilmsPostgresRepository implements IFilmsRepository {
  constructor(
    @InjectRepository(FilmEntity)
    private filmRepository: Repository<FilmEntity>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmRepository.find({
      relations: ['schedule'],
      order: {
        rating: 'DESC',
      },
    });

    return films.map(this.mapFilmToDto);
  }

  async findSchedule(filmId: string): Promise<ScheduleItemDto[]> {
    const film = await this.filmRepository.findOne({
      where: { id: filmId },
      relations: ['schedule'],
    });

    if (!film) {
      throw new Error(`Film with id ${filmId} not found`);
    }

    return film.schedule.map(this.mapScheduleToDto);
  }

  async reserveSeats(
    filmId: string,
    scheduleId: string,
    seats: string[],
  ): Promise<boolean> {
    try {
      // Получаем сеанс с блокировкой для безопасного обновления
      const session = await this.scheduleRepository.findOne({
        where: { id: scheduleId, filmId },
      });

      if (!session) {
        throw new Error(`Session ${scheduleId} not found for film ${filmId}`);
      }

      // Проверяем каждое место
      const takenSet = new Set(session.taken || []);
      const errors: string[] = [];

      for (const seat of seats) {
        // Проверяем формат места
        const [rowStr, seatStr] = seat.split(':');
        const row = parseInt(rowStr);
        const seatNum = parseInt(seatStr);

        if (isNaN(row) || isNaN(seatNum)) {
          throw new Error(`Invalid seat format: ${seat}`);
        }

        // Проверяем диапазон
        if (
          row < 1 ||
          row > session.rows ||
          seatNum < 1 ||
          seatNum > session.seats
        ) {
          throw new Error(`Seat ${seat} is out of range`);
        }

        // Проверяем, не занято ли место
        if (takenSet.has(seat)) {
          errors.push(`Seat ${seat} is already taken`);
        }
      }

      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      session.taken = [...(session.taken || []), ...seats];
      await this.scheduleRepository.save(session);

      return true;
    } catch (error) {
      console.error('Error reserving seats:', error.message);
      throw error;
    }
  }

  async findSession(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleItemDto | null> {
    const session = await this.scheduleRepository.findOne({
      where: { id: sessionId, filmId },
    });

    if (!session) {
      return null;
    }

    return this.mapScheduleToDto(session);
  }

  private mapFilmToDto = (film: FilmEntity): FilmDto => {
    return {
      id: film.id,
      rating: Number(film.rating),
      director: film.director,
      tags: film.tags,
      image: film.image,
      cover: film.cover,
      title: film.title,
      about: film.about,
      description: film.description,
      schedule: film.schedule?.map(this.mapScheduleToDto) || [],
    };
  };

  private mapScheduleToDto = (schedule: Schedule): ScheduleItemDto => {
    return {
      id: schedule.id,
      film: schedule.filmId,
      daytime: schedule.daytime.toISOString(),
      hall: schedule.hall,
      rows: schedule.rows,
      seats: schedule.seats,
      price: Number(schedule.price),
      taken: schedule.taken || [],
    };
  };
}
