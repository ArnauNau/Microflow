export default {
  preset: 'ts-jest/presets/default-esm',
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['public/dist/', 'node_modules/'],
};