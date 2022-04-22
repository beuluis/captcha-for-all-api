import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mock from 'jest-mock-extended/lib/Mock';
import { of } from 'rxjs';
import { bootstrapTestApplication } from '../helpers/bootstrap-test-application';
import { HCaptchaService } from '../../src/h-captcha/h-captcha.service';
import { HCaptchaErrorCodes } from '../../src/h-captcha/enums/h-captcha-error-codes.enum';

describe('Challenge', () => {
    let app: INestApplication;
    const hCaptchaService = mock<HCaptchaService>();

    beforeAll(async () => {
        app = await bootstrapTestApplication((testingModuleBuilder) => {
            testingModuleBuilder
                .overrideProvider(HCaptchaService)
                .useValue(hCaptchaService);
            return Promise.resolve();
        });
    });

    describe('/challenge/create', () => {
        it('should create new challenge', async () => {
            await request(app.getHttpServer())
                .post('/challenge/create')
                .expect((response) => {
                    expect(response.status).toEqual(HttpStatus.CREATED);

                    // Check object shape and make sure we are not returning something that we want to hide
                    expect(response.body).toHaveProperty('id');
                    delete response.body.id;
                    expect(response.body).toHaveProperty('token');
                    delete response.body.token;
                    expect(response.body).toHaveProperty('state');
                    delete response.body.state;
                    expect(response.body).toHaveProperty('errors');
                    delete response.body.errors;
                    expect(response.body).toHaveProperty('completed_at');
                    delete response.body.completed_at;
                    expect(response.body).toHaveProperty('created_at');
                    delete response.body.created_at;
                    expect(response.body).toHaveProperty('updated_at');
                    delete response.body.updated_at;

                    expect(response.body).toEqual({});
                });
        });
    });

    describe('/challenge/token', () => {
        it('should return challenge by token', async () => {
            const { body: currentChallenge } = await request(
                app.getHttpServer(),
            ).post('/challenge/create');

            await request(app.getHttpServer())
                .get(`/challenge/token/${currentChallenge.token}`)
                .expect((response) => {
                    expect(response.status).toEqual(HttpStatus.OK);

                    // Check object shape and make sure we are not returning something that we want to hide
                    expect(response.body).toHaveProperty('id');
                    delete response.body.id;
                    expect(response.body).toHaveProperty('token');
                    delete response.body.token;
                    expect(response.body).toHaveProperty('state');
                    delete response.body.state;
                    expect(response.body).toHaveProperty('errors');
                    delete response.body.errors;
                    expect(response.body).toHaveProperty('completed_at');
                    delete response.body.completed_at;
                    expect(response.body).toHaveProperty('created_at');
                    delete response.body.created_at;
                    expect(response.body).toHaveProperty('updated_at');
                    delete response.body.updated_at;

                    expect(response.body).toEqual({});
                });
        });

        it('should throw NotFoundException if token does not exist', async () => {
            await request(app.getHttpServer())
                .get('/challenge/token/eef17a88-f659-439b-9f02-59c6d39c789d')
                .expect((response) => {
                    expect(response.status).toEqual(HttpStatus.NOT_FOUND);

                    expect(response.body).toEqual({
                        statusCode: 404,
                        message:
                            'Could not find any entity of type "Challenge" matching: {\n    "token": "eef17a88-f659-439b-9f02-59c6d39c789d"\n}',
                        error: 'Not Found',
                    });
                });
        });

        it('should throw BadRequestException if token is not uuid v4', async () => {
            await request(app.getHttpServer())
                .get('/challenge/token/notuuid')
                .expect((response) => {
                    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);

                    expect(response.body).toEqual({
                        statusCode: 400,
                        message: 'Validation failed (uuid v4 is expected)',
                        error: 'Bad Request',
                    });
                });
        });
    });

    describe('/challenge/verify', () => {
        it('should return success true if response is valid', async () => {
            hCaptchaService.verifyResponse.mockReturnValueOnce(
                of({
                    success: true,
                    challenge_ts: new Date().toString(),
                    hostname: 'what?',
                }),
            );
            const { body: currentChallenge } = await request(
                app.getHttpServer(),
            ).post('/challenge/create');

            await request(app.getHttpServer())
                .patch('/challenge/verify')
                .send({
                    id: currentChallenge.id,
                    response: 'verylegigresponse',
                })
                .expect((response) => {
                    expect(response.status).toEqual(HttpStatus.OK);

                    expect(response.body).toEqual({ success: true });
                });
        });

        it('should return not found', async () => {
            await request(app.getHttpServer())
                .patch('/challenge/verify')
                .send({
                    id: 'd79c3118-e125-4621-9c10-a33bec7d3206',
                    response: 'verylegigresponse',
                })
                .expect((response) => {
                    expect(response.status).toEqual(HttpStatus.NOT_FOUND);

                    expect(response.body).toEqual({
                        statusCode: 404,
                        message:
                            'Could not find any entity of type "Challenge" matching: "d79c3118-e125-4621-9c10-a33bec7d3206"',
                        error: 'Not Found',
                    });
                });
        });

        [
            {
                send: { id: 'shadyid', response: 'verylegigresponse' },
                expectReturnBody: {
                    statusCode: 400,
                    message: { id: ['isUuid'] },
                    error: 'Bad Request',
                },
            },
            {
                send: {
                    id: '90d3b9c8-7092-44e6-a60d-0dd0f8e94e1d',
                    response: false,
                },
                expectReturnBody: {
                    statusCode: 400,
                    message: { response: ['isString'] },
                    error: 'Bad Request',
                },
            },
            {
                send: { response: 'verylegigresponse' },
                expectReturnBody: {
                    statusCode: 400,
                    message: {
                        id: ['isNotEmpty', 'isUuid'],
                    },
                    error: 'Bad Request',
                },
            },
            {
                send: { id: '90d3b9c8-7092-44e6-a60d-0dd0f8e94e1d' },
                expectReturnBody: {
                    statusCode: 400,
                    message: { response: ['isNotEmpty', 'isString'] },
                    error: 'Bad Request',
                },
            },
        ].forEach((e) => {
            it(`should throw BadRequestException if ${JSON.stringify(
                e.send,
            )} is provided`, async () => {
                await request(app.getHttpServer())
                    .patch('/challenge/verify')
                    .send(e.send)
                    .expect((response) => {
                        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);

                        expect(response.body).toEqual(e.expectReturnBody);
                    });
            });
        });

        it('should throw UnprocessableEntityException if challenge already solved', async () => {
            hCaptchaService.verifyResponse.mockReturnValueOnce(
                of({
                    success: true,
                    challenge_ts: new Date().toString(),
                    hostname: 'what?',
                }),
            );
            const { body: currentChallenge } = await request(
                app.getHttpServer(),
            ).post('/challenge/create');

            await request(app.getHttpServer()).patch('/challenge/verify').send({
                id: currentChallenge.id,
                response: 'verylegigresponse',
            });

            await request(app.getHttpServer())
                .patch('/challenge/verify')
                .send({
                    id: currentChallenge.id,
                    response: 'verylegigresponse',
                })
                .expect((response) => {
                    expect(response.status).toEqual(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                    );

                    expect(response.body).toEqual({
                        statusCode: 422,
                        message: 'Challenge was already verified',
                        error: 'Unprocessable Entity',
                    });
                });
        });

        it('should throw UnprocessableEntityException if challenge already failed', async () => {
            hCaptchaService.verifyResponse.mockReturnValueOnce(
                of({
                    success: false,
                    challenge_ts: new Date().toString(),
                    hostname: 'what?',
                    'error-codes': [HCaptchaErrorCodes.INVALID_INPUT_RESPONSE],
                }),
            );
            const { body: currentChallenge } = await request(
                app.getHttpServer(),
            ).post('/challenge/create');

            await request(app.getHttpServer()).patch('/challenge/verify').send({
                id: currentChallenge.id,
                response: 'verylegigresponse',
            });

            await request(app.getHttpServer())
                .patch('/challenge/verify')
                .send({
                    id: currentChallenge.id,
                    response: 'verylegigresponse',
                })
                .expect((response) => {
                    expect(response.status).toEqual(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                    );

                    expect(response.body).toEqual({
                        statusCode: 422,
                        message: 'Challenge was already verified',
                        error: 'Unprocessable Entity',
                    });
                });
        });

        [
            HCaptchaErrorCodes.INVALID_INPUT_RESPONSE,
            HCaptchaErrorCodes.INVALID_OR_ALREADY_SEEN_RESPONSE,
        ].forEach((e) => {
            it(`should return success false if ${e} occurred`, async () => {
                hCaptchaService.verifyResponse.mockReturnValueOnce(
                    of({
                        success: false,
                        challenge_ts: new Date().toString(),
                        hostname: 'what?',
                        'error-codes': [e],
                    }),
                );
                const { body: currentChallenge } = await request(
                    app.getHttpServer(),
                ).post('/challenge/create');

                await request(app.getHttpServer())
                    .patch('/challenge/verify')
                    .send({
                        id: currentChallenge.id,
                        response: 'verylegigresponse',
                    })
                    .expect((response) => {
                        expect(response.status).toEqual(HttpStatus.OK);

                        expect(response.body).toEqual({ success: false });
                    });
            });
        });

        [
            HCaptchaErrorCodes.BAD_REQUEST,
            HCaptchaErrorCodes.INVALID_INPUT_SECRET,
            HCaptchaErrorCodes.MISSING_INPUT_RESPONSE,
            HCaptchaErrorCodes.MISSING_INPUT_SECRET,
            HCaptchaErrorCodes.NOT_USING_DUMMY_PASSCODE,
            HCaptchaErrorCodes.SITEKEY_SECRET_MISMATCH,
        ].forEach((e) => {
            it(`should throw InternalServerErrorException if ${e} occurred`, async () => {
                hCaptchaService.verifyResponse.mockReturnValueOnce(
                    of({
                        success: false,
                        challenge_ts: new Date().toString(),
                        hostname: 'what?',
                        'error-codes': [e],
                    }),
                );
                const { body: currentChallenge } = await request(
                    app.getHttpServer(),
                ).post('/challenge/create');

                await request(app.getHttpServer())
                    .patch('/challenge/verify')
                    .send({
                        id: currentChallenge.id,
                        response: 'verylegigresponse',
                    })
                    .expect((response) => {
                        expect(response.status).toEqual(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                        );

                        expect(response.body).toEqual({
                            statusCode: 500,
                            message: 'Internal Server Error',
                        });
                    });
            });
        });
    });
});
