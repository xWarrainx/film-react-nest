import { Controller, Get, Param } from '@nestjs/common';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async getAllFilms() {
    const films = await this.filmsService.getAllFilms();
    return {
      total: films.length,
      items: films,
    };
  }

  @Get(':id/schedule')
  async getFilmSchedule(@Param('id') id: string) {
    try {
      const schedule = await this.filmsService.getFilmSchedule(id);
      return {
        total: schedule.length,
        items: schedule,
      };
    } catch (error) {
      return {
        total: 0,
        items: [],
      };
    }
  }
}
