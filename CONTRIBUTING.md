# Contributing to OrcaRail Node.js SDK

Thank you for your interest in contributing to the OrcaRail Node.js SDK! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/orcarail/orcarail-node.git
   cd orcarail-node
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Run tests in watch mode**
   ```bash
   npm run test:watch
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

6. **Lint code**
   ```bash
   npm run lint
   ```

7. **Format code**
   ```bash
   npm run format
   ```

## Project Structure

```
sdks/node/
├── src/              # Source code
│   ├── index.ts      # Main entry point
│   ├── client.ts     # HTTP client
│   ├── errors.ts     # Error classes
│   ├── types.ts      # TypeScript types
│   ├── webhooks.ts   # Webhook utilities
│   └── resources/    # API resources
│       └── payment-intents.ts
├── tests/            # Test files
├── examples/         # Example code
└── dist/             # Build output (generated)
```

## Code Style

- Use TypeScript for all code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Run `npm run format` before committing

## Testing

- Write tests for all new features
- Ensure all tests pass before submitting a PR
- Use descriptive test names
- Mock external dependencies (like `fetch`)

## Submitting Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `test:` for test changes
   - `refactor:` for code refactoring
   - `chore:` for maintenance tasks

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Open a PR on GitHub
   - Describe your changes clearly
   - Reference any related issues

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Ensure all tests pass
- Update documentation if needed
- Add examples if introducing new features
- Respond to review feedback promptly

## Reporting Issues

When reporting issues, please include:

- Node.js version
- SDK version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages or logs

## Questions?

Feel free to open an issue for questions or discussions!
