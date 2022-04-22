import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { defaultValidationPipeConfig } from './validation/validation-pipe.config';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({ logger: true }),
    );

    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeConfig));

    // TODO: helmet

    const config = new DocumentBuilder()
        .setTitle('Captcha for all')
        .setDescription('Captcha for all api OpenAPI document')
        .setVersion('1.0')
        .addTag('Challenge')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(80, '0.0.0.0');
}
bootstrap();
