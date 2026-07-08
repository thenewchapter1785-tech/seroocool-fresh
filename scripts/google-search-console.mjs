import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { URL } from 'node:url';
import { google } from 'googleapis';

const authScopes = [
  'https://www.googleapis.com/auth/webmasters',
  'https://www.googleapis.com/auth/siteverification',
];

const cwd = process.cwd();
const defaultCredentialsPath = path.join(cwd, '.secrets', 'google-oauth-client.json');
const defaultTokenPath = path.join(cwd, '.secrets', 'google-oauth-token.json');

function getArg(name, fallback) {
  const idx = process.argv.indexOf(name);
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1];
  }
  return fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function printUsage() {
  console.log('Usage:');
  console.log('  node scripts/google-search-console.mjs auth [--credentials <path>] [--token <path>]');
  console.log('  node scripts/google-search-console.mjs submit-sitemap --site <siteUrl> --sitemap <sitemapUrl> [--credentials <path>] [--token <path>]');
  console.log('  node scripts/google-search-console.mjs list-sites [--credentials <path>] [--token <path>]');
  console.log('  node scripts/google-search-console.mjs add-site --site <siteUrl> [--credentials <path>] [--token <path>]');
  console.log('  node scripts/google-search-console.mjs get-verification-token --site <siteUrl> [--method META] [--credentials <path>] [--token <path>]');
  console.log('  node scripts/google-search-console.mjs verify-site --site <siteUrl> [--method META] [--credentials <path>] [--token <path>]');
  console.log('  node scripts/google-search-console.mjs doctor [--credentials <path>] [--site <siteUrl>]');
}

function printAccessDeniedHelp() {
  console.error('OAuth access denied by Google. Fix these settings, then retry auth:');
  console.error('1) Google Cloud Console -> APIs & Services -> OAuth consent screen');
  console.error('2) Publishing status can stay Testing, but add your Google account as a Test user');
  console.error('3) APIs & Services -> Library -> Enable Search Console API');
  console.error('4) APIs & Services -> Credentials -> OAuth client (Desktop app) -> redirect URI should be http://localhost');
  console.error('5) Search Console must include the same Google account with at least Full permissions for the property');
}

async function loadCredentials(credentialsPath) {
  const raw = await fs.readFile(credentialsPath, 'utf8');
  const parsed = JSON.parse(raw);
  const cfg = parsed.installed ?? parsed.web;

  if (!cfg?.client_id || !cfg?.client_secret || !cfg?.redirect_uris?.length) {
    throw new Error('Invalid OAuth client JSON. Expected installed/web credentials.');
  }

  return cfg;
}

async function createClient(credentialsPath, tokenPath, requireToken = true) {
  const cfg = await loadCredentials(credentialsPath);
  const oauth2 = new google.auth.OAuth2(cfg.client_id, cfg.client_secret, cfg.redirect_uris[0]);

  if (requireToken) {
    const tokenRaw = await fs.readFile(tokenPath, 'utf8');
    oauth2.setCredentials(JSON.parse(tokenRaw));
  }

  return { oauth2, cfg };
}

async function runAuth(credentialsPath, tokenPath) {
  const { oauth2, cfg } = await createClient(credentialsPath, tokenPath, false);
  const redirect = new URL(cfg.redirect_uris[0]);

  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: authScopes,
  });

  console.log('Open this URL in your browser to authorize:');
  console.log(authUrl);
  console.log('Waiting for OAuth callback...');

  const server = http.createServer(async (req, res) => {
    try {
      const reqUrl = new URL(req.url ?? '/', `http://${req.headers.host}`);
      const code = reqUrl.searchParams.get('code');
      const error = reqUrl.searchParams.get('error');

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(`OAuth failed: ${error}`);
        if (error === 'access_denied') {
          printAccessDeniedHelp();
        }
        server.close();
        return;
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing code parameter.');
        return;
      }

      const { tokens } = await oauth2.getToken(code);
      await fs.mkdir(path.dirname(tokenPath), { recursive: true });
      await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2), 'utf8');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h2>Authorization complete.</h2><p>You can return to your terminal.</p>');
      console.log(`Saved OAuth token to ${tokenPath}`);
      server.close();
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('OAuth token exchange failed.');
      console.error(err.message);
      server.close();
    }
  });

  await new Promise((resolve, reject) => {
    server.on('close', resolve);
    server.on('error', reject);
    server.listen(Number(redirect.port || 80), redirect.hostname);
  });
}

