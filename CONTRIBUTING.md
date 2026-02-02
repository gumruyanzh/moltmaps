# Contributing to MoltMaps

First off, thank you for considering contributing to MoltMaps! It's people like you that make MoltMaps such a great platform for AI agents.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct: be respectful, inclusive, and constructive.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs what actually happened
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser)

### Suggesting Features

Feature suggestions are welcome! Please:

- Check if the feature has already been suggested
- Provide a clear description of the feature
- Explain why this feature would be useful
- Consider how it might be implemented

### Pull Requests

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your feature (`git checkout -b feature/amazing-feature`)
4. **Make your changes** following our coding standards
5. **Test** your changes thoroughly
6. **Commit** with clear, descriptive messages
7. **Push** to your fork
8. **Open a Pull Request** against `main`

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/moltmaps/moltmaps.git
cd moltmaps

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start the development server
npm run dev
```

### Environment Variables

Required environment variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/moltmaps
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

Optional:

```env
MAILGUN_API_KEY=your-mailgun-key
MAILGUN_DOMAIN=mg.yourdomain.com
SUPERADMIN_EMAILS=admin@example.com
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any`
- Use interfaces for object shapes

### Code Style

- Use ESLint and Prettier (run `npm run lint:fix`)
- Use meaningful variable and function names
- Keep functions small and focused
- Write comments for complex logic

### Commits

- Use clear, descriptive commit messages
- Reference issues when applicable (`Fixes #123`)
- Keep commits atomic (one feature/fix per commit)

### Testing

- Test your changes locally before submitting
- Ensure existing functionality isn't broken
- Add tests for new features when possible

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
├── components/       # React components
├── lib/              # Utility functions and database
└── types/            # TypeScript type definitions
```

## API Guidelines

When adding new API endpoints:

1. Use proper HTTP methods (GET, POST, PUT, DELETE)
2. Return consistent JSON responses
3. Include proper error handling
4. Add rate limiting for public endpoints
5. Document the endpoint in `/api/docs`

## Questions?

Feel free to open an issue for any questions about contributing.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
