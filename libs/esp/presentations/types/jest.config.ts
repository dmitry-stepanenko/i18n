/* eslint-disable */
export default {
  displayName: 'esp-presentations-types',
  preset: '../../../../jest.preset.js',
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  reporters: [
    'default',
    // [
    //   'jest-junit',
    //   {
    //     outputDirectory: 'reports/libs/esp/presentations/types',
    //     outputName: `test-${Date.now()}.xml`,
    //   },
    // ],
  ],
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/libs/esp/presentations/types',
};
