import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';

describe('FilmsController', () => {
  let controller: FilmsController;
  let filmsService: FilmsService;

  // Мокаем сервис
  const mockFilmsService = {
    getAllFilms: jest.fn(),
    getFilmSchedule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: mockFilmsService,
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    filmsService = module.get<FilmsService>(FilmsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllFilms', () => {
    it('должен возвращать фильмы с общим количеством', async () => {
      const mockFilms = [
        { id: 1, title: 'Film 1', description: 'Desc 1' },
        { id: 2, title: 'Film 2', description: 'Desc 2' },
      ];
      mockFilmsService.getAllFilms.mockResolvedValue(mockFilms);

      const result = await controller.getAllFilms();

      expect(result).toEqual({
        total: 2,
        items: mockFilms,
      });
      expect(filmsService.getAllFilms).toHaveBeenCalledTimes(1);
    });

    it('должен возвращать пустой массив, если фильмов нет', async () => {
      mockFilmsService.getAllFilms.mockResolvedValue([]);

      const result = await controller.getAllFilms();

      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });
  });

  describe('getFilmSchedule', () => {
    it('должен возвращать расписание с общим количеством', async () => {
      const filmId = '1';
      const mockSchedule = [
        { id: 1, time: '10:00', price: 500 },
        { id: 2, time: '14:00', price: 600 },
      ];
      mockFilmsService.getFilmSchedule.mockResolvedValue(mockSchedule);

      const result = await controller.getFilmSchedule(filmId);

      expect(result).toEqual({
        total: 2,
        items: mockSchedule,
      });
      expect(filmsService.getFilmSchedule).toHaveBeenCalledWith(filmId);
    });

    it('должен обрабатывать ошибки и возвращать пустой ответ', async () => {
      const filmId = '999';
      mockFilmsService.getFilmSchedule.mockRejectedValue(
        new Error('Film not found'),
      );

      const result = await controller.getFilmSchedule(filmId);

      expect(result).toEqual({
        total: 0,
        items: [],
      });
      expect(filmsService.getFilmSchedule).toHaveBeenCalledWith(filmId);
    });

    it('должен возвращать пустой массив, если сервис возвращает пустой массив', async () => {
      const filmId = '1';
      mockFilmsService.getFilmSchedule.mockResolvedValue([]);

      const result = await controller.getFilmSchedule(filmId);

      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });
  });
});
