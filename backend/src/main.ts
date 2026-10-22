
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable request validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for the Craftosa frontend
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Run backend on port 3001
  await app.listen(process.env.PORT ?? 3001);

  console.log(
    `Craftosa API is running at http://localhost:${process.env.PORT ?? 3001}`,
  );
}

bootstrap();
