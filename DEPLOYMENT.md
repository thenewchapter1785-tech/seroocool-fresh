# DigitalOcean Deployment Guide

This guide walks you through deploying your Next.js application to DigitalOcean App Platform with automated GitHub Actions CI/CD.

## Prerequisites

- GitHub account with repository
- DigitalOcean account with a project
- Node.js 18+ and npm

## Step 1: Set Up GitHub Repository

```bash
cd seroocool-fresh
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/seroocool-fresh.git
git push -u origin main
```

## Step 2: Create DigitalOcean App Platform

1. Log in to [DigitalOcean Dashboard](https://cloud.digitalocean.com)
2. Click **Create** → **Apps**
3. Connect your GitHub repository
4. Select the repository: `YOUR_USERNAME/seroocool-fresh`
5. Choose branch: `main`
6. Leave build command blank (defaults to detected Next.js build)
7. Review configuration and click **Create Resources**

## Step 3: Get Your DigitalOcean Credentials

### Get Access Token
1. Navigate to **API** → **Tokens/Keys**
2. Click **Generate New Token**
3. Name it: `github-actions-deploy`
4. Select **Read and Write** scopes
5. Copy the token (save it securely)

### Get App ID
1. Go to your App in DigitalOcean console
2. Copy the **App ID** from the URL or app details page

## Step 4: Configure GitHub Secrets

1. Go to your GitHub repository
2. Settings → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add two secrets:
   - **Name:** `DIGITALOCEAN_ACCESS_TOKEN`
     **Value:** (paste your DigitalOcean token)
   - **Name:** `DIGITALOCEAN_APP_ID`
     **Value:** (paste your App ID)

## Step 5: Update app.json

Edit `app.json` and replace:
- `YOUR_GITHUB_USERNAME` with your actual GitHub username
- Adjust `instance_size_slug` if needed (basic-xs = $5/month, basic-s = $12/month, etc.)

```json
{
  "services": [
    {
      "github": {
        "repo": "YOUR_GITHUB_USERNAME/seroocool-fresh"
      }
    }
  ]
}
```

## Step 6: Enable Auto-Deploy

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically deploys when:
- You push to the `main` branch
- Build succeeds
- GitHub Secrets are configured

## Step 7: Deploy

Push to main branch and the workflow will automatically trigger:

```bash
git add .
git commit -m "Enable auto-deploy"
git push origin main
```

Monitor deployment:
- GitHub: **Actions** tab
- DigitalOcean: App dashboard for deployment progress

## Environment Variables

Add environment variables in DigitalOcean:
1. App → **Settings** → **Environment**
2. Add variables needed for your app

Recommended variables for social integration:

- `NEXT_PUBLIC_SITE_URL` = `https://your-domain.com`
- `NEXT_PUBLIC_FACEBOOK_PAGE_URL` = `https://facebook.com/your-page`
- `NEXT_PUBLIC_INSTAGRAM_PROFILE_URL` = `https://instagram.com/your-handle`
- `NEXT_PUBLIC_META_PIXEL_ID` = `your_meta_pixel_id`
- `FACEBOOK_DOMAIN_VERIFICATION` = `your_facebook_verification_code`

Note:
- Variables prefixed with `NEXT_PUBLIC_` are safe for client-side use and are exposed in the browser.
- Keep `FACEBOOK_DOMAIN_VERIFICATION` as a regular server variable.

## Custom Domain Setup

1. In DigitalOcean App → **Settings** → **Domains**
2. Click **Edit** and add your custom domain
3. Update your domain registrar DNS records with provided values

## Facebook Business Page Linking and Integration

After your domain is live on DigitalOcean, complete this flow:

1. Create your Facebook Business Page for your brand.
2. In Page settings, set your **Website** field to your deployed domain.
3. Add your website in **Meta Business Manager** and verify domain ownership.
4. Use the `FACEBOOK_DOMAIN_VERIFICATION` value from Meta in your DigitalOcean env vars.
5. Create a **Meta Pixel** in Events Manager and set `NEXT_PUBLIC_META_PIXEL_ID`.
6. Add your Instagram professional profile link via `NEXT_PUBLIC_INSTAGRAM_PROFILE_URL`.
7. Configure your Page call-to-action button (Contact Us / Learn More) to your site URL.

Result:
- Your deployed site is connected to your Facebook Business presence.
- Traffic from Facebook and Instagram is measurable through Meta Pixel.
- Your creator profiles and website stay synced via centralized env configuration.

## Monitoring & Logs

View logs in DigitalOcean:
1. App → **Logs** tab
2. Real-time deployment and runtime logs

## Troubleshooting

### Deployment fails at build stage
- Check `npm run build` runs locally
- Verify Node.js version matches in `app.json`
- Check environment variables are set

### 502 Bad Gateway
- App crashed during startup
- Check logs in DigitalOcean dashboard
- Verify `npm start` works locally

### GitHub Actions fails
- Verify GitHub secrets are set correctly
- Check workflow syntax in `.github/workflows/deploy.yml`
- View job logs in Actions tab

## Useful Commands

```bash
# Local build test
npm run build
npm run start

# Docker build locally
docker build -t seroocool-fresh .
docker run -p 3000:3000 seroocool-fresh

# View DigitalOcean logs
doctl apps logs <app-id>
```

## File Reference

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `app.json` - DigitalOcean App Platform config
- `Dockerfile` - Docker image definition
- `.dockerignore` - Docker exclusions

## Support

- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/learn/basics/deploying-nextjs-app)
