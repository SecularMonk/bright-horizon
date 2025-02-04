import type { Config } from 'jest';

const config: Config = {
   preset: 'ts-jest',
   verbose: true,
   transform: {
      '^.+\\.(ts|tsx)?$': 'ts-jest',
   },
};

export default config;
