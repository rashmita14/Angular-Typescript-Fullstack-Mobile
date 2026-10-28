import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './openapi.yaml',
  output: {
    path: './src/app/api/generated',
  },
  plugins: ['@hey-api/typescript'],
});
