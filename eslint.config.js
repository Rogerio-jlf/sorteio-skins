import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.config({
        extends: [
            'next/core-web-vitals',
            'plugin:@typescript-eslint/recommended',
            'plugin:prettier/recommended',
        ],
        rules: {
            'react/no-unescaped-entities': 'off',
            '@next/next/no-page-custom-font': 'off',
            'react/react-in-jsx-scope': 'off',
            'prettier/prettier': ['error'],
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    }),
];

export default eslintConfig;
