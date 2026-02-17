/** @type {import('jest').Config} */
const config = {
  transform: {},
  extensionsToTreatAsEsm: [],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/']
};

module.exports = config;
