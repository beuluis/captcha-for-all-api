import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { defaultValidationPipeConfig } from './validation/validation-pipe.config';
import { version, name, description } from '../package.json';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule.register(),
        new FastifyAdapter({ logger: true }),
    );

    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeConfig));

    // TODO: helmet

    const config = new DocumentBuilder()
        .setTitle(name)
        .setDescription(description)
        .setVersion(version)
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(80, '0.0.0.0');
}
bootstrap();
