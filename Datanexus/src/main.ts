import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS altamente permisivo para desarrollo en Cloud Workstations
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir cualquier origen que venga de cloudworkstations.dev o localhost
      if (!origin || origin.includes('cloudworkstations.dev') || origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(null, true); // En desarrollo permitimos todo por ahora
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
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
  // Escuchamos en todas las interfaces
  await app.listen(port, '0.0.0.0');
  console.log(`Backend de DataNexus corriendo en el puerto: ${port}`);
}
bootstrap();
