import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FilmEntity } from './film.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'filmId' })
  filmId: string;

  @ManyToOne(() => FilmEntity, (film) => film.schedule, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'filmId' })
  film: FilmEntity;

  @Column('varchar', { name: 'daytime' })
  daytime: string;

  @Column('int', { name: 'hall' })
  hall: number;

  @Column('int', { name: 'rows' })
  rows: number;

  @Column('int', { name: 'seats' })
  seats: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'price' })
  price: number;

  @Column('text', { array: true })
  taken: string[];
}
