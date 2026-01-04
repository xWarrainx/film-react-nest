import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FilmEntity } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        console.log('Using PostgreSQL database...');
        const isTest = configService.get('NODE_ENV') === 'test';
        return {
          type: 'postgres',
          host: configService.get('DATABASE_HOST', 'localhost'),
          port: configService.get('DATABASE_PORT', 5432),
          username: configService.get('DATABASE_USERNAME', 'postgres'),
          password: configService.get('DATABASE_PASSWORD', 'postgres'),
          database: isTest
            ? configService.get('DATABASE_NAME_TEST', 'afisha_test')
            : configService.get('DATABASE_NAME', 'afisha'),
          entities: [FilmEntity, Schedule],
          synchronize: false,
          logging: configService.get('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([FilmEntity, Schedule]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
