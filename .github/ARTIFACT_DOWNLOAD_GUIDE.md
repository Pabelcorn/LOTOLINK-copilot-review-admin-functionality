# Artifact Download Guide

## Overview

This guide explains how to download build artifacts (installers, APKs, AABs) from GitHub Actions workflows.

## Recent Fixes (December 2024)

### Issues Fixed

1. **Extended Retention Period**
   - **Before**: Artifacts expired after 7 days
   - **After**: Installer artifacts now available for 30 days
   - **Benefit**: More time to download and test builds

2. **Improved Upload Reliability**
   - Added verification steps before uploads
   - Removed silent failures with `continue-on-error`
   - Added clear error messages when builds fail
   - **Benefit**: Artifacts are only uploaded if they exist and are valid

3. **Better Error Handling**
   - Desktop installers now fail fast if build doesn't produce files
   - Mobile apps validate APK/AAB existence before upload
   - **Benefit**: No more mysterious missing artifacts

4. **Enhanced Documentation**
   - Added download instructions to workflow summaries
   - Added SHA256 checksums for verification
   - **Benefit**: Clear guidance on how to download and verify artifacts

### Retention Periods

| Artifact Type | Retention Days | Purpose |
|--------------|----------------|---------|
| Mobile Installers (APK/AAB) | 30 | Android app distribution |
| iOS Build Info | 30 | iOS build instructions |
| iOS App Bundle | 30 | iOS simulator testing |
| Desktop Installers (exe/dmg/AppImage) | 30 | Desktop app distribution |
| Release Summaries | 90 | Long-term release documentation |
| Coverage Reports | 14 | Code quality tracking |
| Build Logs | 14 | Debugging failed builds |

## How to Download Artifacts

### From GitHub Actions Web Interface

1. **Navigate to Actions**
   - Go to https://github.com/Pabelcorn/LOTOLINK/actions
   - Or click the "Actions" tab at the top of the repository

2. **Select Workflow**
   - Click on the workflow run you want (e.g., "Build Mobile Installers")
   - You'll see a list of recent workflow runs

3. **Choose a Run**
   - Click on a specific workflow run
   - Look for runs with a green checkmark (✓) for successful builds

4. **Download Artifacts**
   - Scroll down to the **Artifacts** section
   - Click on the artifact name to download (e.g., "android-debug-apk")
   - The artifact will download as a ZIP file

5. **Extract and Use**
   - Extract the ZIP file
   - The installer/APK will be inside

### Using GitHub CLI

```bash
# List artifacts for a workflow run
gh run view <run-id> --repo Pabelcorn/LOTOLINK

# Download a specific artifact
gh run download <run-id> --name android-debug-apk --repo Pabelcorn/LOTOLINK

# Download all artifacts from a run
gh run download <run-id> --repo Pabelcorn/LOTOLINK
```

### Using GitHub API

```bash
# Get workflow run ID
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/Pabelcorn/LOTOLINK/actions/runs

# Download artifact
curl -L -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/Pabelcorn/LOTOLINK/actions/artifacts/<artifact-id>/zip \
  -o artifact.zip
```

## Available Artifacts

### Mobile App Artifacts (mobile-build.yml)

| Artifact Name | Description | File Type | Retention |
|--------------|-------------|-----------|-----------|
| `android-debug-apk` | Android debug build for testing | .apk | 30 days |
| `android-release-aab` | Android release bundle for Play Store | .aab | 30 days |
| `ios-app-bundle` | iOS simulator build | .app | 30 days |
| `ios-build-info` | iOS build instructions | .txt | 30 days |
| `mobile-coverage` | Test coverage reports | HTML | 14 days |
| `mobile-release-summary` | Release documentation | .md | 90 days |

### Desktop App Artifacts (build-installers.yml)

| Artifact Name | Description | File Type | Retention |
|--------------|-------------|-----------|-----------|
| `windows-installer` | Windows installer | .exe, .7z | 30 days |
| `macos-installer` | macOS installer | .dmg, .zip | 30 days |
| `linux-installers` | Linux packages | .AppImage, .deb, .rpm | 30 days |
| `release-summary` | Release documentation | .md | 90 days |

### Backend Artifacts (ci-cd.yml)

| Artifact Name | Description | File Type | Retention |
|--------------|-------------|-----------|-----------|
| `backend-dist` | Compiled backend code | JS files | 14 days |
| `coverage` | Test coverage reports | HTML | 14 days |
| `e2e-report` | End-to-end test results | HTML | 14 days |

## Verification

### Android APK/AAB

After downloading, verify the integrity:

```bash
# Calculate SHA256 checksum
sha256sum app-debug.apk

# Compare with the checksum shown in the workflow summary
```

The workflow displays SHA256 checksums in the step summary. Compare your local checksum with the workflow output to ensure file integrity.

### Desktop Installers

