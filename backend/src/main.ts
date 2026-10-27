import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set FRONTEND_URL to the deployed frontend origin in production.
  // Keep localhost available for local development.
  const configuredOrigins = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...configuredOrigins,
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`Craftosa API is running on port ${port}`);
}

bootstrap();
