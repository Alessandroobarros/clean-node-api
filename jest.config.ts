export default {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node', // 'jest-environment-node'
  transform: {
    '.+\\.ts$': 'ts-jest'
  }
}
