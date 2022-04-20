import { ApiProperty } from '@nestjs/swagger';

export class VerifyChallengeResponseDto {
    @ApiProperty({
        example: 'true',
    })
    success: boolean;
}
