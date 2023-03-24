/* eslint-disable */
export default {
  displayName: 'customer-portal-invoices-data-access-invoices',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
    },
  },
  coverageDirectory:
    '../../../../coverage/libs/customer-portal/invoices/data-access-invoices',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory:
          'reports/libs/customer-portal/invoices/data-access-invoices',
        outputName: `test-${Date.now()}.xml`,
      },
    ],
  ],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': 'jest-preset-angular',
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
