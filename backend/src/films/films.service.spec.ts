import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from './films.service';
import { IFilmsRepository } from '../repository/films.repository.interface';

describe('FilmsService', () => {
  let service: FilmsService;
  let filmsRepository: IFilmsRepository;

  // Мокаем репозиторий
  const mockFilmsRepository = {
    findAll: jest.fn(),
    findSchedule: jest.fn(),
    reserveSeats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        {
          provide: 'IFilmsRepository',
          useValue: mockFilmsRepository,
        },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
    filmsRepository = module.get<IFilmsRepository>('IFilmsRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllFilms', () => {
    it('should return all films from repository', async () => {
      // Arrange
      const mockFilms = [
        { id: '1', title: 'Film 1', schedule: [] },
        { id: '2', title: 'Film 2', schedule: [] },
      ];
      mockFilmsRepository.findAll.mockResolvedValue(mockFilms);

      // Act
      const result = await service.getAllFilms();

      // Assert
      expect(result).toEqual(mockFilms);
      expect(filmsRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle empty result from repository', async () => {
      // Arrange
      mockFilmsRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.getAllFilms();

      // Assert
      expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const errorMessage = 'Database error';
      mockFilmsRepository.findAll.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.getAllFilms()).rejects.toThrow(errorMessage);
    });
  });

  describe('getFilmSchedule', () => {
    it('should return schedule for film', async () => {
      // Arrange
      const filmId = '1';
      const mockSchedule = [
        { id: 's1', time: '10:00', price: 500 },
        { id: 's2', time: '14:00', price: 600 },
      ];
      mockFilmsRepository.findSchedule.mockResolvedValue(mockSchedule);

      // Act
      const result = await service.getFilmSchedule(filmId);

      // Assert
      expect(result).toEqual(mockSchedule);
      expect(filmsRepository.findSchedule).toHaveBeenCalledWith(filmId);
    });

    it('should handle film not found', async () => {
      // Arrange
      const filmId = '999';
      mockFilmsRepository.findSchedule.mockResolvedValue([]);

      // Act
      const result = await service.getFilmSchedule(filmId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle repository errors for schedule', async () => {
      // Arrange
      const filmId = '1';
      const errorMessage = 'Film not found';
      mockFilmsRepository.findSchedule.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.getFilmSchedule(filmId)).rejects.toThrow(errorMessage);
    });
  });
});