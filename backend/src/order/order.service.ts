import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IFilmsRepository } from '../repository/films.repository.interface';
import {
  CreateOrderDto,
  OrderResponseDto,
  TicketWithIdDto,
  TicketDto,
} from './dto/order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  constructor(
    @Inject('IFilmsRepository')
    private filmsRepository: IFilmsRepository,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const { email, phone, tickets } = createOrderDto;

    if (!tickets || tickets.length === 0) {
      throw new BadRequestException('No tickets provided');
    }

    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (!this.isValidPhone(phone)) {
      throw new BadRequestException('Invalid phone format');
    }

    const results: TicketWithIdDto[] = [];

    const groupedTickets = this.groupTicketsByFilmAndSession(tickets);

    for (const [filmId, sessions] of groupedTickets) {
      for (const [sessionId, sessionTickets] of sessions) {
        const session = await this.filmsRepository.findSession(
          filmId,
          sessionId,
        );

        if (!session) {
          throw new BadRequestException(
            `Session ${sessionId} not found for film ${filmId}`,
          );
        }

        // Проверяем, совпадает ли daytime
        const firstTicket = sessionTickets[0];
        if (firstTicket.daytime !== session.daytime) {
          throw new BadRequestException(
            `Daytime mismatch for session ${sessionId}`,
          );
        }

        // Проверяем, совпадает ли price
        if (firstTicket.price !== session.price) {
          throw new BadRequestException(
            `Price mismatch for session ${sessionId}`,
          );
        }

        // Преобразуем билеты в места
        const seats = sessionTickets.map(
          (ticket) => `${ticket.row}:${ticket.seat}`,
        );

        try {
          // Бронируем места
          await this.filmsRepository.reserveSeats(filmId, sessionId, seats);

          // Создаем результат для каждого билета
          sessionTickets.forEach((ticket) => {
            const responseTicket: TicketWithIdDto = {
              id: this.generateOrderId(),
              film: ticket.film,
              session: ticket.session,
              daytime: ticket.daytime,
              row: ticket.row,
              seat: ticket.seat,
              price: ticket.price,
            };
            results.push(responseTicket);
          });
        } catch (error) {
          throw new BadRequestException(
            `Failed to reserve seats: ${error.message}`,
          );
        }
      }
    }

    return {
      total: results.length,
      items: results,
    };
  }

  private groupTicketsByFilmAndSession(
    tickets: TicketDto[],
  ): Map<string, Map<string, TicketDto[]>> {
    const grouped = new Map<string, Map<string, TicketDto[]>>();

    for (const ticket of tickets) {
      if (!grouped.has(ticket.film)) {
        grouped.set(ticket.film, new Map<string, TicketDto[]>());
      }

      const filmGroup = grouped.get(ticket.film)!;
      if (!filmGroup.has(ticket.session)) {
        filmGroup.set(ticket.session, []);
      }

      filmGroup.get(ticket.session)!.push(ticket);
    }

    return grouped;
  }

  private generateOrderId(): string {
    return 'urn:uuid:' + uuidv4();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return phone.length >= 10;
  }
}
