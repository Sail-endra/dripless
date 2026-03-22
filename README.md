This repo contains two app stacks:

- the newer Vite UI in `client/` with the Express API in `server/`
- an older Next.js app in the repo root

## Getting Started

To run the latest UI from the repo root:

```bash
npm run dev
```

This starts:

- the latest Vite UI, usually at `http://localhost:5173`
- the Express API in `server/`

If this is your first run on a Mac, install dependencies first:

```bash
npm run install:all
```

To run the older Next.js app instead:

```bash
npm run dev:next
```

That older app runs at `http://localhost:3000`.

## Run The Whole Project Locally

From the repo root on macOS:

```bash
npm run install:all
npm run dev:all
```

This starts:

- the root Next.js app on `http://localhost:3000`
- the Vite client in `client/`
- the Express server in `server/`

If you only want the latest UI, `npm run dev` from the repo root is enough.

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
