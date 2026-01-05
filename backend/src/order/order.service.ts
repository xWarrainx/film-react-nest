import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IFilmsRepository } from '../repository/films.repository.interface';
import {
  CreateOrderDto,
  OrderResponseDto,
  TicketWithIdDto,
  TicketDto,
} from './dto/order.dto';
import { randomUUID } from 'crypto';
import { ScheduleItemDto } from '../films/dto/films.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject('IFilmsRepository')
    private filmsRepository: IFilmsRepository,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const { email, phone, tickets } = createOrderDto;

    // Валидация входных данных
    if (!tickets || tickets.length === 0) {
      throw new BadRequestException('No tickets provided');
    }

    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (!this.isValidPhone(phone)) {
      throw new BadRequestException('Invalid phone format');
    }

    const groupedTickets = this.groupTicketsByFilmAndSession(tickets);

    const filmIds = Array.from(groupedTickets.keys());
    const allFilms = await this.filmsRepository.findAll();

    const filmsMap = new Map<string, any>();
    allFilms.forEach((film) => {
      if (filmIds.includes(film.id)) {
        const sessionsMap = new Map<string, ScheduleItemDto>();
        film.schedule.forEach((session) => {
          sessionsMap.set(session.id, session);
        });
        filmsMap.set(film.id, {
          ...film,
          sessionsMap,
        });
      }
    });

    const results: TicketWithIdDto[] = [];

    for (const [filmId, sessions] of groupedTickets) {
      const film = filmsMap.get(filmId);

      if (!film) {
        throw new NotFoundException(`Film ${filmId} not found`);
      }

      for (const [sessionId, sessionTickets] of sessions) {
        const session = film.sessionsMap.get(sessionId);

        if (!session) {
          throw new NotFoundException(
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
          await this.filmsRepository.reserveSeats(filmId, sessionId, seats);

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
          // Преобразуем обычные ошибки в HTTP-исключения
          const errorMessage = error.message;

          if (errorMessage.includes('not found')) {
            throw new NotFoundException(errorMessage);
          } else if (errorMessage.includes('already taken')) {
            throw new ConflictException(errorMessage); // 409 для занятых мест
          } else if (
            errorMessage.includes('out of range') ||
            errorMessage.includes('Invalid seat format')
          ) {
            throw new BadRequestException(errorMessage);
          } else {
            throw new BadRequestException(
              `Failed to reserve seats: ${errorMessage}`,
            );
          }
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
    return 'urn:uuid:' + randomUUID();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return phone.length >= 10;
  }
}
