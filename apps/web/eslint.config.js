import config from '@command-center/eslint-config/nextjs';

const eslintConfig = [{ ignores: ['next-env.d.ts', '.next/**'] }, ...config];

export default eslintConfig;
