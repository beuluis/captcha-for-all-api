import {
    InternalServerErrorException,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { EntityNotFoundError } from 'typeorm';
import { ChallengeController } from '../../../src/challenge/challenge.controller';
import { Challenge } from '../../../src/challenge/challenge.entity';
import { ChallengeService } from '../../../src/challenge/challenge.service';
import { ChallengeAlreadyVerifiedException } from '../../../src/challenge/exceptions/challenge-already-verified.exception';

describe('ChallengeController', () => {
    let challengeController: ChallengeController;
    const challengeServiceMock = mock<ChallengeService>();

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [ChallengeController],
            providers: [
                {
                    provide: ChallengeService,
                    useValue: challengeServiceMock,
                },
            ],
        }).compile();

        challengeController =
            module.get<ChallengeController>(ChallengeController);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('createNewChallenge', () => {
        it('should call createNewChallenge method from challenge service', async () => {
            challengeServiceMock.createNewChallenge.mockResolvedValue(
                new Challenge(),
            );

            await challengeController.postNewChallenge();

            expect(challengeServiceMock.createNewChallenge).toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException', async () => {
            challengeServiceMock.createNewChallenge.mockRejectedValue(
                new Error(),
            );

            await expect(
                challengeController.postNewChallenge(),
            ).rejects.toThrow(InternalServerErrorException);

            expect(
                challengeServiceMock.createNewChallenge,
            ).toHaveBeenCalledWith();
        });
    });

    describe('getChallengeByToken', () => {
        it('should call getChallengeByToken method from challenge service', async () => {
            challengeServiceMock.getChallengeByToken.mockResolvedValue(
                new Challenge(),
            );

            await challengeController.getChallengeByToken(
                '5568e476-3431-4f29-bfd6-fca460d0c971',
            );

            expect(
                challengeServiceMock.getChallengeByToken,
            ).toHaveBeenCalledWith('5568e476-3431-4f29-bfd6-fca460d0c971');
        });

        it('should throw NotFoundException', async () => {
            challengeServiceMock.getChallengeByToken.mockRejectedValue(
                new EntityNotFoundError(Challenge, {
                    token: '5568e476-3431-4f29-bfd6-fca460d0c971',
                }),
            );

            await expect(
                challengeController.getChallengeByToken(
                    '5568e476-3431-4f29-bfd6-fca460d0c971',
                ),
            ).rejects.toThrow(NotFoundException);

            expect(
                challengeServiceMock.getChallengeByToken,
            ).toHaveBeenCalledWith('5568e476-3431-4f29-bfd6-fca460d0c971');
        });

        it('should throw InternalServerErrorException', async () => {
            challengeServiceMock.getChallengeByToken.mockRejectedValue(
                new Error(),
            );

            await expect(
                challengeController.getChallengeByToken(
                    '5568e476-3431-4f29-bfd6-fca460d0c971',
                ),
            ).rejects.toThrow(InternalServerErrorException);

            expect(
                challengeServiceMock.getChallengeByToken,
            ).toHaveBeenCalledWith('5568e476-3431-4f29-bfd6-fca460d0c971');
        });
    });

    describe('patchVerifyChallenge', () => {
        it('should call verifyChallenge method from challenge service', async () => {
            challengeServiceMock.verifyChallenge.mockResolvedValue({
                success: true,
            });

            await challengeController.patchVerifyChallenge(
                {
                    id: '5562s476-3431-4f29-bfd6-fca460d0c971',
                    response: '20000000-aaaa-bbbb-cccc-000000000002',
                },
                '127.0.0.1',
            );

            expect(challengeServiceMock.verifyChallenge).toHaveBeenCalledWith(
                {
                    id: '5562s476-3431-4f29-bfd6-fca460d0c971',
                    response: '20000000-aaaa-bbbb-cccc-000000000002',
                },
                '127.0.0.1',
            );
        });

        it('should throw NotFoundException', async () => {
            challengeServiceMock.verifyChallenge.mockRejectedValue(
                new EntityNotFoundError(Challenge, {
                    id: '5562s476-3431-4f29-bfd6-fca460d0c971',
                }),
            );

            await expect(
                challengeController.patchVerifyChallenge(
                    {
                        id: '5562s476-3431-4f29-bfd6-fca460d0c97',
                        response: '10000000-aaaa-bbbb-cccc-000000000001',
                    },
                    '127.0.0.1',
                ),
            ).rejects.toThrow(NotFoundException);

            expect(challengeServiceMock.verifyChallenge).toHaveBeenCalledWith(
                {
                    id: '5562s476-3431-4f29-bfd6-fca460d0c97',
                    response: '10000000-aaaa-bbbb-cccc-000000000001',
                },
                '127.0.0.1',
            );
        });

        it('should throw UnprocessableEntityException', async () => {
            challengeServiceMock.verifyChallenge.mockRejectedValue(
                new ChallengeAlreadyVerifiedException(),
            );

            await expect(
                challengeController.patchVerifyChallenge(
                    {
                        id: '5562s476-3431-4f29-bfd6-fca460d0c97',
                        response: '10000000-aaaa-bbbb-cccc-000000000001',
                    },
                    '127.0.0.1',
                ),
            ).rejects.toThrow(UnprocessableEntityException);

            expect(challengeServiceMock.verifyChallenge).toHaveBeenCalledWith(
                {
                    id: '5562s476-3431-4f29-bfd6-fca460d0c97',
                    response: '10000000-aaaa-bbbb-cccc-000000000001',
                },
                '127.0.0.1',
            );
        });

        it('should throw UnprocessableEntityException', async () => {
            challengeServiceMock.verifyChallenge.mockRejectedValue(new Error());

            await expect(
                challengeController.patchVerifyChallenge(
                    {
                        id: '5562s476-3431-4f29-bfd6-fca460d0c97',
                        response: '10000000-aaaa-bbbb-cccc-000000000001',
                    },
                    '127.0.0.1',
                ),
            ).rejects.toThrow(InternalServerErrorException);

            expect(challengeServiceMock.verifyChallenge).toHaveBeenCalledWith(
                {
                    id: '5562s476-3431-4f29-bfd6-fca460d0c97',
                    response: '10000000-aaaa-bbbb-cccc-000000000001',
                },
                '127.0.0.1',
            );
        });
    });
});
