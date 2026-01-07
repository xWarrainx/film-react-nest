import { Expose, Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';

export class ScheduleItemDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsUUID()
  film: string;

  @Expose()
  @IsString()
  daytime: string;

  @Expose()
  @IsNumber()
  hall: number;

  @Expose()
  @IsNumber()
  rows: number;

  @Expose()
  @IsNumber()
  seats: number;

  @Expose()
  @IsNumber()
  price: number;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  taken: string[];
}

export class FilmDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsNumber()
  rating: number;

  @Expose()
  @IsString()
  director: string;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @Expose()
  @IsString()
  image: string;

  @Expose()
  @IsString()
  cover: string;

  @Expose()
  @IsString()
  title: string;

  @Expose()
  @IsString()
  about: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
  schedule: ScheduleItemDto[];
}
