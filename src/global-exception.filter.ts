import {
    Catch,
    ExceptionFilter,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { ChallengeAlreadyVerifiedException } from './challenge/exceptions/challenge-already-verified.exception';

@Catch(QueryFailedError, EntityNotFoundError, ChallengeAlreadyVerifiedException)
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('ExceptionFilter');

    catch(exception: unknown) {
        const message = (exception as { message: string }).message;

        // remap some errors the the wanted http exception to have right format
        switch (exception.constructor) {
            case EntityNotFoundError:
                throw new NotFoundException(message);
            case ChallengeAlreadyVerifiedException:
                throw new UnprocessableEntityException(message);
            default:
                throw new InternalServerErrorException(message);
        }
    }
}
