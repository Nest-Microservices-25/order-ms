import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('OrdersMS-Main');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: envs.port,
      },
    },
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen();

  logger.log(`\n🚀 ORDERS MICROSERVICE running at:`);
  logger.log(`📜  API Docs: \x1b[36mhttp://localhost:${envs.port}/api\x1b[0m`);
  logger.log(`🔗  API URL: \x1b[32mhttp://localhost:${envs.port}\x1b[0m\n`);
}
bootstrap();
