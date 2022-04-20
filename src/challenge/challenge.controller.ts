import {
    BadRequestException,
    Body,
    ClassSerializerInterceptor,
    Controller,
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
import {
    ApiCreatedResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Challenge } from './challenge.entity';
import { ChallengeService } from './challenge.service';
import { VerifyChallengeRequestDto } from './dtos/verify-challenge-request.dto';
import { VerifyChallengeResponseDto } from './dtos/verify-challenge-response.dto';
import { GetIP } from '../decorators/get-ip.decorator';

// TODO: return error if time is up. Will implement later
@Controller('challenge')
@ApiException(() => InternalServerErrorException, {
    description: 'Unknown error',
})
@ApiTags('Challenge')
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
        return this.challengeService.createNewChallenge();
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
    @ApiException(() => BadRequestException, {
        description: 'Validation failed',
    })
    async getChallengeByToken(
        @Param('token', new ParseUUIDPipe({ version: '4' })) token: string,
    ): Promise<Challenge> {
        return this.challengeService.getChallengeByToken(token);
    }

    @Patch('verify')
    @ApiOperation({ summary: 'Verifies a response and solves the challenge' })
    @ApiException(() => BadRequestException, {
        description: 'Validation failed',
    })
    @ApiException(() => UnprocessableEntityException, {
        description: 'Challenge was already verified',
    })
    async patchVerifyChallenge(
        @Body() verifyChallengeDto: VerifyChallengeRequestDto,
        @GetIP() ip: string,
    ): Promise<VerifyChallengeResponseDto> {
        return this.challengeService.verifyChallenge(verifyChallengeDto, ip);
    }
}
