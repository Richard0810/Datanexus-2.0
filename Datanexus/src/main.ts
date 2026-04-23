import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para aceptar peticiones desde el frontend en desarrollo y producción
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:9002', // Puerto configurado en frontend/studio/package.json
    'https://9000-firebase-ejemplo-cliente-1762256481430.cluster-lr6dwlc2lzbcctqhqorax5zmro.cloudworkstations.dev'
  ];

  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes('cloudworkstations.dev')) {
        callback(null, true);
      } else {
        console.log('Origin not allowed by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('DataNexus API')
    .setDescription('Servidor central de DataNexus para gestión académica')
    .setVersion('1.0')
    .addTag('datanexus')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend de DataNexus corriendo en: http://localhost:${port}`);
}
bootstrap();
