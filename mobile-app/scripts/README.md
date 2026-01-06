# Mobile App Scripts

This directory contains utility scripts for the LOTOLINK mobile application.

## Available Scripts

### preflight-check.sh

Pre-flight validation script that checks the development environment before building.

**Usage:**
```bash
cd mobile-app
./scripts/preflight-check.sh
```

**What it checks:**
- ✅ Node.js version (minimum v16)
- ✅ npm installation
- ✅ Required project files (package.json, capacitor.config.ts, etc.)
- ✅ Project structure (src/ directory)
- ✅ Dependencies installation (node_modules, critical packages)
- ✅ Capacitor configuration
- ✅ TypeScript version compatibility
- ✅ Platform directories (android/, ios/)
- ✅ Gradle wrapper (for Android)
- ✅ Security checks (no sensitive files)

**Exit codes:**
- `0` - All checks passed or only warnings
- `1` - Critical errors found

**Example output:**
```
🔍 Running pre-flight checks...

=== Environment Checks ===

✓ Node.js version: v20.19.6
✓ npm version: 10.8.2

=== Project Structure Checks ===

✓ Found: package.json
✓ Found: package-lock.json
...

=== Summary ===

✅ All checks passed!
```

**When to run:**
- Before committing changes
- After pulling updates
- Before starting development
- In CI/CD pipelines (automatically)

**Note:** This script is automatically run in the GitHub Actions workflow during the quality-checks job.

## Adding New Scripts

When adding new scripts to this directory:

1. Make them executable:
   ```bash
   chmod +x scripts/your-script.sh
   ```

2. Add a shebang at the top:
   ```bash
   #!/bin/bash
   ```

3. Document them in this README

4. Add error handling:
   ```bash
   set -e  # Exit on error
   set -u  # Exit on undefined variable
   ```

5. Provide clear output messages

## Best Practices

- Use descriptive names
- Add comments to explain complex logic
- Use functions for reusable code
- Provide help text with `-h` or `--help`
- Exit with appropriate codes (0 = success, non-zero = error)
- Use colors for better readability (see preflight-check.sh)
- Validate inputs
- Handle errors gracefully

## Related Documentation

- [Build Guide](../BUILD_GUIDE.md)
- [Deployment Guide](../../docs/DEPLOYMENT_GUIDE.md)
- [Workflow Troubleshooting](../../.github/WORKFLOW_TROUBLESHOOTING.md)
