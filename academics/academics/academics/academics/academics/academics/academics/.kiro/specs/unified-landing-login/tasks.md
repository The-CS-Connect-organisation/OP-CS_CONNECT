# Implementation Plan: Unified Landing + Login

## Overview

Build a standalone Vite + React + Tailwind + framer-motion landing app at `landing/`, wire it into the GitHub Actions deploy workflow, and add sessionStorage autofill `useEffect` hooks to both portal Login pages.

## Tasks

- [x] 1. Scaffold the landing/ Vite + React + Tailwind + framer-motion app
  - Create `landing/package.json`, `landing/vite.config.js`, `landing/postcss.config.js`, `landing/tailwind.config.js`, `landing/index.html`, `landing/src/main.jsx`, `landing/src/App.jsx`, `landing/src/index.css`
  - Configure `base: '/OP-CS_CONNECT/'` in vite.config.js
  - Add framer-motion, lucide-react, react, react-dom, react-router-dom as dependencies
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement Navbar component
  - [x] 2.1 Create `landing/src/components/Navbar.jsx`
    - Sticky, z-50, scroll-aware background transition from transparent to `bg-[#0a0a0a]/90 backdrop-blur-md` at scrollY > 60
    - SchoolSync logo text + "Sign In" anchor that smooth-scrolls to login section
    - Use framer-motion for background transition
    - _Requirements: 6.2, 6.3, 8.1_

- [x] 3. Implement HeroSection component
  - [x] 3.1 Create `landing/src/components/HeroSection.jsx`
    - Full-viewport dark background (#0a0a0a), staggered framer-motion entrance for headline, subtext, CTA
    - Two animated floating gradient orbs using `motion.div` with infinite mirror loops
    - CTA button scrolls to login section via ref
    - Respects `prefers-reduced-motion` — static orbs when reduced motion is set
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [ ]* 3.2 Write property test for reduced-motion orb behavior
    - **Property 6 (partial): Absent/malformed autofill payload is ignored**
    - Mock `prefers-reduced-motion: reduce` and verify orb animation values are static
    - **Validates: Requirements 2.6**

- [x] 4. Implement FeaturesSection component
  - [x] 4.1 Create `landing/src/components/FeaturesSection.jsx`
    - 8 feature cards (4 academic, 4 management/shared) with icon, title, description
    - Glassmorphism card style, scroll-triggered `whileInView` framer-motion entrance
    - Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. Implement DemoCredentialsPanel component
  - [x] 5.1 Create `landing/src/components/DemoCredentialsPanel.jsx`
    - Renders filtered credentials based on `portal` prop (academics: student/teacher/parent; management: admin)
    - Each row is clickable and calls `onSelect(email, password)` to autofill the form
    - AnimatePresence crossfade when portal changes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  - [ ]* 5.2 Write property test for portal-filtered credential display
    - **Property 2: Portal-filtered credential display**
    - For each portal value, verify every displayed credential's portal field matches the prop
    - **Validates: Requirements 5.3, 5.4**
  - [ ]* 5.3 Write property test for click-to-autofill correctness
    - **Property 3: Click-to-autofill correctness**
    - For each credential entry, simulate click and verify form state equals that credential's email and password
    - **Validates: Requirements 5.6**

- [x] 6. Implement LoginSection component
  - [x] 6.1 Create `landing/src/components/LoginSection.jsx`
    - Portal toggle (two buttons, role="group") with framer-motion `layoutId="toggle-pill"` sliding indicator
    - Academic = #ff6b9d accent, Management = #111111 accent
    - Email + password fields with labels (htmlFor/id), password visibility toggle
    - Inline validation errors for empty fields (no sessionStorage write, no redirect)
    - On valid submit: write `schoolsync_autofill` to sessionStorage, redirect to portal login URL
    - Embeds DemoCredentialsPanel below form
    - _Requirements: 4.1–4.11, 5.1–5.6, 6.1, 7.1, 8.2, 8.3_
  - [ ]* 6.2 Write property test for credential storage correctness
    - **Property 1: Credential storage correctness**
    - Generate arbitrary email + password strings and both portal values; verify sessionStorage write produces exactly `{ email: email.trim().toLowerCase(), password: password.trim(), portal }` with no extra keys
    - **Validates: Requirements 4.8, 4.9, 7.1**
  - [ ]* 6.3 Write property test for validation preventing submission with empty fields
    - **Property 7: Validation prevents submission with empty fields**
    - Generate combinations of empty/whitespace email and/or password; verify no sessionStorage write and at least one error message is set
    - **Validates: Requirements 4.10, 4.11**

- [x] 7. Implement Footer component and wire App.jsx
  - [x] 7.1 Create `landing/src/components/Footer.jsx`
    - Minimal footer with SchoolSync branding
    - _Requirements: 8.1_
  - [x] 7.2 Wire all components in `landing/src/App.jsx`
    - Compose Navbar, HeroSection, FeaturesSection, LoginSection, Footer
    - Pass loginRef between HeroSection/Navbar and LoginSection
    - Use semantic HTML: `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`
    - _Requirements: 6.1, 6.2, 8.1_

- [x] 8. Checkpoint — Verify landing app renders correctly
  - Ensure all components are wired, no import errors, app builds without errors
  - Ask the user if questions arise.

- [x] 9. Add sessionStorage autofill useEffect to academics Login.jsx
  - Modify `academics/src/pages/Common/Login.jsx` to add a `useEffect` on mount
  - Read `schoolsync_autofill` from sessionStorage, validate `portal === 'academics'`, set email/password state, clear key, call `onLogin`
  - If key absent or malformed, render normally
  - _Requirements: 7.2, 7.4_
  - [ ]* 9.1 Write property test for academics autofill round-trip
    - **Property 4: Portal autofill round-trip (academics)**
    - Write `{ email, password, portal: 'academics' }` to sessionStorage; mount academics Login; verify `onLogin` called with those values and key is cleared
    - **Validates: Requirements 7.2**

- [x] 10. Add sessionStorage autofill useEffect to management Login.jsx
  - Modify `management/src/pages/Common/Login.jsx` to add identical `useEffect` with `portal === 'management'` guard
  - _Requirements: 7.3, 7.4_
  - [ ]* 10.1 Write property test for management autofill round-trip
    - **Property 5: Portal autofill round-trip (management)**
    - Write `{ email, password, portal: 'management' }` to sessionStorage; mount management Login; verify `onLogin` called with those values and key is cleared
    - **Validates: Requirements 7.3**
  - [ ]* 10.2 Write property test for absent/malformed autofill payload
    - **Property 6: Absent or malformed autofill payload is ignored**
    - Generate arbitrary absent/null/malformed/wrong-portal sessionStorage values; mount each portal's Login; verify `onLogin` is never called and fields are empty
    - **Validates: Requirements 7.4**

- [x] 11. Update GitHub Actions deploy workflow
  - Modify `.github/workflows/deploy.yml` to add landing/ install + build steps
  - Copy `landing/dist/*` to `deploy/` (root) instead of the static HTML
  - Keep academics and management deploy steps unchanged
  - _Requirements: 1.4, 1.5_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
