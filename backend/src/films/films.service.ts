import { Inject, Injectable } from '@nestjs/common';
import { IFilmsRepository } from '../repository/films.repository.interface';

@Injectable()
export class FilmsService {
  constructor(
    @Inject('IFilmsRepository')
    private filmsRepository: IFilmsRepository,
  ) {}

  async getAllFilms() {
    return await this.filmsRepository.findAll();
  }

  async getFilmSchedule(id: string) {
    return await this.filmsRepository.findSchedule(id);
  }
}
