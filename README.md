# Novr Academy

Novr Academy is a Next.js learning platform for courses, lessons, quizzes, live classes, community features, and learner progress.

## Features

- Course and lesson browsing
- Video, PDF, and live-class learning experiences
- Quizzes and progress tracking
- Certificates and learner profiles
- Community posts, groups, and messaging
- Notifications and AI-assisted learning
- OAuth sign-in with Google or Microsoft (optional)

## Development setup

### Prerequisites

- Node.js 18 or newer
- npm 11 (the repository declares `npm@11.11.0`)

### Install and configure

```bash
npm install
cp .env.example .env
```

Fill in the required values in `.env`, then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment variables

Copy `.env.example` to `.env` and do not commit secrets.

| Variable | Purpose |
| --- | --- |
| `NEXTAUTH_SECRET` | Secret used to secure authentication sessions |
| `NEXTAUTH_URL` | Canonical application URL |
| `NEXT_PUBLIC_API_URL` | API URL exposed to browser-side code |
| `API_URL` | API URL used by server-side requests |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional Google OAuth credentials |
| `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID` | Optional Microsoft/Azure AD OAuth credentials |

## Deployment to Vercel

Deploy the project as a Next.js application on [Vercel](https://vercel.com/):

1. Import the repository into Vercel.
2. Set the required environment variables from the table above using production values.
3. Use `npm run build` as the build command if Vercel does not detect it automatically.
4. Deploy the project.

For a local production check:

```bash
npm run build
npm run start
```

## Useful commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```
