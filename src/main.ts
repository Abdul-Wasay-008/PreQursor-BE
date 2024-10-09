import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';

async function bootstrap() {
  // Initialize ConfigModule to load the .env file
  ConfigModule.forRoot();

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Console log the message from .env
  // const message = process.env.MESSAGE || 'No message found';
  // console.log(message);

  await app.listen(5000);
}

bootstrap();
