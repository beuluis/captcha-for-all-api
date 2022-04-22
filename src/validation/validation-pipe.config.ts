import {
    BadRequestException,
    HttpStatus,
    ValidationPipeOptions,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export const defaultValidationPipeConfig: ValidationPipeOptions = {
    exceptionFactory: (errors: ValidationError[]): BadRequestException => {
        const message: { [index: string]: string[] } = {};
        errors.forEach((e) => {
            if (e.constraints) {
                message[e.property] = Object.keys(e.constraints);
            }
        });
        return new BadRequestException({
            error: 'Bad Request',
            message,
            statusCode: HttpStatus.BAD_REQUEST,
        });
    },
};
