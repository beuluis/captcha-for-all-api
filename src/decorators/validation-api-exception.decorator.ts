import {
    applyDecorators,
    BadRequestException,
    HttpStatus,
} from '@nestjs/common';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

export const ValidationApiException = () =>
    applyDecorators(
        ApiException(
            () =>
                new BadRequestException({
                    error: 'Bad Request',
                    message: {
                        field: ['isNotEmpty'],
                    },
                    statusCode: HttpStatus.BAD_REQUEST,
                }),
            {
                description: 'Validation failed',
            },
        ),
    );
