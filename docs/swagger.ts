import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFile } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { version, name, description } from '../package.json';
import { AppModule } from '../src/app.module';

async function writeSwaggerDocs() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule.register(true),
        new FastifyAdapter({ logger: true }),
    );

    const config = new DocumentBuilder()
        .setTitle(name)
        .setDescription(description)
        .setVersion(version)
        .build();

    const document = SwaggerModule.createDocument(app, config);

    const promisifiedWriteFile = promisify(writeFile);
    await promisifiedWriteFile(
        join(__dirname, 'swagger.json'),
        JSON.stringify(document, null, 4),
    );
    await app.close();
}
writeSwaggerDocs();
