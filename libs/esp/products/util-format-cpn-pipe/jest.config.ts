/* eslint-disable */
export default {
  displayName: 'esp-products-util-format-cpn-pipe',
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
    '../../../../coverage/libs/esp/products/util-format-cpn-pipe',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports/libs/esp/products/util-format-cpn-pipe',
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
