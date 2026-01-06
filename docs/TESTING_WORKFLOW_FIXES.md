# Testing Guide for Workflow Fixes

This guide provides step-by-step instructions to test the artifact upload and download fixes.

## Prerequisites

- Access to the GitHub repository
- GitHub CLI installed (optional, for CLI testing)
- Ability to trigger workflow runs

## Test Plan

### Test 1: Mobile Build Workflow

#### 1.1 Trigger the Workflow

**Via GitHub UI:**
1. Go to https://github.com/Pabelcorn/LOTOLINK/actions
2. Click "Build Mobile Installers" workflow
3. Click "Run workflow" dropdown
4. Select branch: `copilot/fix-workflows-for-android-and-lotolink`
5. Select platforms: `all`
6. Click "Run workflow"

**Via GitHub CLI:**
```bash
gh workflow run mobile-build.yml \
  --ref copilot/fix-workflows-for-android-and-lotolink \
  -f platforms=all
```

#### 1.2 Monitor the Workflow

1. Wait for the workflow to complete (approximately 30-45 minutes)
2. Check for green checkmarks on all jobs:
   - ✓ quality-checks
   - ✓ build-android
   - ✓ build-ios (may have warnings, that's OK)

#### 1.3 Verify Build Summary

1. Click on the workflow run
2. Check the "Get APK/AAB info" step output
3. Verify it shows:
   - Debug APK size and SHA256
   - Release AAB info (if built)
   - Download instructions section

Expected output:
```
### Build Artifacts Information

**Debug APK:**
- Size: ~6-7 MB
- SHA256: `<64-character hash>`

### 📥 Download Artifacts

Artifacts are available for **30 days** after the workflow run.

To download:
1. Go to the [Actions tab]...
2. Select this workflow run
3. Scroll down to the **Artifacts** section
4. Click on the artifact name to download
```

#### 1.4 Download and Verify Artifacts

1. Scroll down to the **Artifacts** section
2. Verify the following artifacts are present:
   - `android-debug-apk` (~6-7 MB)
   - `android-release-aab` (~5-6 MB) - may not be present if unsigned
   - `ios-app-bundle` (~4-5 MB) - may not be present if build failed
   - `ios-build-info` (< 1 KB)
   - `mobile-coverage` (varies)

3. Click on `android-debug-apk` to download
4. Extract the ZIP file
5. Verify `app-debug.apk` is inside
6. Calculate SHA256:
   ```bash
   sha256sum app-debug.apk
   ```
7. Compare with the SHA256 shown in the workflow summary

#### 1.5 Verify Retention Period

1. Hover over the artifact name
2. Check the expiration date
3. Verify it's approximately 30 days from the upload date

### Test 2: Desktop Build Workflow

#### 2.1 Trigger the Workflow

**Via GitHub UI:**
1. Go to https://github.com/Pabelcorn/LOTOLINK/actions
2. Click "Build Desktop Installers" workflow
3. Click "Run workflow" dropdown
4. Select branch: `copilot/fix-workflows-for-android-and-lotolink`
5. Select platforms: `all`
6. Click "Run workflow"

**Via GitHub CLI:**
```bash
gh workflow run build-installers.yml \
  --ref copilot/fix-workflows-for-android-and-lotolink \
  -f platforms=all
```

#### 2.2 Monitor the Workflow

Wait for completion and check for:
- ✓ build-windows
- ✓ build-macos
- ✓ build-linux

#### 2.3 Verify Installers

Download and verify each installer:

**Windows:**
1. Download `windows-installer`
2. Extract and verify `.exe` file exists
3. Check file size is reasonable (>10 MB)

**macOS:**
1. Download `macos-installer`
2. Extract and verify `.dmg` and/or `.zip` exist
3. Check file sizes

**Linux:**
1. Download `linux-installers`
2. Extract and verify `.AppImage`, `.deb`, and `.rpm` exist
3. Check file sizes

#### 2.4 Verify Retention Period

All desktop installers should have 30-day retention.

### Test 3: Cleanup Workflow Behavior

#### 3.1 Verify Cleanup Schedule

1. Check `.github/workflows/cleanup-artifacts.yml`
2. Verify schedule is: `cron: '0 0 * * 0'` (weekly, not daily)
3. Verify default `DAYS_TO_KEEP: 30`

#### 3.2 Test Cleanup Logic (Optional)

**WARNING: This will delete old artifacts!**

```bash
# Dry run first (check what would be deleted)
gh workflow run cleanup-artifacts.yml \
  --ref copilot/fix-workflows-for-android-and-lotolink \
  -f days_to_keep=30
```

Monitor the workflow run and check the logs:
- Should skip installer artifacts
- Should skip release summaries
- Should only delete old logs/coverage

### Test 4: Failure Scenarios

Test that the verification steps work correctly.

#### 4.1 Missing APK Test (Simulated)

This would happen if Gradle build failed. The workflow should:
1. Run the "Verify APK exists before upload" step
2. Fail with clear error message
3. Not upload a non-existent artifact

Expected behavior:
```
❌ ERROR: app-debug.apk not found!
Build outputs:
No APK/AAB files found
```

#### 4.2 Verification Logic Test

The verification steps should:
- ✓ Pass if required files exist
- ✗ Fail with clear message if files missing
- Show file sizes when successful

### Test 5: CI/CD Workflow

#### 5.1 Trigger on PR

1. Create a test PR to merge this branch
2. Verify CI/CD workflow runs
3. Check artifact retention periods:
   - `coverage`: 14 days
   - `backend-dist`: 14 days
   - `e2e-report`: 14 days

## Expected Results Summary

### ✅ Success Criteria

All of the following should be true:

1. **Retention Periods**:
   - Mobile installers: 30 days ✓
   - Desktop installers: 30 days ✓
   - Coverage reports: 14 days ✓
   - Release summaries: 90 days ✓

2. **Artifact Availability**:
   - All artifacts appear in the Artifacts section ✓
   - Files can be downloaded ✓
   - Downloaded files are valid (correct format) ✓
   - SHA256 checksums match ✓

3. **Error Handling**:
   - Missing files fail with clear errors ✓
   - Upload failures are visible (not silent) ✓
   - Verification steps show file info ✓

4. **Documentation**:
   - Download instructions appear in summaries ✓
   - Artifact sizes shown ✓
   - Checksums displayed ✓

5. **Cleanup Behavior**:
   - Runs weekly (not daily) ✓
   - Preserves installer artifacts ✓
   - Only deletes old logs/coverage ✓

### ❌ Failure Indicators

If any of these occur, the fix has issues:

1. Artifacts expire before 30 days
2. Artifacts missing from Artifacts section
3. Downloads fail or produce corrupt files
4. Silent failures (workflow succeeds but no artifacts)
5. Cleanup deletes installer artifacts prematurely
6. No download instructions in summary
7. Verification steps don't run or fail incorrectly

## Rollback Procedure

If critical issues are found:

```bash
# Revert the changes
git revert HEAD~4..HEAD

# Push the revert
git push origin copilot/fix-workflows-for-android-and-lotolink

# Or create a new PR from the base branch
```

## Performance Metrics

Monitor these after deploying:

1. **Workflow Success Rate**: Should remain stable or improve
2. **Artifact Storage**: May increase (expected, due to longer retention)
3. **Download Success Rate**: Should improve
4. **Build Times**: Should be minimally affected (<1 minute overhead for verification)

## Checklist

Use this checklist when testing:

- [ ] Mobile workflow triggered successfully
- [ ] Mobile workflow completed successfully
- [ ] Android APK artifact available
- [ ] Android APK downloads correctly
- [ ] APK SHA256 matches workflow output
- [ ] APK retention is 30 days
- [ ] iOS artifacts available (if build succeeded)
- [ ] Desktop workflow triggered successfully
- [ ] Windows installer available
- [ ] macOS installer available
- [ ] Linux installers available
- [ ] All desktop installers have 30-day retention
- [ ] Download instructions visible in summaries
- [ ] Cleanup workflow has correct schedule (weekly)
- [ ] Cleanup workflow has correct retention (30 days)
- [ ] No security vulnerabilities (CodeQL passed)
- [ ] All YAML files are valid

## Automated Testing (Future)

Consider adding automated tests for:

1. **Workflow Validation**: YAML syntax checks in CI
2. **Artifact Verification**: Script to verify artifacts exist after build
3. **Retention Testing**: Alert if retention < expected
4. **Download Testing**: Automated download and checksum verification

## Support

If issues are found during testing:

1. Document the issue with:
   - Workflow run URL
   - Expected behavior
   - Actual behavior
   - Screenshots if applicable

2. Check troubleshooting guides:
   - `.github/WORKFLOW_TROUBLESHOOTING.md`
   - `.github/ARTIFACT_DOWNLOAD_GUIDE.md`
   - `WORKFLOW_ARTIFACT_FIX_SUMMARY.md`

3. Create an issue or contact the team

## Next Steps After Testing

Once testing is complete and successful:

1. Merge the PR
2. Monitor the main branch workflows
3. Update documentation if needed
4. Consider implementing automated testing
5. Plan code signing implementation
6. Set up release automation

---

**Version**: 1.0  
**Last Updated**: December 14, 2024  
**Related Files**:
- `.github/workflows/mobile-build.yml`
- `.github/workflows/build-installers.yml`
- `.github/workflows/ci-cd.yml`
- `.github/workflows/cleanup-artifacts.yml`
