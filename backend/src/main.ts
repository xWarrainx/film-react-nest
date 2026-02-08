import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { LoggerFactory } from './logger/logger.factory';

if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  (global as any).crypto = {
    randomUUID: () => uuidv4(),
  };
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true, // Важно! Буферизуем логи до подключения логгера
  });

  // Подключаем логгер в зависимости от переменной окружения
  const logger = LoggerFactory.createLogger();
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api/afisha');

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await app.listen(3000);

  // Используем логгер, который мы создали
  logger.log(`Application is running on: http://localhost:3000`);
}
bootstrap();