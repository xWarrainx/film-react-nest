import { Injectable } from '@nestjs/common';
import { FilmDto, ScheduleItemDto } from '../films/dto/films.dto';
import { IFilmsRepository } from './films.repository.interface';

@Injectable()
export class FilmsInMemoryRepository implements IFilmsRepository {
  private films: FilmDto[] = [];

  async findAll(): Promise<FilmDto[]> {
    return this.films;
  }

  async findSchedule(filmId: string): Promise<ScheduleItemDto[]> {
    const film = this.films.find((f) => f.id === filmId);
    return film ? film.schedule : [];
  }

  async findSession(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleItemDto | null> {
    const film = this.films.find((f) => f.id === filmId);

    if (!film) {
      return null;
    }

    const session = film.schedule.find((item) => item.id === sessionId);

    if (!session) {
      return null;
    }

    return {
      ...session,
      film: filmId,
      hall: session.hall,
    };
  }

  async reserveSeats(
    filmId: string,
    scheduleId: string,
    seats: string[],
  ): Promise<boolean> {
    const film = this.films.find((f) => f.id === filmId);
    if (!film) {
      throw new Error(`Film with id ${filmId} not found`);
    }

    const scheduleItem = film.schedule.find((item) => item.id === scheduleId);
    if (!scheduleItem) {
      throw new Error(`Schedule with id ${scheduleId} not found`);
    }

    // Проверяем каждое место
    for (const seat of seats) {
      if (scheduleItem.taken.includes(seat)) {
        throw new Error(`Seat ${seat} is already taken`);
      }

      // Проверяем существование ряда и места
      const [row, seatNum] = seat.split(':').map(Number);
      if (
        row < 1 ||
        row > scheduleItem.rows ||
        seatNum < 1 ||
        seatNum > scheduleItem.seats
      ) {
        throw new Error(`Seat ${seat} is out of range`);
      }
    }

    // Резервируем места
    scheduleItem.taken.push(...seats);
    return true;
  }

  // Для инициализации тестовыми данными
  setData(films: FilmDto[]): void {
    this.films = films;
  }
}
