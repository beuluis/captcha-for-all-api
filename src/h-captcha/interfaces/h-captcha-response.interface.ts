import { HCaptchaErrorCodes } from '../enums/h-captcha-error-codes.enum';

export interface HCaptchaResponse {
    success: boolean;
    challenge_ts: string;
    hostname: string;
    credit?: boolean;
    'error-codes'?: HCaptchaErrorCodes[];
}
