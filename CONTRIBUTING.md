# Contributing to SmartTools

Thank you for your interest in contributing to SmartTools! Contributions are welcome through issues, documentation improvements, bug fixes, tests, and new features.

## Before you start

1. Search existing issues and pull requests to avoid duplicate work.
2. For substantial changes, open an issue first so the approach can be discussed.
3. Never commit secrets, API keys, credentials, or `.env` files.

## Development setup

1. Fork and clone the repository.
2. Install dependencies:

   ```bash
   bun install
   ```

   You may also use `npm install` if Bun is unavailable.
3. Copy `.env.example` to `.env` and configure local values as needed.
4. Start the development server:

   ```bash
   bun run dev
   ```

## Making changes

- Keep changes focused and explain the reason for them.
- Follow the existing TypeScript, React, and formatting conventions.
- Update documentation when behavior or configuration changes.
- Add or update tests when practical.
- Do not introduce unrelated formatting or dependency changes.

## Verification

Before opening a pull request, run:

```bash
bun run lint
bun run build
```

Also test the affected behavior locally and check that no sensitive files are included.

## Pull requests

- Use a clear, descriptive title.
- Describe what changed, why it changed, and how it was tested.
- Link related issues using GitHub keywords such as `Fixes #123`.
- Keep the pull request focused and respond to review feedback.
- By submitting a contribution, you agree that it may be distributed under the repository's MIT License.

## Questions

If you are unsure where to begin, open a discussion or issue with enough context for others to help.
