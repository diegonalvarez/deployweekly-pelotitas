import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true exposes the unparsed Buffer at req.rawBody — required for
  // Stripe webhook signature verification (see BillingController.webhook).
  const app = await NestFactory.create(AppModule, { rawBody: true });

  /* In dev, allow any localhost / 0.0.0.0 / 127.0.0.1 / LAN-IP origin so devs
     can hit the app via whichever hostname Next.js prints. In prod, set
     CORS_ORIGINS as a comma-separated whitelist (or FRONTEND_URL). */
  const explicitOrigins =
    process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ||
    (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : null);

  app.enableCors({
    origin: explicitOrigins ?? ((origin, cb) => {
      if (!origin) return cb(null, true); // curl, server-to-server
      if (/^https?:\/\/(localhost|0\.0\.0\.0|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`Origin ${origin} not allowed by CORS`), false);
    }),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Pelotitas API')
    .setDescription('Platform for padel & tennis clubs')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port);
  console.log(`Pelotitas API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
