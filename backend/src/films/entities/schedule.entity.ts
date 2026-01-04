import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { FilmEntity } from './film.entity';
import { OrderEntity } from '../../order/entities/order.entity';

@Entity('schedule')
export class Schedule {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'film_id' })
  filmId: string;

  @ManyToOne(() => FilmEntity, (film) => film.schedule, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'film_id' })
  film: FilmEntity;

  @Column({ type: 'timestamptz' })
  daytime: Date;

  @Column('int')
  hall: number;

  @Column('int')
  rows: number;

  @Column('int')
  seats: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('jsonb', { nullable: true, default: () => "'[]'" })
  taken: string[];

  @OneToMany(() => OrderEntity, (order) => order.session)
  orders: OrderEntity[];
}