```bash
# Windows
certutil -hashfile LotoLink-Setup-1.0.0.exe SHA256

# macOS/Linux
sha256sum LotoLink-Setup-1.0.0.exe
```

## Troubleshooting

### Artifact Not Found

**Problem**: Artifact section is empty or artifact is missing

**Possible Causes**:
1. Build failed before artifact creation
2. Artifact expired (check retention period)
3. Workflow was cancelled before completion

**Solutions**:
1. Check workflow logs for build errors
2. Re-run the workflow if needed
3. Check the workflow run timestamp vs retention period

### Download Fails

**Problem**: Download starts but fails or times out

**Possible Causes**:
1. Network issues
2. Large artifact size
3. GitHub API rate limits

**Solutions**:
1. Try again with a stable connection
2. Use GitHub CLI for better reliability
3. Download during off-peak hours

### Wrong File Downloaded

**Problem**: Downloaded file is not what you expected

**Solutions**:
1. Check artifact name carefully
2. Verify file extension after extraction
3. Review workflow logs to see what was built

### Artifact Expired

**Problem**: Artifact is older than retention period

**Solutions**:
1. Re-run the workflow from the same commit
2. Build locally using the same commit
3. Check for newer workflow runs

## Workflow Triggers

### Mobile Build Workflow

Automatically runs on:
- Push to `main` branch (if mobile-app/ changed)
- Pull requests to `main` (if mobile-app/ changed)
- Tags starting with `mobile-v*`

Manual trigger:
```bash
# Via GitHub UI: Actions → Build Mobile Installers → Run workflow
# Or via CLI:
gh workflow run mobile-build.yml --ref main -f platforms=all
```

### Desktop Build Workflow

Automatically runs on:
- Push to `main` branch
- Pull requests to `main`
- Tags starting with `v*`

Manual trigger:
```bash
gh workflow run build-installers.yml --ref main -f platforms=all
```

## Best Practices

### For Users

1. **Download Soon**: Even with 30-day retention, download artifacts promptly
2. **Verify Checksums**: Always verify SHA256 before installing
3. **Keep Backups**: Store important releases locally
4. **Use Tags**: For releases, download from tagged runs for stability

### For Developers

1. **Tag Releases**: Create tags for official releases to trigger builds
2. **Test Before Merging**: Use PR builds to test changes
3. **Monitor Storage**: Be aware of artifact storage limits
4. **Clean Old Runs**: Use cleanup workflow to manage storage

## Storage Limits

GitHub Actions has storage limits:
- **Free accounts**: 500 MB storage, 500 MB/month transfer
- **Pro accounts**: 2 GB storage, 10 GB/month transfer
- **Enterprise**: Higher limits

Our retention strategy balances availability with storage:
- Critical installers: 30 days
- Documentation: 90 days
- Logs and coverage: 14 days

## Future Improvements

### Planned Enhancements

1. **Artifact Compression**: Reduce sizes with better compression
2. **Release Management**: Auto-create GitHub releases for tagged builds
3. **Notification System**: Alert when builds complete
4. **Download Links**: Direct download links in PRs

### Security Considerations

1. **Code Signing**: Plan to add code signing for all platforms
2. **Checksum Automation**: Auto-post checksums to release notes
3. **Signed Releases**: GPG signatures for release artifacts

## Support

If you encounter issues:

1. Check this guide first
2. Review workflow logs
3. Check [WORKFLOW_TROUBLESHOOTING.md](.github/WORKFLOW_TROUBLESHOOTING.md)
4. Open an issue with:
   - Workflow run URL
   - Artifact name
   - Error message
   - Steps to reproduce

## Quick Reference

### Common Download Commands

```bash
# List recent workflow runs
gh run list --repo Pabelcorn/LOTOLINK --limit 10

# Download latest mobile build
gh run list --workflow=mobile-build.yml --limit 1 --json databaseId -q '.[0].databaseId' | \
  xargs -I {} gh run download {} --name android-debug-apk

# Download latest desktop installer (Windows)
gh run list --workflow=build-installers.yml --limit 1 --json databaseId -q '.[0].databaseId' | \
  xargs -I {} gh run download {} --name windows-installer
```

### Workflow File Locations

- Mobile builds: `.github/workflows/mobile-build.yml`
- Desktop builds: `.github/workflows/build-installers.yml`
- CI/CD: `.github/workflows/ci-cd.yml`
- Cleanup: `.github/workflows/cleanup-artifacts.yml`

---

**Last Updated**: December 14, 2024  
**Version**: 1.0  
**Related Docs**: 
- [WORKFLOW_TROUBLESHOOTING.md](.github/WORKFLOW_TROUBLESHOOTING.md)
- [mobile-app/BUILD_GUIDE.md](../mobile-app/BUILD_GUIDE.md)
- [desktop-app/README.md](../desktop-app/README.md)
