# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at TalkStudio. If you discover a security vulnerability,
please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities.
2. Email the security team or use GitHub's private vulnerability reporting.
3. Include detailed information about the vulnerability.
4. Allow reasonable time for a fix before public disclosure.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (Critical: 7 days, High: 14 days, Medium: 30 days)

## Security Best Practices

### API Keys & Secrets

- Never commit API keys to the repository
- Use environment variables for sensitive data
- Rotate keys regularly
- Use `.env` files (which are gitignored)

### Generated Content

- All generated chat images include visible watermarks
- Generated content is clearly marked as "SAMPLE" or "DEMO"
- Users are warned against misuse for fraudulent purposes

### Input Validation

- All user inputs are sanitized
- XSS protection is implemented
- SQL injection prevention (if applicable)

## Known Security Considerations

### Chat Screenshot Generation

The chat screenshot generation feature could potentially be misused for:
- Creating fake evidence
- Impersonation
- Fraud

**Mitigations implemented:**
1. Visible "SAMPLE DATA" watermarks on all generated images
2. Diagonal "SAMPLE" overlay that cannot be easily removed
3. Disclaimer footers on all generated content
4. Metadata marking content as `is_sample: true`

## Security Headers

The application implements the following security headers:
- Content-Security-Policy
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security (in production)

## Dependencies

We regularly update dependencies to patch known vulnerabilities:
- `npm audit` is run as part of CI/CD
- Dependabot alerts are enabled
- Critical updates are applied within 7 days
