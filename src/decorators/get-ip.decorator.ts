import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export const GetIP = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest<FastifyRequest>();
        const { headers } = req;

        if (
            headers['x-forwarded-for'] &&
            typeof headers['x-forwarded-for'] === 'string'
        ) {
            return headers['x-forwarded-for'].split(',')[0];
        }

        return req.ip;
    },
);
