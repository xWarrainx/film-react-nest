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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllFilms', () => {
    it('should return films with total count', async () => {
      // Arrange
      const mockFilms = [
        { id: 1, title: 'Film 1', description: 'Desc 1' },
        { id: 2, title: 'Film 2', description: 'Desc 2' },
      ];
      mockFilmsService.getAllFilms.mockResolvedValue(mockFilms);

      // Act
      const result = await controller.getAllFilms();

      // Assert
      expect(result).toEqual({
        total: 2,
        items: mockFilms,
      });
      expect(filmsService.getAllFilms).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if no films', async () => {
      // Arrange
      mockFilmsService.getAllFilms.mockResolvedValue([]);

      // Act
      const result = await controller.getAllFilms();

      // Assert
      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });
  });

  describe('getFilmSchedule', () => {
    it('should return schedule with total count', async () => {
      // Arrange
      const filmId = '1';
      const mockSchedule = [
        { id: 1, time: '10:00', price: 500 },
        { id: 2, time: '14:00', price: 600 },
      ];
      mockFilmsService.getFilmSchedule.mockResolvedValue(mockSchedule);

      // Act
      const result = await controller.getFilmSchedule(filmId);

      // Assert
      expect(result).toEqual({
        total: 2,
        items: mockSchedule,
      });
      expect(filmsService.getFilmSchedule).toHaveBeenCalledWith(filmId);
    });

    it('should handle errors and return empty response', async () => {
      // Arrange
      const filmId = '999';
      mockFilmsService.getFilmSchedule.mockRejectedValue(
        new Error('Film not found'),
      );

      // Act
      const result = await controller.getFilmSchedule(filmId);

      // Assert
      expect(result).toEqual({
        total: 0,
        items: [],
      });
      expect(filmsService.getFilmSchedule).toHaveBeenCalledWith(filmId);
    });

    it('should return empty array if service returns empty', async () => {
      // Arrange
      const filmId = '1';
      mockFilmsService.getFilmSchedule.mockResolvedValue([]);

      // Act
      const result = await controller.getFilmSchedule(filmId);

      // Assert
      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });
  });
});