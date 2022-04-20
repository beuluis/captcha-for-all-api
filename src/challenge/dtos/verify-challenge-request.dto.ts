import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyChallengeRequestDto {
    @IsUUID()
    @IsNotEmpty()
    @ApiProperty({
        example: '5568e476-3431-4f29-bfd6-fca460d0c971',
    })
    id: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '20000000-aaaa-bbbb-cccc-000000000002',
    })
    response: string;
}
