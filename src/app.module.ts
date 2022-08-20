import { Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ChallengeModule } from './challenge/challenge.module';
import { OrmConfigService } from './orm-config/orm-config.service';
import { Challenge } from './challenge/challenge.entity';

@Module({})
export class AppModule {
    static register(testing = false) {
        const imports: ModuleMetadata['imports'] = [
            ThrottlerModule.forRoot({
                ttl: 60,
                limit: 10,
            }),
            ConfigModule.forRoot({
                ignoreEnvFile: true,
                isGlobal: true,
            }),
            ...(testing
                ? [
                      TypeOrmModule.forRoot({
                          type: 'postgres',
                          host: 'localhost',
                          username: 'test',
                          password: 'test',
                          database: 'test',
                          synchronize: true,
                          entities: [Challenge],
                      }),
                  ]
                : [
                      TypeOrmModule.forRootAsync({
                          useClass: OrmConfigService,
                          inject: [OrmConfigService],
                      }),
                  ]),
            ChallengeModule,
        ];
        return {
            module: AppModule,
            imports,
        };
    }
}
