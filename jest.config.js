module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    testRegex: '\\.(component-)?test\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.ts'],
    coveragePathIgnorePatterns: [
        'src/main.ts',
        'src/app.module.ts',
        'src/challenge/dtos',
    ],
    testEnvironment: 'node',
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
        },
    },
};
