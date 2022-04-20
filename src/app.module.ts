import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ChallengeModule } from './challenge/challenge.module';
import { OrmConfigService } from './orm-config/orm-config.service';

@Module({
    imports: [
        ThrottlerModule.forRoot({
            ttl: 60,
            limit: 10,
        }),
        ConfigModule.forRoot({
            ignoreEnvFile: true,
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            useClass: OrmConfigService,
            inject: [OrmConfigService],
        }),
        ChallengeModule,
    ],
})
export class AppModule {}
