import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'node:path';

import { FilmsController } from './films/films.controller';
import { OrderController } from './order/order.controller';
import { FilmsService } from './films/films.service';
import { OrderService } from './order/order.service';
import { FilmsMongoRepository } from './repository/films-mongo.repository';
import { Film, FilmSchema } from './films/film.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>(
          'DATABASE_URL',
          'mongodb://127.0.0.1:27017/afisha',
        ),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }]),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public', 'content', 'afisha'),
      serveRoot: '/content/afisha',
    }),
  ],
  controllers: [FilmsController, OrderController],
  providers: [
    {
      provide: 'IFilmsRepository',
      useClass: FilmsMongoRepository,
    },
    FilmsService,
    OrderService,
  ],
})
export class AppModule {}
