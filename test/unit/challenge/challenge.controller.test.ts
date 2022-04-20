import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { ChallengeController } from '../../../src/challenge/challenge.controller';
import { Challenge } from '../../../src/challenge/challenge.entity';
import { ChallengeService } from '../../../src/challenge/challenge.service';

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
    });
});
