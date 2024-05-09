"use strict";
//@ts-check

import { parseForESLint } from '@typescript-eslint/parser';

export default [
    {
        languageOptions: {
            parser: parseForESLint,
        },
        parserOptions: {
            ecmaVersion: 6,
            sourceType: 'module'
        },
        plugins: [
            '@typescript-eslint'
        ],
        extends: [
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended',
        ],
        files: ['src/**/*.ts', 'src/**/*.js', 'src/**/*.cjs', 'src/**/*.mjs'],
        rules: {
            '@typescript-eslint/naming-convention': [
                'warn',
                {
                    'selector': 'import',
                    'format': ['camelCase', 'PascalCase'
                    ]
                }
            ],
            'prefer-const': 'warn',
            'no-extra-semi': 'warn',
            'no-useless-escape': 'warn',
            'no-inner-declarations': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-namespace': 'warn',
            '@typescript-eslint/ban-types': 'error',
            // TODO - wasn't using these before, but was part or recommended, maybe remove again?
            '@typescript-eslint/semi': 'warn',
            'curly': 'warn',
            'eqeqeq': 'warn',
            'no-throw-literal': 'warn',
            'semi': 'off',
            //
            // https://eslint.org/docs/rules/eol-last
            //  not sure how to make format-on-save work with this ?
            'eol-last': ['warn', 'always'
            ],
        },
        ignorePatterns: [
            '**/*.d.ts',
            'node_modules',
            'output',
            'build',
            'dist',
            'temp',
            'tmp',
            'out',
        ],

    }
];
