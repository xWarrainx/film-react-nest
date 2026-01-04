import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'node:path';

import { FilmsController } from './films/films.controller';
import { OrderController } from './order/order.controller';
import { FilmsService } from './films/films.service';
import { OrderService } from './order/order.service';
import { FilmsPostgresRepository } from './repository/films-postgres.repository';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public', 'content', 'afisha'),
      serveRoot: '/content/afisha',
      exclude: ['/api/*'],
    }),
  ],
  controllers: [FilmsController, OrderController],
  providers: [
    {
      provide: 'IFilmsRepository',
      useClass: FilmsPostgresRepository,
    },
    FilmsService,
    OrderService,
  ],
})
export class AppModule {}
