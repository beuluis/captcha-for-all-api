import { ValidationPipe } from '@nestjs/common';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { SilenceLogger } from './silence-logger';
import { AppModule } from '../../src/app.module';
import { defaultValidationPipeConfig } from '../../src/validation/validation-pipe.config';

export const bootstrapTestApplication = async (
    override?: (testingModuleBuilder: TestingModuleBuilder) => Promise<void>,
): Promise<NestFastifyApplication> => {
    const testingModuleBuilder = Test.createTestingModule({
        imports: [AppModule.register(true)],
    });

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
