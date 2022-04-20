import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

// eslint-disable-next-line @typescript-eslint/ban-types
export const getParamDecoratorFactory = (decorator: Function) => {
    class Test {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
        public test(@decorator() value) {}
    }

    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
    return args[Object.keys(args)[0]].factory;
};
