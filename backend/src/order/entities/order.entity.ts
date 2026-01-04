import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { FilmEntity } from '../../films/entities/film.entity';
import { Schedule } from '../../films/entities/schedule.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ name: 'film_id' })
  filmId: string;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => FilmEntity)
  @JoinColumn({ name: 'film_id' })
  film: FilmEntity;

  @ManyToOne(() => Schedule)
  @JoinColumn({ name: 'session_id' })
  session: Schedule;

  @Column('int')
  row: number;

  @Column('int')
  seat: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
