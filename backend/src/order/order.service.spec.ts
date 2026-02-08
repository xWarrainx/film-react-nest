import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { IFilmsRepository } from '../repository/films.repository.interface';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateOrderDto, TicketDto } from './dto/order.dto';

describe('OrderService', () => {
  let service: OrderService;
  let filmsRepository: IFilmsRepository;

  // Мокаем репозиторий
  const mockFilmsRepository = {
    findAll: jest.fn(),
    reserveSeats: jest.fn(),
  };

  // Тестовые данные
  const mockFilm = {
    id: 'film-1',
    title: 'Inception',
    schedule: [
      {
        id: 'session-1',
        daytime: '18:00',
        price: 500,
        seats: { total: 100, booked: [] },
      },
      {
        id: 'session-2',
        daytime: '20:00',
        price: 600,
        seats: { total: 100, booked: [] },
      },
    ],
  };

  const mockTicketDto: TicketDto = {
    film: 'film-1',
    session: 'session-1',
    daytime: '18:00',
    row: 5,
    seat: 12,
    price: 500,
  };

  const mockCreateOrderDto: CreateOrderDto = {
    email: 'test@example.com',
    phone: '+1234567890',
    tickets: [mockTicketDto],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: 'IFilmsRepository',
          useValue: mockFilmsRepository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    filmsRepository = module.get<IFilmsRepository>('IFilmsRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('должен успешно создавать заказ', async () => {
      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);
      mockFilmsRepository.reserveSeats.mockResolvedValue(undefined);

      const result = await service.createOrder(mockCreateOrderDto);

      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('items');
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toHaveProperty('id');
      expect(result.items[0].film).toBe('film-1');
      expect(result.items[0].session).toBe('session-1');

      expect(filmsRepository.findAll).toHaveBeenCalled();
      expect(filmsRepository.reserveSeats).toHaveBeenCalledWith(
        'film-1',
        'session-1',
        ['5:12'],
      );
    });

    it('должен выбрасывать BadRequestException дял пустого списка билетов', async () => {
      const emptyTicketsDto: CreateOrderDto = {
        email: 'test@example.com',
        phone: '+1234567890',
        tickets: [],
      };

      await expect(service.createOrder(emptyTicketsDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('должен выбрасывать BadRequestException для невалидного email', async () => {
      const invalidEmailDto: CreateOrderDto = {
        email: 'invalid-email',
        phone: '+1234567890',
        tickets: [mockTicketDto],
      };

      await expect(service.createOrder(invalidEmailDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('должен выбрасывать BadRequestException для невалидного phone', async () => {
      const invalidPhoneDto: CreateOrderDto = {
        email: 'test@example.com',
        phone: '123',
        tickets: [mockTicketDto],
      };

      await expect(service.createOrder(invalidPhoneDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('должен выбрасывать NotFoundException для несуществующего фильма', async () => {
      mockFilmsRepository.findAll.mockResolvedValue([]);

      await expect(service.createOrder(mockCreateOrderDto))
        .rejects
        .toThrow(NotFoundException);
    });

    it('должен выбрасывать NotFoundException для несуществующего сеанса', async () => {
      const ticketWithWrongSession: TicketDto = {
        ...mockTicketDto,
        session: 'non-existent-session',
      };

      const dtoWithWrongSession: CreateOrderDto = {
        ...mockCreateOrderDto,
        tickets: [ticketWithWrongSession],
      };

      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);

      await expect(service.createOrder(dtoWithWrongSession))
        .rejects
        .toThrow(NotFoundException);
    });

    it('должен выбрасывать BadRequestException при несовпадении времени', async () => {
      const ticketWithWrongDaytime: TicketDto = {
        ...mockTicketDto,
        daytime: '20:00',
      };

      const dtoWithWrongDaytime: CreateOrderDto = {
        ...mockCreateOrderDto,
        tickets: [ticketWithWrongDaytime],
      };

      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);

      await expect(service.createOrder(dtoWithWrongDaytime))
        .rejects
        .toThrow(BadRequestException);
    });

    it('должен выбрасывать BadRequestException при несовпадении цены', async () => {
      const ticketWithWrongPrice: TicketDto = {
        ...mockTicketDto,
        price: 600,
      };

      const dtoWithWrongPrice: CreateOrderDto = {
        ...mockCreateOrderDto,
        tickets: [ticketWithWrongPrice],
      };

      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);

      await expect(service.createOrder(dtoWithWrongPrice))
        .rejects
        .toThrow(BadRequestException);
    });

    it('должен обрабатывать несколько билетов на один фильм и сеанс', async () => {
      const multipleTicketsDto: CreateOrderDto = {
        email: 'group@example.com',
        phone: '+1234567890',
        tickets: [
          { ...mockTicketDto, row: 5, seat: 12 },
          { ...mockTicketDto, row: 5, seat: 13 },
          { ...mockTicketDto, row: 5, seat: 14 },
        ],
      };

      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);
      mockFilmsRepository.reserveSeats.mockResolvedValue(undefined);

      const result = await service.createOrder(multipleTicketsDto);

      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(3);
      expect(filmsRepository.reserveSeats).toHaveBeenCalledWith(
        'film-1',
        'session-1',
        ['5:12', '5:13', '5:14'],
      );
    });

    it('должен обрабатывать несколько фильмов и сеансов', async () => {
      const mockFilm2 = {
        id: 'film-2',
        title: 'Interstellar',
        schedule: [
          {
            id: 'session-3',
            daytime: '19:00',
            price: 550,
            seats: { total: 100, booked: [] },
          },
        ],
      };

      const ticketsForMultipleFilms: CreateOrderDto = {
        email: 'test@example.com',
        phone: '+1234567890',
        tickets: [
          { ...mockTicketDto, film: 'film-1', session: 'session-1' },
          {
            ...mockTicketDto,
            film: 'film-2',
            session: 'session-3',
            daytime: '19:00',
            price: 550,
          },
        ],
      };

      mockFilmsRepository.findAll.mockResolvedValue([mockFilm, mockFilm2]);
      mockFilmsRepository.reserveSeats
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      const result = await service.createOrder(ticketsForMultipleFilms);

      expect(result.total).toBe(2);
      expect(filmsRepository.reserveSeats).toHaveBeenCalledTimes(2);
    });

    it('должен выбрасывать ConflictException для уже занятых мест', async () => {
      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);
      mockFilmsRepository.reserveSeats.mockRejectedValue(
        new Error('Seat already taken'),
      );

      await expect(service.createOrder(mockCreateOrderDto))
        .rejects
        .toThrow(ConflictException);
    });

    it('должен выбрасывать BadRequestException для невалидного формата места', async () => {
      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);
      mockFilmsRepository.reserveSeats.mockRejectedValue(
        new Error('Invalid seat format'),
      );

      await expect(service.createOrder(mockCreateOrderDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('должен выбрасывать BadRequestException для места вне диапазона', async () => {
      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);
      mockFilmsRepository.reserveSeats.mockRejectedValue(
        new Error('Seat out of range'),
      );

      await expect(service.createOrder(mockCreateOrderDto))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('приватные методы', () => {
    describe('isValidEmail', () => {
      it('должен валидировать корректные email', () => {
        const serviceAny = service as any;

        expect(serviceAny.isValidEmail('test@example.com')).toBe(true);
        expect(serviceAny.isValidEmail('user.name@domain.co.uk')).toBe(true);
      });

      it('должен отклонять невалидные email', () => {
        const serviceAny = service as any;

        expect(serviceAny.isValidEmail('invalid-email')).toBe(false);
        expect(serviceAny.isValidEmail('@example.com')).toBe(false);
        expect(serviceAny.isValidEmail('test@')).toBe(false);
      });
    });

    describe('isValidPhone', () => {
      it('должен валидировать телефоны длиной не менее 10 символов', () => {
        const serviceAny = service as any;

        expect(serviceAny.isValidPhone('+1234567890')).toBe(true);
        expect(serviceAny.isValidPhone('1234567890')).toBe(true);
        expect(serviceAny.isValidPhone('+1 (234) 567-890')).toBe(true);
      });

      it('должен отклонять телефоны короче 10 символов', () => {
        const serviceAny = service as any;

        expect(serviceAny.isValidPhone('123')).toBe(false);
        expect(serviceAny.isValidPhone('+123456')).toBe(false);
      });
    });

    describe('groupTicketsByFilmAndSession', () => {
      it('должен правильно группировать билеты', () => {
        const serviceAny = service as any;

        const tickets: TicketDto[] = [
          { ...mockTicketDto, film: 'film-1', session: 'session-1' },
          { ...mockTicketDto, film: 'film-1', session: 'session-1' },
          { ...mockTicketDto, film: 'film-1', session: 'session-2' },
          { ...mockTicketDto, film: 'film-2', session: 'session-3' },
        ];

        const result = serviceAny.groupTicketsByFilmAndSession(tickets);

        expect(result.size).toBe(2);

        // film-1
        const film1Group = result.get('film-1');
        expect(film1Group.size).toBe(2);
        expect(film1Group.get('session-1')).toHaveLength(2);
        expect(film1Group.get('session-2')).toHaveLength(1);

        // film-2
        const film2Group = result.get('film-2');
        expect(film2Group.size).toBe(1);
        expect(film2Group.get('session-3')).toHaveLength(1);
      });
    });

    describe('generateOrderId', () => {
      it('должен генерировать UUID с префиксом urn:uuid', () => {
        const serviceAny = service as any;

        const id = serviceAny.generateOrderId();

        expect(id).toMatch(/^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      });
    });
  });
});