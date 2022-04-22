import { ValidationPipe } from '@nestjs/common';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Connection, createConnection } from 'typeorm';
import { SilenceLogger } from './silence-logger';
import { AppModule } from '../../src/app.module';
import { Challenge } from '../../src/challenge/challenge.entity';
import { defaultValidationPipeConfig } from '../../src/validation/validation-pipe.config';

export const bootstrapTestApplication = async (
    override?: (testingModuleBuilder: TestingModuleBuilder) => Promise<void>,
): Promise<NestFastifyApplication> => {
    const testingModuleBuilder = Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider(Connection)
        .useValue(
            await createConnection({
                type: 'postgres',
                host: 'localhost',
                username: 'test',
                password: 'test',
                database: 'test',
                synchronize: true,
                entities: [Challenge],
            }),
        );

    if (override) await override(testingModuleBuilder);

    const testingModule = await testingModuleBuilder.compile();

    const app = testingModule.createNestApplication<NestFastifyApplication>(
        new FastifyAdapter(),
        { logger: new SilenceLogger() },
    );

    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeConfig));

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    return app;
};
