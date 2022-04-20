import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeController } from './challenge.controller';
import { Challenge } from './challenge.entity';
import { ChallengeService } from './challenge.service';
import { HCaptchaModule } from '../h-captcha/h-captcha.module';

@Module({
    imports: [TypeOrmModule.forFeature([Challenge]), HCaptchaModule],
    providers: [ChallengeService],
    controllers: [ChallengeController],
})
export class ChallengeModule {}
