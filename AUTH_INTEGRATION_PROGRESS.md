# Auth Integration Progress

## Task: Integrate Complete Authentication System from auth-modal.html

### Target Files:
1. index.html (9,349 lines)
2. index mobile.html (8,564 lines)
3. desktop-app/index.html (9,356 lines)

### Features to Integrate:

#### 1. Phone/OTP Authentication ❌ NOT IN INDEX FILES
- Phone number input form
- OTP code sending via backend API
- 6-digit OTP verification
- Resend OTP functionality
- Backend endpoints: `/auth/send-otp`, `/auth/verify-otp`

#### 2. Age Verification (18+) ❌ NOT IN INDEX FILES
- Birth date input form
- Age calculation
- Terms & Conditions checkbox
- Privacy Policy checkbox
- Backend endpoint: `/auth/verify-age`
- **LEGAL REQUIREMENT** for Dominican Republic

#### 3. Guest Mode ❌ NOT IN INDEX FILES
- "Explore as guest" button
- Guest session creation
- Guest restrictions (no purchases)
- Guest-to-registered conversion prompt
- Backend endpoint: `/auth/guest`

#### 4. Google OAuth ❌ NOT IN INDEX FILES
- Google Sign-In button
- Google OAuth client initialization
- ID token exchange with backend
- Backend endpoint: `/auth/google`
- **Note**: Scripts already included in head (line 1563)

#### 5. Apple OAuth ❌ NOT IN INDEX FILES
- Apple Sign-In button
- Apple OAuth client initialization  
- Identity token exchange with backend
- Backend endpoint: `/auth/apple`
- **Note**: Scripts already included in head (line 1564)

#### 6. Multi-step Auth Flow ❌ NOT IN INDEX FILES
- Selection screen (social logins, phone, email, guest)
- Progressive wizard navigation
- State management for each step
- Back buttons between steps

#### 7. Admin Secret Access ✅ PARTIAL IN INDEX FILES
- Current: Hardcoded admin check in simple modal
- Missing: Secret code form (LOT20041227/LOTOLINK2024)
- Missing: Keyboard shortcut (Ctrl+Shift+A)
- Missing: Backend endpoint: `/auth/admin-secret`

### Current Implementation in Index Files:

**What Exists:**
- Basic auth modal with name/email/phone/password inputs
- Admin hardcoded check (email='admin', password='Admin@LotoLink2024')
- Backend API calls to `/auth/register` and `/auth/login`
- OAuth scripts loaded (but not used)

**What's Missing:**
- All 7 features listed above need integration
- Current modal is ~160 lines, needs ~500+ lines replacement
- No multi-step state management
- No OAuth button implementations
- No OTP/phone auth flow
- No age verification
- No guest mode
- No secret admin form

### Integration Plan:

#### Phase 1: State Management ✅ STARTED
- [x] Add authModalView state for multi-step navigation
- [x] Add currentPhone state for OTP flow
- [x] Add currentUserId state for age verification
- [x] Add isGuestMode state for guest tracking

#### Phase 2: Helper Functions (TODO)
- [ ] Add hideAllAuthForms() function
- [ ] Add showAuthSelection() function
- [ ] Add showPhoneAuth() function
- [ ] Add showOTPVerification() function
- [ ] Add showEmailAuth() function
- [ ] Add showAgeVerification() function
- [ ] Add showAdminForm() function

#### Phase 3: API Integration Functions (TODO)
- [ ] Add continueAsGuest() async function
- [ ] Add sendOTP() async function
- [ ] Add verifyOTP() async function
- [ ] Add verifyAge() async function
- [ ] Add signInWithGoogle() async function
- [ ] Add signInWithApple() async function
- [ ] Add validateAdminAccess() async function

#### Phase 4: Modal UI Replacement (TODO)
- [ ] Replace current 160-line modal with comprehensive 500+ line version
- [ ] Add social login buttons (Google, Apple)
- [ ] Add phone auth form
- [ ] Add OTP verification form
- [ ] Add email registration form
- [ ] Add age verification form
- [ ] Add admin secret form
- [ ] Add guest mode button

#### Phase 5: Keyboard Shortcuts (TODO)
- [ ] Add Ctrl+Shift+A for admin access

#### Phase 6: Repeat for Other Files (TODO)
- [ ] Apply all changes to index mobile.html
- [ ] Apply all changes to desktop-app/index.html

### Risks & Considerations:

1. **File Size**: Each file is 8,500-9,500 lines - editing requires precision
2. **JSX Syntax**: Files use React-like JSX in HTML - must maintain syntax
3. **Existing Functionality**: Must not break cart, lottery, payment features
4. **Testing**: Each change needs validation that app still works
5. **OAuth Configuration**: Client IDs need to be configured for prod
6. **Backend Dependency**: All new endpoints must exist and work

### Testing Checklist:

After integration, must test:
- [ ] Simple email/password registration still works
- [ ] Phone/OTP flow works end-to-end
- [ ] Age verification blocks underage users
- [ ] Guest mode allows browsing
- [ ] Guest-to-registered conversion works
- [ ] Google OAuth flow works (with valid client ID)
- [ ] Apple OAuth flow works (with valid client ID)
- [ ] Admin secret access works (Ctrl+Shift+A)
- [ ] Existing features not broken (cart, tickets, profile)

### Current Status: IN PROGRESS

**Completed:**
- ✅ Added multi-step auth state variables to index.html

**Next Steps:**
1. Add all helper functions before modal
2. Replace auth modal implementation
3. Test index.html thoroughly
4. Repeat for index mobile.html
5. Repeat for desktop-app/index.html
6. Commit and report progress

---

**Note**: This is a substantial refactoring affecting ~500 lines per file across 3 files = ~1,500 lines of code changes.
