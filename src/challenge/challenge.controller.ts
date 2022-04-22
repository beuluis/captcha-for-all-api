import {
    Body,
    ClassSerializerInterceptor,
    Get,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UnprocessableEntityException,
    UseInterceptors,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { EntityNotFoundError } from 'typeorm';
import { Challenge } from './challenge.entity';
import { ChallengeService } from './challenge.service';
import { VerifyChallengeRequestDto } from './dtos/verify-challenge-request.dto';
import { VerifyChallengeResponseDto } from './dtos/verify-challenge-response.dto';
import { ChallengeAlreadyVerifiedException } from './exceptions/challenge-already-verified.exception';
import { GetIP } from '../decorators/get-ip.decorator';
import { ValidationApiException } from '../decorators/validation-api-exception.decorator';
import { BaseController } from '../decorators/base-controller.decorator';

// TODO: return error if time is up. Will implement later
@BaseController('challenge', 'Challenge')
export class ChallengeController {
    private readonly logger = new Logger(ChallengeController.name);

    constructor(private challengeService: ChallengeService) {}

    @Post('create')
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({ summary: 'Creates a new challenge' })
    @ApiCreatedResponse({
        description: 'A new challenge was successfully created',
        type: Challenge,
    })
    async postNewChallenge(): Promise<Challenge> {
        try {
            return await this.challengeService.createNewChallenge();
        } catch (e: unknown) {
            throw new InternalServerErrorException();
        }
    }

    @Get('token/:token')
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({ summary: 'Gets a challenge by its token' })
    @ApiResponse({
        status: 200,
        type: Challenge,
    })
    @ApiException(() => NotFoundException, {
        description: 'Challenge was not found',
    })
    @ValidationApiException()
    async getChallengeByToken(
        @Param('token', new ParseUUIDPipe({ version: '4' })) token: string,
    ): Promise<Challenge> {
        try {
            return await this.challengeService.getChallengeByToken(token);
        } catch (e: unknown) {
            if (e instanceof EntityNotFoundError) {
                throw new NotFoundException(e.message);
            }

            throw new InternalServerErrorException();
        }
    }

    @Patch('verify')
    @ApiOperation({ summary: 'Verifies a response and solves the challenge' })
    @ValidationApiException()
    @ApiException(() => NotFoundException, {
        description: 'Challenge was not found',
    })
    @ApiException(() => UnprocessableEntityException, {
        description: 'Challenge was already verified',
    })
    async patchVerifyChallenge(
        @Body() verifyChallengeDto: VerifyChallengeRequestDto,
        @GetIP() ip: string,
    ): Promise<VerifyChallengeResponseDto> {
        try {
            return await this.challengeService.verifyChallenge(
                verifyChallengeDto,
                ip,
            );
        } catch (e: unknown) {
            if (e instanceof EntityNotFoundError) {
                throw new NotFoundException(e.message);
            } else if (e instanceof ChallengeAlreadyVerifiedException) {
                throw new UnprocessableEntityException(e.message);
            }

            throw new InternalServerErrorException();
        }
    }
}
