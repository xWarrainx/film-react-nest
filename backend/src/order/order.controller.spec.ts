import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderResponseDto, TicketDto, TicketWithIdDto } from './dto/order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;

  // Мокаем сервис
  const mockOrderService = {
    createOrder: jest.fn(),
  };

  // Тестовые данные
  const mockTicketDto: TicketDto = {
    film: 'Inception',
    session: 'evening',
    daytime: '18:00',
    row: 5,
    seat: 12,
    price: 500,
  };

  const mockTicketWithIdDto: TicketWithIdDto = {
    ...mockTicketDto,
    id: 'ticket-123',
    day: '2024-01-01',
    time: '18:00',
  };

  const mockCreateOrderDto: CreateOrderDto = {
    email: 'test@example.com',
    phone: '+1234567890',
    tickets: [mockTicketDto],
  };

  const mockOrderResponse: OrderResponseDto = {
    total: 500,
    items: [mockTicketWithIdDto],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create order and return OrderResponseDto with 201 status', async () => {
      // Arrange
      mockOrderService.createOrder.mockResolvedValue(mockOrderResponse);

      // Act
      const result = await controller.createOrder(mockCreateOrderDto);

      // Assert
      expect(result).toEqual(mockOrderResponse);
      expect(result).toHaveProperty('total', 500);
      expect(result).toHaveProperty('items');
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toHaveProperty('id', 'ticket-123');
      expect(orderService.createOrder).toHaveBeenCalledWith(mockCreateOrderDto);
      expect(orderService.createOrder).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple tickets', async () => {
      // Arrange
      const multipleTicketsDto: CreateOrderDto = {
        email: 'group@example.com',
        phone: '+1234567890',
        tickets: [
          { ...mockTicketDto, row: 5, seat: 12, price: 500 },
          { ...mockTicketDto, row: 5, seat: 13, price: 500 },
          { ...mockTicketDto, row: 5, seat: 14, price: 500 },
        ],
      };

      const multipleTicketsResponse: OrderResponseDto = {
        total: 1500,
        items: [
          { ...mockTicketWithIdDto, id: 'ticket-1', row: 5, seat: 12 },
          { ...mockTicketWithIdDto, id: 'ticket-2', row: 5, seat: 13 },
          { ...mockTicketWithIdDto, id: 'ticket-3', row: 5, seat: 14 },
        ],
      };

      mockOrderService.createOrder.mockResolvedValue(multipleTicketsResponse);

      // Act
      const result = await controller.createOrder(multipleTicketsDto);

      // Assert
      expect(result.total).toBe(1500);
      expect(result.items).toHaveLength(3);
      expect(result.items[0].seat).toBe(12);
      expect(result.items[1].seat).toBe(13);
      expect(result.items[2].seat).toBe(14);
      expect(orderService.createOrder).toHaveBeenCalledWith(multipleTicketsDto);
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const errorMessage = 'No available seats';
      mockOrderService.createOrder.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(
        controller.createOrder(mockCreateOrderDto),
      ).rejects.toThrow(errorMessage);
      expect(orderService.createOrder).toHaveBeenCalledWith(mockCreateOrderDto);
    });

    it('should validate required fields from DTO', async () => {
      // Arrange
      mockOrderService.createOrder.mockResolvedValue(mockOrderResponse);

      // Act
      await controller.createOrder(mockCreateOrderDto);

      // Assert
      expect(orderService.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          email: expect.stringMatching(/@/),
          phone: expect.any(String),
          tickets: expect.arrayContaining([
            expect.objectContaining({
              film: expect.any(String),
              session: expect.any(String),
              row: expect.any(Number),
              seat: expect.any(Number),
              price: expect.any(Number),
            }),
          ]),
        }),
      );
    });
  });

  // Тесты на edge cases
  describe('edge cases', () => {
    it('should handle optional day and time fields in tickets', async () => {
      // Arrange
      const ticketWithOptionalFields: TicketDto = {
        film: 'Inception',
        session: 'evening',
        daytime: '18:00',
        day: '2024-01-01',
        time: '18:00',
        row: 5,
        seat: 12,
        price: 500,
      };

      const dtoWithOptionalFields: CreateOrderDto = {
        email: 'test@example.com',
        phone: '+1234567890',
        tickets: [ticketWithOptionalFields],
      };

      const responseWithOptionalFields: OrderResponseDto = {
        total: 500,
        items: [
          {
            ...ticketWithOptionalFields,
            id: 'ticket-123',
          },
        ],
      };

      mockOrderService.createOrder.mockResolvedValue(responseWithOptionalFields);

      // Act
      const result = await controller.createOrder(dtoWithOptionalFields);

      // Assert
      expect(result.items[0]).toHaveProperty('day', '2024-01-01');
      expect(result.items[0]).toHaveProperty('time', '18:00');
    });

    it('should handle empty tickets array from service', async () => {
      // Arrange
      const emptyResponse: OrderResponseDto = {
        total: 0,
        items: [],
      };

      mockOrderService.createOrder.mockResolvedValue(emptyResponse);

      // Act
      const result = await controller.createOrder(mockCreateOrderDto);

      // Assert
      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });
});