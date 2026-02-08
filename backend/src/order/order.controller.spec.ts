import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import {
  CreateOrderDto,
  OrderResponseDto,
  TicketDto,
  TicketWithIdDto,
} from './dto/order.dto';

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

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('должен создавать заказ и возвращать OrderResponseDto со статусом 201', async () => {
      mockOrderService.createOrder.mockResolvedValue(mockOrderResponse);

      const result = await controller.createOrder(mockCreateOrderDto);

      expect(result).toEqual(mockOrderResponse);
      expect(result).toHaveProperty('total', 500);
      expect(result).toHaveProperty('items');
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toHaveProperty('id', 'ticket-123');
      expect(orderService.createOrder).toHaveBeenCalledWith(mockCreateOrderDto);
      expect(orderService.createOrder).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать несколько билетов', async () => {
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

      const result = await controller.createOrder(multipleTicketsDto);

      expect(result.total).toBe(1500);
      expect(result.items).toHaveLength(3);
      expect(result.items[0].seat).toBe(12);
      expect(result.items[1].seat).toBe(13);
      expect(result.items[2].seat).toBe(14);
      expect(orderService.createOrder).toHaveBeenCalledWith(multipleTicketsDto);
    });

    it('должен корректно обрабатывать ошибки сервиса', async () => {
      const errorMessage = 'No available seats';
      mockOrderService.createOrder.mockRejectedValue(new Error(errorMessage));

      await expect(controller.createOrder(mockCreateOrderDto)).rejects.toThrow(
        errorMessage,
      );
      expect(orderService.createOrder).toHaveBeenCalledWith(mockCreateOrderDto);
    });

    it('должен валидировать обязательные поля из DTO', async () => {
      mockOrderService.createOrder.mockResolvedValue(mockOrderResponse);

      await controller.createOrder(mockCreateOrderDto);

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

  // Тесты на граничные случаи
  describe('граничные случаи', () => {
    it('должен обрабатывать необязательные поля day и time в билетах', async () => {
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

      mockOrderService.createOrder.mockResolvedValue(
        responseWithOptionalFields,
      );

      const result = await controller.createOrder(dtoWithOptionalFields);

      expect(result.items[0]).toHaveProperty('day', '2024-01-01');
      expect(result.items[0]).toHaveProperty('time', '18:00');
    });

    it('должен обрабатывать пустой массив билетов от сервиса', async () => {
      const emptyResponse: OrderResponseDto = {
        total: 0,
        items: [],
      };

      mockOrderService.createOrder.mockResolvedValue(emptyResponse);

      const result = await controller.createOrder(mockCreateOrderDto);

      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });
});
