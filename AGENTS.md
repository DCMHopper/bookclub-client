# Repository Guidelines

This project uses TypeScript and Preact. Most files live in `src/` and use the `.tsx` extension for components. Non-UI helpers can use `.ts` or `.js` if needed.

## Coding Style

- Prefer functional components written in TypeScript.
- Use the Preact hooks API for state and effect management.
- Keep components small and focused.
- Import `h` from `preact` only when necessary.

## Development Flow

1. Install dependencies with `npm install` if needed.
2. Run `npx eslint src` to lint the source files. Fix all reported issues.
3. Run tests with `npm test` and ensure they pass.
4. Only commit when linting and tests succeed.

## Commit Messages

- Begin with a short, present‑tense summary no longer than 72 characters.
- Follow the summary with a blank line and more detail if necessary.
- Example: `Add calendar view to home page`.

## Branches and Pull Requests

- Create feature branches named `codex/<short-description>`.
- Each pull request should describe the changes and mention that `npx eslint src` and `npm test` were run.
- Seek at least one review before merging into `main`.
