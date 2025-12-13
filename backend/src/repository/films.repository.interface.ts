import { FilmDto, ScheduleItemDto } from '../films/dto/films.dto';

export interface IFilmsRepository {
  findAll(): Promise<FilmDto[]>;
  findSchedule(filmId: string): Promise<ScheduleItemDto[]>;
  reserveSeats(
    filmId: string,
    scheduleId: string,
    seats: string[],
  ): Promise<boolean>;
  findSession(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleItemDto | null>;
}
