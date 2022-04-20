import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map, Observable } from 'rxjs';
import { HCaptchaResponse } from './interfaces/h-captcha-response.interface';

@Injectable()
export class HCaptchaService {
    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
    ) {}

    verifyResponse(
        response: string,
        remoteip?: string,
    ): Observable<HCaptchaResponse> {
        const hCaptchaResponse = this.httpService
            .post<HCaptchaResponse>(
                this.configService.get<string>(
                    'CAPTCHA_HOST',
                    'https://hcaptcha.com/siteverify',
                ),
                new URLSearchParams({
                    secret: this.configService.get<string>('CAPTCHA_SECRET'),
                    response,
                    remoteip,
                    sitekey: this.configService.get<string>('CAPTCHA_SITEKEY'),
                }),
            )
            .pipe(
                map((response) => {
                    return response.data;
                }),
            );

        return hCaptchaResponse;
    }
}
