import { HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { lastValueFrom, of } from 'rxjs';
import { Challenge } from '../../../src/challenge/challenge.entity';
import { ChallengeState } from '../../../src/challenge/enums/challenge-status.enum';
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

describe('HCaptchaService', () => {
    let hCaptchaService: HCaptchaService;
    const httpService = mock<HttpService>();

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [ConfigModule],
            providers: [
                HCaptchaService,
                {
                    provide: HttpService,
                    useValue: httpService,
                },
            ],
        }).compile();

        hCaptchaService = module.get(HCaptchaService);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('verifyResponse', () => {
        it('should verify a response', async () => {
            process.env.CAPTCHA_SECRET = 'secret';
            process.env.CAPTCHA_SITEKEY = 'key';
            const data = {
                success: true,
                challenge_ts: new Date().toString(),
                hostname: 'what?',
            };

            httpService.post.mockReturnValue(
                of({
                    status: 200,
                    statusText: 'OK',
                    config: {},
                    headers: {},
                    data,
                }),
            );

            const result = await hCaptchaService.verifyResponse(
                '20000000-aaaa-bbbb-cccc-000000000002',
                '127.0.0.1',
            );
            expect(httpService.post).toHaveBeenCalledWith(
                'https://hcaptcha.com/siteverify',
                new URLSearchParams({
                    secret: 'secret',
                    response: '20000000-aaaa-bbbb-cccc-000000000002',
                    remoteip: '127.0.0.1',
                    sitekey: 'key',
                }),
            );
            expect(await lastValueFrom(result)).toEqual(data);
        });
    });
});
