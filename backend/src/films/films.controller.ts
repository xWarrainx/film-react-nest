import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
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
    const schedule = await this.filmsService.getFilmSchedule(id);
    if (!schedule || schedule.length === 0) {
      throw new NotFoundException(`Film with id ${id} not found`);
    }
    return {
      total: schedule.length,
      items: schedule,
    };
  }
}
