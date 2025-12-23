import { test } from '@tests/governance';
import { ApiClient } from '@src/api/api-client';
import { config } from '@config/config';

test('CST-T204 CMS API Consumer with API Key', async ({ baseTest }) => {

  const client = new ApiClient(config.cmsApiUrl, baseTest.logger);
  client.setHeaders({
    Authorization: `ApiKey ${config.secrets.cmsApiKey}`,
    'Content-Type': 'application/json'
  });

  const endpoints = {
    health: '/info/health',
    version: '/info/version',
    allPages: '/api/v1/@apostrophecms/page?all=1',
    siteLocales: '/api/v1/assets/locales',
    allBlogs: '/api/v1/@apostrophecms/blog?page=1&visibility=public',
    pageContent: '/',
    headerFooter: '/en-US/?headerfooteronly=true',
    paletteStylesheet: '/api/v1/@apostrophecms-pro/palette/stylesheet?aposLocale=en-US:published',
    oembedYoutube:
      '/en-US/api/v1/@apostrophecms/oembed/query?url=https%3A%2F%2Fyoutu.be%2FJGUJB37z14M%3Fsi%3DPIBHj1TGEiInyoNh',
    findWidgetByType: '/api/v1/@apostrophecms/global/find-widgets/carousel-v2'
  };

  for (const [name, path] of Object.entries(endpoints)) {
    await baseTest.section(`API: ${name}`, async () => {
      const r = await client.get(path);
      await r.attach();
      baseTest.assertThat(r.statusCode()).equals(200);
      baseTest.assertThat(r.as()).truthy();
    });
  }

  // await baseTest.soft.report();
});
