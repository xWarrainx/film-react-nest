import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity('films')
export class FilmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('decimal', { precision: 3, scale: 1 })
  rating: number;

  @Column()
  director: string;

  @Column('simple-array')
  tags: string[];

  @Column()
  title: string;

  @Column('text')
  about: string;

  @Column('text')
  description: string;

  @Column()
  image: string;

  @Column()
  cover: string;

  @OneToMany(() => Schedule, (schedule) => schedule.film, {
    cascade: true,
    eager: false,
  })
  schedule: Schedule[];

  @CreateDateColumn()
  created_at: Date;
}
