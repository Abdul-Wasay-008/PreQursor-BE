import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  // Load environment variables
  ConfigModule.forRoot();

  // Create the application instance
  const app = await NestFactory.create(AppModule);

  // ✅ Parse JSON bodies
  app.use(bodyParser.json());

  // ✅ Parse URL-encoded bodies (needed for Easypaisa)
  app.use(bodyParser.urlencoded({ extended: true }));

  // Enable CORS for frontend communication
  app.enableCors({
    origin: '*', // ✅ Allow all origins temporarily for debugging
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

  // Serve static files from 'uploads' folder
  const uploadPath = process.env.UPLOAD_PATH || join(__dirname, '..', 'uploads');
  app.use('/uploads', express.static(uploadPath));

  // Start the server
  const PORT = process.env.PORT;
  await app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

bootstrap();
