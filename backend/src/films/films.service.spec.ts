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

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('getAllFilms', () => {
    it('должен возвращать все фильмы из репозитория', async () => {
      const mockFilms = [
        { id: '1', title: 'Film 1', schedule: [] },
        { id: '2', title: 'Film 2', schedule: [] },
      ];
      mockFilmsRepository.findAll.mockResolvedValue(mockFilms);

      const result = await service.getAllFilms();

      expect(result).toEqual(mockFilms);
      expect(filmsRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать пустой результат из репозитория', async () => {
      mockFilmsRepository.findAll.mockResolvedValue([]);

      const result = await service.getAllFilms();

      expect(result).toEqual([]);
    });

    it('должен пробрасывать ошибки репозитория', async () => {
      const errorMessage = 'Database error';
      mockFilmsRepository.findAll.mockRejectedValue(new Error(errorMessage));

      await expect(service.getAllFilms()).rejects.toThrow(errorMessage);
    });
  });

  describe('getFilmSchedule', () => {
    it('должен возвращать расписание для фильма', async () => {
      const filmId = '1';
      const mockSchedule = [
        { id: 's1', time: '10:00', price: 500 },
        { id: 's2', time: '14:00', price: 600 },
      ];
      mockFilmsRepository.findSchedule.mockResolvedValue(mockSchedule);

      const result = await service.getFilmSchedule(filmId);

      expect(result).toEqual(mockSchedule);
      expect(filmsRepository.findSchedule).toHaveBeenCalledWith(filmId);
    });

    it('должен обрабатывать ситуацию, когда фильм не найден', async () => {
      const filmId = '999';
      mockFilmsRepository.findSchedule.mockResolvedValue([]);

      const result = await service.getFilmSchedule(filmId);

      expect(result).toEqual([]);
    });

    it('должен обрабатывать ошибки репозитория для расписания', async () => {
      const filmId = '1';
      const errorMessage = 'Film not found';
      mockFilmsRepository.findSchedule.mockRejectedValue(new Error(errorMessage));

      await expect(service.getFilmSchedule(filmId)).rejects.toThrow(errorMessage);
    });
  });
});