# bookclub-client

A simple frontend application for managing a book club using Preact and Vite.

<h2 align="center">
  <img height="256" width="256" src="./src/assets/preact.svg">
</h2>

<h3 align="center">Get started using Preact and Vite!</h3>

## Project Purpose

This app provides a lightweight interface for members to coordinate book club
activities. It uses Preact for the UI and Supabase as the backend service.

## Prerequisites

- Node.js 18 or later
- npm 9 or later

## Environment Variables

Copy `.env.example` to `.env` and fill in your credentials. The setup script
will do this automatically when run for the first time.

## Getting Started

Run `scripts/setup-dev.sh` to install dependencies and create your `.env` file.

-   `npm run dev` - Starts a dev server at http://localhost:5173/

## Testing

- `npm test` - Runs the Vitest test suite

## Build and Preview

- `npm run build` - Produces an optimized bundle in `dist/`
- `npm run preview` - Serves the built bundle at http://localhost:4173/

## Contributing

See [AGENTS.md](./AGENTS.md) for coding standards, development flow and
commit guidelines.
