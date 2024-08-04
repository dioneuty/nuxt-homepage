# My Nuxt 3 Blog and Board Application

This project is a modern web application built with Nuxt 3, featuring a blog and a board system. It demonstrates the use of Vue 3 composition API, server-side rendering, and responsive design with Tailwind CSS.

## Features

- Blog system with post creation and listing
- Board system for community discussions
- Responsive design for mobile and desktop
- Dark mode support
- Server-side rendering for improved SEO and performance

## Tech Stack

- Nuxt 3
- Vue 3
- Tailwind CSS
- SQLite (for data storage)

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

After installing the dependencies, if there is no database.sqlite, initialize the database and add sample data:

```bash
node /server/db/init.js
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.