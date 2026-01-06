# GitHub Actions Release Creation Guide

This document explains how to create LotoLink releases using GitHub Actions workflows.

## Problem Context

Previously, workflows only created releases when executed from **git tags**. If you ran the workflow manually or from a push to the `main` branch, installers were generated as **artifacts** but **did not appear in the Releases section**.

## Solution Implemented

Now you have **two ways** to create releases:

### 1. Traditional Method: Using Tags (Recommended for Production)

This is the recommended method for official releases:

**For Desktop:**
```bash
git tag v1.0.7
git push origin v1.0.7
```

**For Mobile:**
```bash
git tag mobile-v1.0.7
git push origin mobile-v1.0.7
```

The workflow will run automatically and create a **public release** with all installers.

### 2. New Method: Manual Execution with Release Option

You can now run workflows manually and create a **draft release**:

#### Desktop Installers:

1. Go to: [Actions → Build Desktop Installers](https://github.com/Pabelcorn/LOTOLINK/actions/workflows/build-installers.yml)
2. Click **"Run workflow"**
3. Configure parameters:
   - **Branch**: Select branch (e.g., `main`)
   - **Platforms**: `all`, `windows`, `macos`, or `linux`
   - **Create a GitHub release (draft)**: ✅ Check this option
   - **Release tag name**: Enter a tag (e.g., `v1.0.7`)
4. Click **"Run workflow"**

#### Mobile Installers:

1. Go to: [Actions → Build Mobile Installers](https://github.com/Pabelcorn/LOTOLINK/actions/workflows/mobile-build.yml)
2. Click **"Run workflow"**
3. Configure parameters:
   - **Branch**: Select branch (e.g., `main`)
   - **Platforms**: `all`, `android`, or `ios`
   - **Create a GitHub release (draft)**: ✅ Check this option
   - **Release tag name**: Enter a tag (e.g., `mobile-v1.0.7`)
4. Click **"Run workflow"**

## What Happens with Draft Releases?

When using manual execution with `create_release = true`:

1. ✅ A **draft release** is created
2. ✅ It's marked as **pre-release**
3. ✅ Installers are uploaded to the release
4. ✅ The release is **NOT publicly visible** until you publish it

### Publishing a Draft Release:

1. Go to [Releases](https://github.com/Pabelcorn/LOTOLINK/releases)
2. You'll see the release marked as **Draft**
3. Click **"Edit"**
4. Review that everything is correct
5. Uncheck **"Set as a pre-release"** if it's a stable version
6. Click **"Publish release"**

## Method Comparison

| Feature | With Tag | Manual with Flag |
|---------|----------|------------------|
| **Initial visibility** | Public immediately | Draft (private) |
| **Recommended for** | Official releases | Testing, pre-releases |
| **Creates git tag** | Yes | Yes (automatically) |
| **Marked as pre-release** | No | Yes (until published) |
| **Requires repo access** | Yes (to create tag) | Yes (to run workflow) |

## Use Cases

### Case 1: Official Desktop Release (v1.0.7)
```bash
# Tag method (recommended)
git tag v1.0.7 -m "Release 1.0.7 - New features"
git push origin v1.0.7
```

### Case 2: Test Installers Before Official Release
1. Run manual workflow with `create_release = true` and tag `v1.0.7-beta`
2. Download and test installers from the draft release
3. If everything works, publish the release or create the official tag

### Case 3: Emergency Release Without Local Tag
1. Run manual workflow with `create_release = true` and tag `v1.0.8-hotfix`
2. Review the draft release
3. Publish when ready

## Why Releases Didn't Appear Previously

The jobs you ran (IDs 20212913793 and 20212718896) were likely:
- ❌ Executed from the `main` branch (no tag)
- ❌ Executed manually (workflow_dispatch)
- ❌ **NOT** triggered by a tag starting with `v*` or `mobile-v*`

Therefore, the "Upload to Release (if tag)" step had this condition:
```yaml
if: startsWith(github.ref, 'refs/tags/')
```

Since `github.ref` was `refs/heads/main` instead of `refs/tags/v1.0.x`, the step **was skipped** and no release was created.

## Artifacts vs Releases

### Artifacts
- Generated in **all** workflow runs
- Duration: **30 days**
- Location: Actions → Workflow Run → Artifacts (bottom of page)
- **Not public**, only for users with repo access

### Releases
- Only created when:
  - Executed from a **tag**, or
  - Executed manually with `create_release = true`
- Duration: **Permanent**
- Location: [Releases](https://github.com/Pabelcorn/LOTOLINK/releases)
- **Public** (once published)

## Troubleshooting

### "I don't see the option to create release in the workflow"
- Ensure you're using the updated version of the workflows
- Verify you're on the correct branch (changes are in the current branch)

### "The release was created but is empty"
- Verify the build completed successfully
- Check the logs of the "Upload to Release" step
- Files must exist at the specified paths

### "I want to delete a draft release"
1. Go to [Releases](https://github.com/Pabelcorn/LOTOLINK/releases)
2. Click on the draft release
3. Click **"Delete"**
4. **Note**: This does NOT delete the git tag

## Best Practices

1. ✅ Use **tags** for official and public releases
2. ✅ Use **manual + draft** for testing and pre-releases
3. ✅ Always test installers before publishing a release
4. ✅ Use consistent tag names (`v1.0.7`, `mobile-v1.0.7`)
5. ✅ Document changes in release notes

## Technical Details

### Changes Made to Workflows

Both `build-installers.yml` and `mobile-build.yml` now have:

1. **New workflow_dispatch inputs:**
   - `create_release`: Boolean flag to enable release creation
   - `release_tag`: String input for the release tag name

2. **Duplicate upload steps:**
   - Original step: Only runs on tag push
   - New step: Runs on manual execution with `create_release = true`
   - New step creates draft/pre-release automatically

3. **Updated conditions:**
   - Release summary job now runs for both tag and manual releases
   - Version extraction logic handles both scenarios

## References

- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [softprops/action-gh-release Documentation](https://github.com/softprops/action-gh-release)
