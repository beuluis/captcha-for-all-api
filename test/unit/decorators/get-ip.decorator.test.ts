import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import mock from 'jest-mock-extended/lib/Mock';
import { GetIP } from '../../../src/decorators/get-ip.decorator';
import { getParamDecoratorFactory } from '../../helpers/get-param-decorator-factory';

describe('GlobalExceptionFilter', () => {
    const mockCtx = mock<ExecutionContext>();
    const mockHttp = mock<HttpArgumentsHost>();
    mockCtx.switchToHttp.mockReturnValue(mockHttp);

    it('should return ip from request if no headers are set', () => {
        mockHttp.getRequest.mockReturnValueOnce({
            ip: '127.0.0.1',
            headers: {},
        });

        const factory = getParamDecoratorFactory(GetIP);
        const result = factory(null, mockCtx);

        expect(result).toEqual('127.0.0.1');
    });

    it('should return x-forwarded-for from headers', () => {
        mockHttp.getRequest.mockReturnValueOnce({
            ip: '127.0.0.1',
            headers: { 'x-forwarded-for': '192.168.1.1,192.168.1.2' },
        });

        const factory = getParamDecoratorFactory(GetIP);
        const result = factory(null, mockCtx);

        expect(result).toEqual('192.168.1.1');
    });

    it('should return ip from request if x-forwarded-for is not a string', () => {
        mockHttp.getRequest.mockReturnValueOnce({
            ip: '127.0.0.1',
            headers: { 'x-forwarded-for': true },
        });

        const factory = getParamDecoratorFactory(GetIP);
        const result = factory(null, mockCtx);

        expect(result).toEqual('127.0.0.1');
    });
});
