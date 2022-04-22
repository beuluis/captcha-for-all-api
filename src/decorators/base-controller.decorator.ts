import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
    applyDecorators,
    Controller,
    InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export const BaseController = (path: string, ...tags: string[]) =>
    applyDecorators(
        Controller(path),
        ApiException(() => InternalServerErrorException),
        ApiTags(...tags),
    );
