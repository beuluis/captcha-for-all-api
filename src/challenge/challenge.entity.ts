import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    UpdateDateColumn,
    CreateDateColumn,
    Unique,
} from 'typeorm';
import { ChallengeState } from './enums/challenge-status.enum';
import { HCaptchaErrorCodes } from '../h-captcha/enums/h-captcha-error-codes.enum';

// TODO: migrations. Will introduce if needed
@Entity()
@Unique(['id', 'token'])
export class Challenge {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({ example: '5568e476-3431-4f29-bfd6-fca460d0c971' })
    id: string;

    @Column()
    @Generated('uuid')
    @ApiProperty({ example: 'b6e8daf6-9b4d-4ddb-8e88-0c62821c1243' })
    token: string;

    @Column({ default: false })
    @Exclude()
    @ApiHideProperty()
    credited: boolean;

    @Column({ default: ChallengeState.PENDING })
    @ApiProperty({ example: ChallengeState.PENDING })
    state: ChallengeState;

    @Column('text', { array: true, default: [] })
    @ApiProperty({
        enum: HCaptchaErrorCodes,
        isArray: true,
        example: [
            HCaptchaErrorCodes.BAD_REQUEST,
            HCaptchaErrorCodes.INVALID_INPUT_RESPONSE,
            HCaptchaErrorCodes.INVALID_INPUT_RESPONSE,
            HCaptchaErrorCodes.INVALID_OR_ALREADY_SEEN_RESPONSE,
            HCaptchaErrorCodes.MISSING_INPUT_RESPONSE,
            HCaptchaErrorCodes.MISSING_INPUT_SECRET,
            HCaptchaErrorCodes.NOT_USING_DUMMY_PASSCODE,
            HCaptchaErrorCodes.SITEKEY_SECRET_MISMATCH,
        ],
    })
    errors: HCaptchaErrorCodes[];

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    completed_at?: Date;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
    })
    updated_at: Date;
}
