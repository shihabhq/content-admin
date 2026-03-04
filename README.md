## Content Admin

Admin dashboard for managing RightsContent videos, artworks, and tags. This is a Next.js App Router app that talks to the `content-server` admin API.

It is intended to be deployed to a separate admin domain (for example `admin.rightscontent.com`).

### Features

- **Secure login** for content editors
- **Video management**: create, update, delete, feature, recommend, tag
- **Artwork management**: upload images, edit titles and descriptions, feature/publish toggle, tagging
- **Tag management**: create and rename tags used across videos and artworks
- **Pagination** for large content sets

### Tech stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS 4
- **Auth / API**: Uses an internal auth context and calls the `content-server` admin endpoints

### Project structure (high level)

- `src/app` – App Router routes (login, dashboard, videos, artworks, tags)
- `src/lib/api.ts` – typed HTTP client for admin endpoints on `content-server`
- `src/contexts/auth-context.tsx` – authentication state and helper methods
- `src/components` – admin UI components and shared form controls

### Environment variables

Environment variables are read from `.env` and **should not contain real secrets in version control**.

Required variables:

- **`NEXT_PUBLIC_CONTENT_API_URL`** – base URL for the content API used by the admin app.
  - Local dev example: `http://localhost:4000`
  - Production example: `https://api.rightscontent.com`

The admin API routes on `content-server` are mounted under `/api/admin/...`, and `src/lib/api.ts` builds URLs as:

- `NEXT_PUBLIC_CONTENT_API_URL + "/api/admin/videos"...`
- `NEXT_PUBLIC_CONTENT_API_URL + "/api/admin/artworks"...`
- `NEXT_PUBLIC_CONTENT_API_URL + "/api/admin/tags"...`

### Getting started (development)

1. **Install dependencies**:

   ```bash
   cd content-admin
   npm install
   ```

2. **Create a `.env` file** with at least:

   ```env
   NEXT_PUBLIC_CONTENT_API_URL=http://localhost:4000
   ```

   Make sure `content-server` is running on that base URL.

3. **Run the dev server**:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3001` (or the port you configure) to access the admin UI.

### Building and running in production

Create a production build and serve it:

```bash
cd content-admin
npm run build
npm start
```

Set `PORT` if you need a specific port:

```bash
PORT=3001 npm start
```

Ensure `NEXT_PUBLIC_CONTENT_API_URL` points to your production `content-server` API (for example, `https://api.rightscontent.com`).

### How authentication works (high level)

- The login page collects email and password and calls the `signIn` function from `auth-context`.
- On successful login, the app stores a token and includes it as an `Authorization: Bearer <token>` header for admin API requests.
- Protected routes in the dashboard check for an authenticated user and redirect to `/login` when necessary.

Implementation details (e.g. how tokens are issued and verified) are handled on the `content-server` side and can be adjusted to fit your auth provider (Supabase, custom JWTs, etc.).

### Admin flows

- **Videos**
  - Create videos with title, YouTube URL, description, thumbnail, featured/recommended flags, and tags.
  - Edit or delete existing videos.
  - Pagination to browse large sets of content.

- **Artworks**
  - Upload an image file and metadata (title, description, tags).
  - Mark artworks as featured and/or published.
  - Edit metadata and replace images.

- **Tags**
  - Central tag management; tags are reused by videos and artworks.
  - When creating/editing content, tag names can be resolved to IDs and created on the fly.

### Development workflow with the other apps

Typical local stack:

1. `content-server` running on `http://localhost:4000`.
2. `content-admin` running on `http://localhost:3001` with `NEXT_PUBLIC_CONTENT_API_URL=http://localhost:4000`.
3. `content-frontend` running on `http://localhost:3000` with `NEXT_PUBLIC_API_URL=http://localhost:4000`.

Changes made via the admin UI will be immediately reflected in the public site because the frontend is configured to bypass long-term caching.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
