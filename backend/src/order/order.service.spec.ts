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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      // Arrange
      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);
      mockFilmsRepository.reserveSeats.mockResolvedValue(undefined);

      // Act
      const result = await service.createOrder(mockCreateOrderDto);

      // Assert
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

    it('should throw BadRequestException for empty tickets', async () => {
      // Arrange
      const emptyTicketsDto: CreateOrderDto = {
        email: 'test@example.com',
        phone: '+1234567890',
        tickets: [],
      };

      // Act & Assert
      await expect(service.createOrder(emptyTicketsDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid email', async () => {
      // Arrange
      const invalidEmailDto: CreateOrderDto = {
        email: 'invalid-email',
        phone: '+1234567890',
        tickets: [mockTicketDto],
      };

      // Act & Assert
      await expect(service.createOrder(invalidEmailDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid phone', async () => {
      // Arrange
      const invalidPhoneDto: CreateOrderDto = {
        email: 'test@example.com',
        phone: '123', // слишком короткий
        tickets: [mockTicketDto],
      };

      // Act & Assert
      await expect(service.createOrder(invalidPhoneDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent film', async () => {
      // Arrange
      mockFilmsRepository.findAll.mockResolvedValue([]);

      // Act & Assert
      await expect(service.createOrder(mockCreateOrderDto))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException for non-existent session', async () => {
      // Arrange
      const ticketWithWrongSession: TicketDto = {
        ...mockTicketDto,
        session: 'non-existent-session',
      };

      const dtoWithWrongSession: CreateOrderDto = {
        ...mockCreateOrderDto,
        tickets: [ticketWithWrongSession],
      };

      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);

      // Act & Assert
      await expect(service.createOrder(dtoWithWrongSession))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw BadRequestException for daytime mismatch', async () => {
      // Arrange
      const ticketWithWrongDaytime: TicketDto = {
        ...mockTicketDto,
        daytime: '20:00', // не совпадает с сеансом
      };

      const dtoWithWrongDaytime: CreateOrderDto = {
        ...mockCreateOrderDto,
        tickets: [ticketWithWrongDaytime],
      };

      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);

      // Act & Assert
      await expect(service.createOrder(dtoWithWrongDaytime))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw BadRequestException for price mismatch', async () => {
      // Arrange
      const ticketWithWrongPrice: TicketDto = {
        ...mockTicketDto,
        price: 600, // не совпадает с ценой сеанса
      };

      const dtoWithWrongPrice: CreateOrderDto = {
        ...mockCreateOrderDto,
        tickets: [ticketWithWrongPrice],
      };

      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);

      // Act & Assert
      await expect(service.createOrder(dtoWithWrongPrice))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should handle multiple tickets for same film and session', async () => {
      // Arrange
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

      // Act
      const result = await service.createOrder(multipleTicketsDto);

      // Assert
      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(3);
      expect(filmsRepository.reserveSeats).toHaveBeenCalledWith(
        'film-1',
        'session-1',
        ['5:12', '5:13', '5:14'],
      );
    });

    it('should handle multiple films and sessions', async () => {
      // Arrange
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
        .mockResolvedValueOnce(undefined) // для film-1
        .mockResolvedValueOnce(undefined); // для film-2

      // Act
      const result = await service.createOrder(ticketsForMultipleFilms);

      // Assert
      expect(result.total).toBe(2);
      expect(filmsRepository.reserveSeats).toHaveBeenCalledTimes(2);
    });

    it('should throw ConflictException for already taken seats', async () => {
      // Arrange
      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);
      mockFilmsRepository.reserveSeats.mockRejectedValue(
        new Error('Seat already taken'),
      );

      // Act & Assert
      await expect(service.createOrder(mockCreateOrderDto))
        .rejects
        .toThrow(ConflictException);
    });

    it('should throw BadRequestException for invalid seat format', async () => {
      // Arrange
      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);
      mockFilmsRepository.reserveSeats.mockRejectedValue(
        new Error('Invalid seat format'),
      );

      // Act & Assert
      await expect(service.createOrder(mockCreateOrderDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw NotFoundException for seat out of range', async () => {
      // Arrange
      mockFilmsRepository.findAll.mockResolvedValue([mockFilm]);
      mockFilmsRepository.reserveSeats.mockRejectedValue(
        new Error('Seat out of range'),
      );

      // Act & Assert
      await expect(service.createOrder(mockCreateOrderDto))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('private methods', () => {
    describe('isValidEmail', () => {
      it('should validate correct emails', () => {
        const serviceAny = service as any;

        expect(serviceAny.isValidEmail('test@example.com')).toBe(true);
        expect(serviceAny.isValidEmail('user.name@domain.co.uk')).toBe(true);
      });

      it('should reject invalid emails', () => {
        const serviceAny = service as any;

        expect(serviceAny.isValidEmail('invalid-email')).toBe(false);
        expect(serviceAny.isValidEmail('@example.com')).toBe(false);
        expect(serviceAny.isValidEmail('test@')).toBe(false);
      });
    });

    describe('isValidPhone', () => {
      it('should validate phones with at least 10 characters', () => {
        const serviceAny = service as any;

        expect(serviceAny.isValidPhone('+1234567890')).toBe(true);
        expect(serviceAny.isValidPhone('1234567890')).toBe(true);
        expect(serviceAny.isValidPhone('+1 (234) 567-890')).toBe(true);
      });

      it('should reject phones shorter than 10 characters', () => {
        const serviceAny = service as any;

        expect(serviceAny.isValidPhone('123')).toBe(false);
        expect(serviceAny.isValidPhone('+123456')).toBe(false);
      });
    });

    describe('groupTicketsByFilmAndSession', () => {
      it('should group tickets correctly', () => {
        const serviceAny = service as any;

        const tickets: TicketDto[] = [
          { ...mockTicketDto, film: 'film-1', session: 'session-1' },
          { ...mockTicketDto, film: 'film-1', session: 'session-1' },
          { ...mockTicketDto, film: 'film-1', session: 'session-2' },
          { ...mockTicketDto, film: 'film-2', session: 'session-3' },
        ];

        const result = serviceAny.groupTicketsByFilmAndSession(tickets);

        expect(result.size).toBe(2); // 2 фильма

        // film-1
        const film1Group = result.get('film-1');
        expect(film1Group.size).toBe(2); // 2 сеанса
        expect(film1Group.get('session-1')).toHaveLength(2);
        expect(film1Group.get('session-2')).toHaveLength(1);

        // film-2
        const film2Group = result.get('film-2');
        expect(film2Group.size).toBe(1);
        expect(film2Group.get('session-3')).toHaveLength(1);
      });
    });

    describe('generateOrderId', () => {
      it('should generate UUID with urn:uuid prefix', () => {
        const serviceAny = service as any;

        const id = serviceAny.generateOrderId();

        expect(id).toMatch(/^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      });
    });
  });
});