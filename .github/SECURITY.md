# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of TalkStudio seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email your findings to: **security@talkstudio.app** (or create a private security advisory)
3. Include as much information as possible:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Resolution Target**: Within 30 days for critical issues

### Disclosure Policy

- We will acknowledge receipt of your report
- We will investigate and validate the issue
- We will work on a fix and coordinate disclosure with you
- We will credit you in our security advisory (unless you prefer anonymity)

## Security Best Practices

### For Users

1. **Keep your browser updated** - Use the latest version of your browser
2. **Be cautious with exports** - Exported images may contain sensitive conversation data
3. **Clear local storage** - If using shared devices, clear browser data after use

### For Contributors

1. **Never commit secrets** - Use environment variables for sensitive data
2. **Validate inputs** - Always validate and sanitize user inputs
3. **Keep dependencies updated** - Regularly update dependencies for security patches
4. **Follow secure coding practices** - Review OWASP guidelines

## Known Security Considerations

### Data Storage

- TalkStudio stores data in browser's LocalStorage
- Data is stored locally and not transmitted to servers
- Users should be aware that LocalStorage can be accessed by other scripts on the same origin

### Image Export

- Exported images may contain conversation content
- Users should handle exported images with appropriate care

### External APIs

- TalkStudio uses DiceBear API for avatar generation
- No personal data is sent to external services
- Only avatar style parameters are transmitted

## Security Headers

Our deployment includes the following security headers:

```
Content-Security-Policy: default-src 'self'; img-src 'self' https://api.dicebear.com data:; style-src 'self' 'unsafe-inline';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Dependency Security

We use the following tools to maintain dependency security:

- **npm audit** / **pnpm audit** - Regular vulnerability scanning
- **Dependabot** - Automated dependency updates
- **CodeQL** - Static analysis for security vulnerabilities

## Contact

For security-related inquiries:

- Email: security@talkstudio.app
- GitHub Security Advisories: [Create Advisory](https://github.com/haseongpark/TalkStudio/security/advisories/new)

---

Thank you for helping keep TalkStudio secure!
