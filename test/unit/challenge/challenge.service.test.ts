import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from 'jest-mock-extended';
import { of } from 'rxjs';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Challenge } from '../../../src/challenge/challenge.entity';
import { ChallengeService } from '../../../src/challenge/challenge.service';
import { ChallengeState } from '../../../src/challenge/enums/challenge-status.enum';
import { ChallengeAlreadyVerifiedException } from '../../../src/challenge/exceptions/challenge-already-verified.exception';
import { ChallengeVerificationErroredException } from '../../../src/challenge/exceptions/challenge-verification-errored.exceptio';
import { HCaptchaErrorCodes } from '../../../src/h-captcha/enums/h-captcha-error-codes.enum';
import { HCaptchaService } from '../../../src/h-captcha/h-captcha.service';

const challengeMock = new Challenge();
challengeMock.id = '5568e476-3431-4f29-bfd6-fca460d0c971';
challengeMock.token = '520eefcb7-71aa-4782-a25b-913aa7cd02ef';
challengeMock.credited = false;
challengeMock.state = ChallengeState.PENDING;
challengeMock.errors = [];
challengeMock.completed_at = null;
challengeMock.created_at = new Date();
challengeMock.updated_at = new Date();

describe('ChallengeService', () => {
    let challengeService: ChallengeService;
    const challengeRepository = mock<Repository<Challenge>>();
    const hCaptchaService = mock<HCaptchaService>();

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ChallengeService,
                {
                    provide: getRepositoryToken(Challenge),
                    useValue: challengeRepository,
                },
                {
                    provide: HCaptchaService,
                    useValue: hCaptchaService,
                },
            ],
        }).compile();

        challengeService = module.get(ChallengeService);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('createNewChallenge', () => {
        it('should create a new challenge', async () => {
            challengeRepository.save.mockResolvedValue(challengeMock);

            const result = await challengeService.createNewChallenge();
            expect(challengeRepository.save).toHaveBeenCalled();
            expect(result).toEqual(challengeMock);
        });
    });

    describe('createNewChallenge', () => {
        it('should return a challenge by token', async () => {
            challengeRepository.findOne.mockResolvedValue(challengeMock);

            const result = await challengeService.getChallengeByToken(
                '520eefcb7-71aa-4782-a25b-913aa7cd02ef',
            );
            expect(challengeRepository.findOne).toHaveBeenCalled();
            expect(result).toEqual(challengeMock);
        });

        it('should throw EntityNotFoundError if challenge not found', async () => {
            challengeRepository.findOne.mockResolvedValue(undefined);

            await expect(
                challengeService.getChallengeByToken(
                    '520eefcb7-71aa-4782-a25b-913aa7cd02ef',
                ),
            ).rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('verifyChallenge', () => {
        it('should verify challenge', async () => {
            const challenge_ts = new Date().toString();
            challengeRepository.findOne.mockResolvedValue(challengeMock);
            hCaptchaService.verifyResponse.mockReturnValue(
                of({
                    success: true,
                    challenge_ts,
                    hostname: 'what?',
                }),
            );

            const result = await challengeService.verifyChallenge(
                {
                    id: '5562s476-3431-4f29-bfd6-fca460d0c971',
                    response: '20000000-aaaa-bbbb-cccc-000000000002',
                },
                '127.0.0.1',
            );
            expect(challengeRepository.findOne).toHaveBeenCalledWith(
                '5562s476-3431-4f29-bfd6-fca460d0c971',
            );
            expect(challengeRepository.update).toHaveBeenLastCalledWith(
                '5562s476-3431-4f29-bfd6-fca460d0c971',
                {
                    completed_at: challenge_ts,
                    state: ChallengeState.SOLVED,
                    credited: false,
                },
            );
            expect(result).toEqual({ success: true });
        });

        it('should verify challenge and credit', async () => {
            const challenge_ts = new Date().toString();
            challengeRepository.findOne.mockResolvedValue(challengeMock);
            hCaptchaService.verifyResponse.mockReturnValue(
                of({
                    success: true,
                    challenge_ts,
                    hostname: 'what?',
                    credit: true,
                }),
            );

            const result = await challengeService.verifyChallenge(
                {
                    id: '5562s476-3431-4f29-bfd6-fca460d0c971',
                    response: '20000000-aaaa-bbbb-cccc-000000000002',
                },
                '127.0.0.1',
            );
            expect(challengeRepository.findOne).toHaveBeenCalledWith(
                '5562s476-3431-4f29-bfd6-fca460d0c971',
            );
            expect(challengeRepository.update).toHaveBeenLastCalledWith(
                '5562s476-3431-4f29-bfd6-fca460d0c971',
                {
                    completed_at: challenge_ts,
                    state: ChallengeState.SOLVED,
                    credited: true,
                },
            );
            expect(result).toEqual({ success: true });
        });

        it(`should verify challenge and fail if ${HCaptchaErrorCodes.INVALID_INPUT_RESPONSE} appears`, async () => {
            const challenge_ts = new Date().toString();
            challengeRepository.findOne.mockResolvedValue(challengeMock);
            hCaptchaService.verifyResponse.mockReturnValue(
                of({
                    success: false,
                    challenge_ts,
                    hostname: 'what?',
                    'error-codes': [HCaptchaErrorCodes.INVALID_INPUT_RESPONSE],
                }),
            );

            const result = await challengeService.verifyChallenge(
                {
                    id: '5562s476-3431-4f29-bfd6-fca460d0c971',
                    response: '20000000-aaaa-bbbb-cccc-000000000002',
                },
                '127.0.0.1',
            );
            expect(challengeRepository.findOne).toHaveBeenCalledWith(
                '5562s476-3431-4f29-bfd6-fca460d0c971',
            );
            expect(challengeRepository.update).toHaveBeenLastCalledWith(
                '5562s476-3431-4f29-bfd6-fca460d0c971',
                {
                    errors: [HCaptchaErrorCodes.INVALID_INPUT_RESPONSE],
                    state: ChallengeState.FAILED,
                },
            );
            expect(result).toEqual({ success: false });
        });

        it(`should verify challenge and fail if ${HCaptchaErrorCodes.INVALID_OR_ALREADY_SEEN_RESPONSE} occurred`, async () => {
            const challenge_ts = new Date().toString();
            challengeRepository.findOne.mockResolvedValue(challengeMock);
            hCaptchaService.verifyResponse.mockReturnValue(
                of({
                    success: false,
                    challenge_ts,
                    hostname: 'what?',
                    'error-codes': [
                        HCaptchaErrorCodes.INVALID_OR_ALREADY_SEEN_RESPONSE,
                    ],
                }),
            );

            const result = await challengeService.verifyChallenge(
                {
                    id: '5562s476-3431-4f29-bfd6-fca460d0c971',
                    response: '20000000-aaaa-bbbb-cccc-000000000002',
                },
                '127.0.0.1',
            );
            expect(challengeRepository.findOne).toHaveBeenCalledWith(
                '5562s476-3431-4f29-bfd6-fca460d0c971',
            );
            expect(challengeRepository.update).toHaveBeenLastCalledWith(
                '5562s476-3431-4f29-bfd6-fca460d0c971',
                {
                    errors: [
                        HCaptchaErrorCodes.INVALID_OR_ALREADY_SEEN_RESPONSE,
                    ],
                    state: ChallengeState.FAILED,
                },
            );
            expect(result).toEqual({ success: false });
        });

        [
            HCaptchaErrorCodes.BAD_REQUEST,
            HCaptchaErrorCodes.INVALID_INPUT_SECRET,
            HCaptchaErrorCodes.MISSING_INPUT_RESPONSE,
            HCaptchaErrorCodes.MISSING_INPUT_SECRET,
            HCaptchaErrorCodes.NOT_USING_DUMMY_PASSCODE,
            HCaptchaErrorCodes.SITEKEY_SECRET_MISMATCH,
        ].forEach((e) => {
            it(`should verify challenge and fail if ${e} occurred`, async () => {
                const challenge_ts = new Date().toString();
                challengeRepository.findOne.mockResolvedValue(challengeMock);
                hCaptchaService.verifyResponse.mockReturnValue(
                    of({
                        success: false,
                        challenge_ts,
                        hostname: 'what?',
                        'error-codes': [e],
                    }),
                );

                await expect(
                    challengeService.verifyChallenge(
                        {
                            id: '5562s476-3431-4f29-bfd6-fca460d0c971',
                            response: '20000000-aaaa-bbbb-cccc-000000000002',
                        },
                        '127.0.0.1',
                    ),
                ).rejects.toThrow(ChallengeVerificationErroredException);
                expect(challengeRepository.findOne).toHaveBeenCalledWith(
                    '5562s476-3431-4f29-bfd6-fca460d0c971',
                );
                expect(challengeRepository.update).toHaveBeenLastCalledWith(
                    '5562s476-3431-4f29-bfd6-fca460d0c971',
                    {
                        errors: [e],
                        state: ChallengeState.FAILED,
                    },
                );
            });
        });

        it('should throw EntityNotFoundError if challenge not found', async () => {
            challengeRepository.findOne.mockResolvedValue(undefined);

            await expect(
                challengeService.verifyChallenge(
                    {
                        id: '5562s476-3431-4f29-bfd6-fca460d0c971',
                        response: '20000000-aaaa-bbbb-cccc-000000000002',
                    },
                    '127.0.0.1',
                ),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should throw ChallengeAlreadyVerifiedException if challenge already solved', async () => {
            challengeRepository.findOne.mockResolvedValue({
                ...challengeMock,
                state: ChallengeState.SOLVED,
            });

            await expect(
                challengeService.verifyChallenge(
                    {
                        id: '5562s476-3431-4f29-bfd6-fca460d0c971',
                        response: '20000000-aaaa-bbbb-cccc-000000000002',
                    },
                    '127.0.0.1',
                ),
            ).rejects.toThrow(ChallengeAlreadyVerifiedException);
        });

        it('should throw ChallengeAlreadyVerifiedException if challenge already failed', async () => {
            challengeRepository.findOne.mockResolvedValue({
                ...challengeMock,
                state: ChallengeState.FAILED,
            });

            await expect(
                challengeService.verifyChallenge(
                    {
                        id: '5562s476-3431-4f29-bfd6-fca460d0c971',
                        response: '20000000-aaaa-bbbb-cccc-000000000002',
                    },
                    '127.0.0.1',
                ),
            ).rejects.toThrow(ChallengeAlreadyVerifiedException);
        });
    });
});