async function runDoctor(credentialsPath) {
  const cfg = await loadCredentials(credentialsPath);
  const site = getArg('--site', 'https://zerocool-development.com/');
  const redirect = cfg.redirect_uris?.[0] ?? '';

  console.log('OAuth config check:');
  console.log(`- project_id: ${cfg.project_id ?? 'unknown'}`);
  console.log(`- client_id: ${cfg.client_id ? `${cfg.client_id.slice(0, 18)}...` : 'missing'}`);
  console.log(`- redirect_uri: ${redirect || 'missing'}`);
  console.log(`- expected site property: ${site}`);

  const issues = [];
  if (!cfg.client_id) {
    issues.push('Missing client_id in OAuth credentials file.');
  }
  if (!cfg.client_secret) {
    issues.push('Missing client_secret in OAuth credentials file.');
  }
  if (!redirect) {
    issues.push('Missing redirect_uris entry in OAuth credentials file.');
  }
  if (redirect && redirect !== 'http://localhost') {
    issues.push(`Redirect URI is ${redirect}. For this script, use http://localhost in Desktop OAuth client.`);
  }

  if (issues.length) {
    console.error('Problems found:');
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Local OAuth file structure looks valid.');
  console.log('If auth still fails with access_denied, Google Cloud test-user or consent settings are the blocker.');
}

async function runListSites(credentialsPath, tokenPath) {
  const { oauth2 } = await createClient(credentialsPath, tokenPath, true);
  const webmasters = google.webmasters({ version: 'v3', auth: oauth2 });
  const { data } = await webmasters.sites.list();
  const entries = data.siteEntry ?? [];

  if (!entries.length) {
    console.log('No Search Console properties available for this account.');
    return;
  }

  for (const site of entries) {
    console.log(`${site.siteUrl} (${site.permissionLevel})`);
  }
}

async function runSubmitSitemap(credentialsPath, tokenPath) {
  const site = getArg('--site', 'https://zerocool-development.com/');
  const sitemap = getArg('--sitemap', 'https://zerocool-development.com/sitemap.xml');

  const { oauth2 } = await createClient(credentialsPath, tokenPath, true);
  const webmasters = google.webmasters({ version: 'v3', auth: oauth2 });

  await webmasters.sitemaps.submit({
    siteUrl: site,
    feedpath: sitemap,
  });

  console.log(`Submitted sitemap ${sitemap} for property ${site}`);
}

async function runAddSite(credentialsPath, tokenPath) {
  const site = getArg('--site', 'https://zerocool-development.com/');

  const { oauth2 } = await createClient(credentialsPath, tokenPath, true);
  const webmasters = google.webmasters({ version: 'v3', auth: oauth2 });

  await webmasters.sites.add({
    siteUrl: site,
  });

  console.log(`Added Search Console property ${site}`);
}

async function runGetVerificationToken(credentialsPath, tokenPath) {
  const site = getArg('--site', 'https://zerocool-development.com/');
  const method = getArg('--method', 'META');

  const { oauth2 } = await createClient(credentialsPath, tokenPath, true);
  const verification = google.siteVerification({ version: 'v1', auth: oauth2 });

  const { data } = await verification.webResource.getToken({
    requestBody: {
      site: {
        type: 'SITE',
        identifier: site,
      },
      verificationMethod: method,
    },
  });

  console.log(data.token ?? '');
}

async function runVerifySite(credentialsPath, tokenPath) {
  const site = getArg('--site', 'https://zerocool-development.com/');
  const method = getArg('--method', 'META');

  const { oauth2 } = await createClient(credentialsPath, tokenPath, true);
  const verification = google.siteVerification({ version: 'v1', auth: oauth2 });

  const { data } = await verification.webResource.insert({
    verificationMethod: method,
    requestBody: {
      site: {
        type: 'SITE',
        identifier: site,
      },
    },
  });

  console.log(`Verified site ${data.site?.identifier ?? site} with ${method}`);
}

async function main() {
  const command = process.argv[2];
  const credentialsPath = getArg('--credentials', defaultCredentialsPath);
  const tokenPath = getArg('--token', defaultTokenPath);

  if (!command || hasFlag('--help') || hasFlag('-h')) {
    printUsage();
    return;
  }

  try {
    if (command === 'auth') {
      await runAuth(credentialsPath, tokenPath);
      return;
    }

    if (command === 'list-sites') {
      await runListSites(credentialsPath, tokenPath);
      return;
    }

    if (command === 'submit-sitemap') {
      await runSubmitSitemap(credentialsPath, tokenPath);
      return;
    }

    if (command === 'add-site') {
      await runAddSite(credentialsPath, tokenPath);
      return;
    }

    if (command === 'get-verification-token') {
      await runGetVerificationToken(credentialsPath, tokenPath);
      return;
    }

    if (command === 'verify-site') {
      await runVerifySite(credentialsPath, tokenPath);
      return;
    }

    if (command === 'doctor') {
      await runDoctor(credentialsPath);
      return;
    }

    printUsage();
    process.exitCode = 1;
  } catch (err) {
    console.error(err.message);
    if (err.message?.includes('sufficient permission for site')) {
      console.error('Search Console access exists for the Google account, but the site property is not added or not verified for that account yet.');
      console.error('Try: add the property in Search Console, verify ownership, then rerun submit-sitemap.');
    }
    process.exitCode = 1;
  }
}

main();
