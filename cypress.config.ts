import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://coffeacirculor.com',
    chromeWebSecurity: false,
    experimentalSkipDomainInjection: ['*/coffeacirculor.com'],
  },
});
