import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FilmEntity } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';
import { OrderEntity } from '../order/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        console.log('Using PostgreSQL database...');
        return {
          type: 'postgres',
          host: configService.get('DATABASE_HOST', 'localhost'),
          port: configService.get('DATABASE_PORT', 5432),
          username: configService.get('DATABASE_USERNAME', 'postgres'),
          password: configService.get('DATABASE_PASSWORD', 'postgres'),
          database: configService.get('DATABASE_NAME', 'afisha'),
          entities: [FilmEntity, Schedule, OrderEntity],
          synchronize: false,
          logging: configService.get('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([FilmEntity, Schedule, OrderEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
