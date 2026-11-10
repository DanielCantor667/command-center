import config from '@command-center/eslint-config/nextjs';

const eslintConfig = [{ ignores: ['next-env.d.ts', '.next/**', 'public/basis/**'] }, ...config];

export default eslintConfig;
