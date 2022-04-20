import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { lastValueFrom } from 'rxjs';
import { Challenge } from './challenge.entity';
import { ChallengeState } from './enums/challenge-status.enum';
import { VerifyChallengeRequestDto } from './dtos/verify-challenge-request.dto';
import { ChallengeAlreadyVerifiedException } from './exceptions/challenge-already-verified.exception';
import { ChallengeVerificationErroredException } from './exceptions/challenge-verification-errored.exceptio';
import { VerifyChallengeResponseDto } from './dtos/verify-challenge-response.dto';
import { HCaptchaService } from '../h-captcha/h-captcha.service';
import { HCaptchaErrorCodes } from '../h-captcha/enums/h-captcha-error-codes.enum';

@Injectable()
export class ChallengeService {
    constructor(
        private readonly hCaptchaService: HCaptchaService,
        @InjectRepository(Challenge)
        private challengeRepository: Repository<Challenge>,
    ) {}

    async createNewChallenge(): Promise<Challenge> {
        return this.challengeRepository.save(new Challenge());
    }

    async getChallengeByToken(token: string): Promise<Challenge> {
        const challenge = await this.challengeRepository.findOne({ token });

        if (!challenge) {
            throw new EntityNotFoundError(Challenge, { token });
        }

        return challenge;
    }

    async verifyChallenge(
        verifyChallengeDto: VerifyChallengeRequestDto,
        requestip: string,
    ): Promise<VerifyChallengeResponseDto> {
        const challenge = await this.challengeRepository.findOne(
            verifyChallengeDto.id,
        );

        if (!challenge) {
            throw new EntityNotFoundError(Challenge, verifyChallengeDto.id);
        }

        if (
            challenge.state === ChallengeState.SOLVED ||
            challenge.state === ChallengeState.FAILED
        ) {
            throw new ChallengeAlreadyVerifiedException(
                'Challenge was already verified',
            );
        }

        const hCaptchaResponse = await lastValueFrom(
            this.hCaptchaService.verifyResponse(
                verifyChallengeDto.response,
                requestip,
            ),
        );

        if (hCaptchaResponse.success) {
            this.challengeRepository.update(verifyChallengeDto.id, {
                completed_at: hCaptchaResponse.challenge_ts,
                state: ChallengeState.SOLVED,
                credited: hCaptchaResponse.credit || false,
            });

            return { success: true };
        }

        if (hCaptchaResponse['error-codes']) {
            this.challengeRepository.update(verifyChallengeDto.id, {
                errors: hCaptchaResponse['error-codes'],
                state: ChallengeState.FAILED,
            });
        }

        // All error codes considered as not retirable
        const failedChallengeCodes = [
            HCaptchaErrorCodes.INVALID_INPUT_RESPONSE,
            HCaptchaErrorCodes.INVALID_OR_ALREADY_SEEN_RESPONSE,
        ];
        if (
            hCaptchaResponse['error-codes'].some((e) =>
                failedChallengeCodes.includes(e),
            )
        ) {
            return { success: false };
        }

        throw new ChallengeVerificationErroredException();
    }
}
