import {
    InternalServerErrorException,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';
import { Challenge } from '../../src/challenge/challenge.entity';
import { ChallengeAlreadyVerifiedException } from '../../src/challenge/exceptions/challenge-already-verified.exception';
import { GlobalExceptionFilter } from '../../src/global-exception.filter';

describe('GlobalExceptionFilter', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    [
        {
            inputException: new EntityNotFoundError(Challenge, {
                token: 'test',
            }),
            outputException: new NotFoundException(
                'Could not find any entity of type "Challenge" matching: {\n    "token": "test"\n}',
            ),
        },
        {
            inputException: new ChallengeAlreadyVerifiedException(),
            outputException: new UnprocessableEntityException(),
        },
        {
            inputException: new Error(),
            outputException: new InternalServerErrorException(),
        },
    ].forEach((e) => {
        it(`should catch ${e.inputException.constructor.name} and throw ${e.outputException.constructor.name}`, () => {
            const globalExceptionFilter = new GlobalExceptionFilter();

            expect(() => globalExceptionFilter.catch(e.inputException)).toThrow(
                e.outputException,
            );
        });
    });
});
