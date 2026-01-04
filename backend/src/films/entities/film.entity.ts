import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity('films')
export class FilmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('decimal', { precision: 3, scale: 1, name: 'rating' })
  rating: number;

  @Column({ name: 'director' })
  director: string;

  @Column('text', { name: 'tags' })
  tags: string;

  @Column({ name: 'image' })
  image: string;

  @Column({ name: 'cover' })
  cover: string;

  @Column({ name: 'title' })
  title: string;

  @Column('text', { name: 'about' })
  about: string;

  @Column('text', { name: 'description' })
  description: string;

  @OneToMany(() => Schedule, (schedule) => schedule.film)
  schedule: Schedule[];
}
