import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    // Ignora as pastas que não devem ser analisadas (substitui o antigo .eslintignore)
    ignores: ['eslint.config.mts', 'dist', 'node_modules', 'coverage'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked, // Ativa a checagem rigorosa baseada em tipos
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // --- Regras do NestJS e TypeScript ---
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Proíbe 'any'. Força o uso de tipagem explícita no backend.
      '@typescript-eslint/no-explicit-any': 'error',

      // Permite variáveis não utilizadas se começarem com underline (ex: _req)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],

      // Evita promessas flutuantes (esquecer o 'await')
      '@typescript-eslint/no-floating-promises': 'error',

      // --- Ordenação Automática de Imports ---
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  eslintPluginPrettierRecommended,
]);
