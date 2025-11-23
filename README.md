# Instagram Auto Poster (Next.js)

A minimal web app to publish Instagram feed posts via the Instagram Graph API. Provide a public image URL and optional caption, then publish immediately to your connected Instagram Business account.

Note: Instagram requires a Business or Creator account connected to a Facebook Page, a Facebook App configured with the proper permissions, and a long-lived User access token with `instagram_basic` and `instagram_content_publish`.

## Requirements
- Node.js 18+
- Instagram Business/Creator account connected to a Facebook Page
- Facebook Developer App with:
  - Approved permissions: `instagram_basic`, `instagram_content_publish`
  - Long-lived User access token
  - Instagram User ID for the target business account

## Environment Variables
Create a `.env.local` file based on `.env.example`:

```
IG_ACCESS_TOKEN=your_long_lived_user_access_token
IG_USER_ID=your_instagram_business_user_id
REQUEST_TIMEOUT_MS=15000
```

## Local Development

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Build & Start (Production)

```bash
npm run build
npm run start
```

## How It Works
1. Client form collects a public `imageUrl` and optional `caption`.
2. API route `POST /api/instagram/publish`:
   - Creates a media container via `POST /{ig-user-id}/media`
   - Polls the container `status_code` until `FINISHED`
   - Publishes via `POST /{ig-user-id}/media_publish`
   - Returns the `permalink` of the new post

## Important Notes
- Instagram requires the image URL to be publicly accessible.
- Reels, carousels, and stories are not implemented in this minimal sample.
- Scheduling is not included; this publishes immediately upon request.

## Project Structure
```
app/
  api/instagram/publish/route.ts  # API route to publish
  page.tsx                        # UI page with form
  layout.tsx, globals.css         # App shell & styles
components/PublishForm.tsx        # Client form
lib/instagram.ts                  # Graph API helpers
```

## Deploy to Vercel
- Ensure `IG_ACCESS_TOKEN` and `IG_USER_ID` are configured in Vercel Project Environment Variables (Production).
- Deploy with the Vercel CLI.

After deployment, visit your production URL and use the form to publish.

## Disclaimer
Use responsibly and comply with Instagram and Facebook policies. This repo is provided as-is without warranty.
