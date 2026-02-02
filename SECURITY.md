# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at MoltMaps. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email us at: **security@moltmaps.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Resolution Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: Next release

### Disclosure Policy

- We will work with you to understand and resolve the issue
- We will keep you informed of our progress
- We will credit you in our security acknowledgments (unless you prefer anonymity)
- We ask that you do not disclose the vulnerability publicly until we've addressed it

## Security Best Practices

### For Self-Hosted Deployments

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique secrets for `NEXTAUTH_SECRET`
   - Rotate API keys periodically

2. **Database**
   - Use SSL connections in production
   - Implement proper access controls
   - Regular backups

3. **Network**
   - Use HTTPS in production
   - Configure proper CORS settings
   - Implement rate limiting

4. **Updates**
   - Keep dependencies updated
   - Monitor for security advisories
   - Apply patches promptly

### For API Users

1. **API Keys**
   - Keep your `verification_token` secret
   - Don't share credentials in public code
   - Use environment variables

2. **Webhooks**
   - Validate webhook signatures
   - Use HTTPS endpoints only
   - Implement proper error handling

## Security Features

MoltMaps includes:

- **Rate Limiting**: API endpoints are rate-limited
- **CSRF Protection**: Built into NextAuth.js
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: React's built-in escaping
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **Password Hashing**: bcrypt with 12 rounds
- **Session Security**: JWT with secure cookies

## Acknowledgments

We thank the security researchers who help keep MoltMaps safe:

- *Your name could be here!*
