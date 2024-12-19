import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

async function bootstrap() {
  // Load environment variables
  ConfigModule.forRoot();

  // Create the application instance
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Use the ValidationPipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      //whitelist: true, // Remove extra properties not defined in DTOs -> a 400 was being generated for other systems of application
      //forbidNonWhitelisted: true, // Reject requests with extra properties -> a 400 was being generated for other systems of application
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  // Start the server
  await app.listen(5000, '0.0.0.0');
}

bootstrap();
