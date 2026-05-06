import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so the React Native / Expo client can connect
  app.enableCors();

  // Auto-validate DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(3000);
  console.log('🚀 Backend running on http://localhost:3000');
}
bootstrap();
