# Requirements Document

## Introduction

SchoolSync (CS Connect) currently presents users with two completely separate portals — the Academics Portal (students, teachers, parents) and the Management Portal (admins) — each with its own standalone login screen. This creates a fragmented first impression and forces users to know which URL to navigate to before they can even log in.

This feature replaces the plain root `index.html` landing page with a single, visually stunning React application that serves as the unified entry point for all SchoolSync users. It features an animated landing page with rich visuals and framer-motion animations, followed by a single login section with a 2-way toggle that switches between "Academic Portal" and "Management Portal" destinations. The login form itself is identical for both — only the redirect target changes. Demo credentials are displayed below the toggle for easy access.

The new landing app lives at the root of the GitHub Pages deployment (`/OP-CS_CONNECT/`) and links out to the existing portal sub-paths (`/OP-CS_CONNECT/academics/` and `/OP-CS_CONNECT/management/`).

---

## Glossary

- **Landing_App**: The new standalone React + Vite application deployed at the root path `/OP-CS_CONNECT/`, serving as the unified entry point.
- **Hero_Section**: The full-viewport animated section at the top of the Landing_App that showcases the SchoolSync brand with graphics and motion.
- **Features_Section**: A section of the Landing_App that highlights key capabilities of the SchoolSync platform using animated cards.
- **Login_Section**: The section of the Landing_App containing the portal toggle and login form.
- **Portal_Toggle**: The 2-way UI control within the Login_Section that switches between "Academic Portal" and "Management Portal" modes.
- **Academic_Portal**: The existing React app deployed at `/OP-CS_CONNECT/academics/`, serving students, teachers, and parents.
- **Management_Portal**: The existing React app deployed at `/OP-CS_CONNECT/management/`, serving admins.
- **Demo_Credentials**: The set of sample email/password pairs displayed below the Portal_Toggle to help users try the platform.
- **Redirect**: A browser navigation action that sends the user from the Landing_App to the appropriate portal URL after form submission.
- **Deploy_Workflow**: The GitHub Actions workflow at `.github/workflows/deploy.yml` that builds and publishes all apps to GitHub Pages.

---

## Requirements

### Requirement 1: Unified Landing App Scaffold

**User Story:** As a developer, I want a standalone Vite + React app at the repo root level, so that the landing page can be built, deployed, and maintained independently of the two portals.

#### Acceptance Criteria

1. THE Landing_App SHALL be a standalone Vite + React + Tailwind CSS project located at `landing/` within the repository root.
2. THE Landing_App SHALL include framer-motion as a dependency, consistent with the existing portals.
3. THE Landing_App SHALL be configured with `base: '/OP-CS_CONNECT/'` in its Vite config so asset paths resolve correctly on GitHub Pages.
4. WHEN the Deploy_Workflow runs, THE Deploy_Workflow SHALL build the Landing_App and copy its output to `deploy/` (the root of the published GitHub Pages site).
5. THE Deploy_Workflow SHALL continue to build and deploy the Academic_Portal and Management_Portal at their existing sub-paths without modification.

---

### Requirement 2: Animated Hero Section

**User Story:** As a visitor, I want to see a stunning, animated hero section when I first open the SchoolSync landing page, so that I immediately understand the platform's identity and feel engaged.

#### Acceptance Criteria

1. WHEN the Landing_App loads, THE Hero_Section SHALL be visible as the first full-viewport section.
2. THE Hero_Section SHALL display the SchoolSync brand name, a tagline, and a call-to-action button that scrolls the user to the Login_Section.
3. WHEN the Hero_Section mounts, THE Hero_Section SHALL animate its headline, subtext, and CTA button into view using framer-motion entrance animations with staggered delays between each element.
4. THE Hero_Section SHALL render at least two decorative animated background elements (e.g., floating orbs, gradient meshes, or particle-like shapes) that move continuously using framer-motion or CSS keyframe animations.
5. THE Hero_Section SHALL be fully responsive, maintaining visual integrity on viewport widths from 320px to 1920px.
6. WHEN a user's device has `prefers-reduced-motion: reduce` set, THE Hero_Section SHALL disable or minimise continuous motion animations while preserving layout and content.

---

### Requirement 3: Features Showcase Section

**User Story:** As a prospective user, I want to see what SchoolSync offers before logging in, so that I understand the platform's value.

#### Acceptance Criteria

1. THE Features_Section SHALL display a minimum of 4 feature cards, each with an icon, a title, and a one-line description.
2. WHEN each Features_Section card enters the viewport, THE Features_Section SHALL animate the card into view using a framer-motion scroll-triggered entrance animation.
3. THE Features_Section SHALL cover features relevant to both portals (e.g., Attendance, Grades, Timetable, AI Lab, Communication, Fee Management).
4. THE Features_Section SHALL be fully responsive, displaying cards in a single column on mobile and a multi-column grid on tablet and desktop.

---

### Requirement 4: Unified Login Section with Portal Toggle

**User Story:** As a user, I want a single login form with a clear toggle between Academic and Management portals, so that I don't need to navigate to separate URLs to log in.

#### Acceptance Criteria

1. THE Login_Section SHALL contain the Portal_Toggle and a single login form with email and password fields.
2. THE Portal_Toggle SHALL present exactly two options: "Academic Portal" and "Management Portal".
3. WHEN the Landing_App first loads, THE Portal_Toggle SHALL default to the "Academic Portal" option.
4. WHEN the user selects "Management Portal" on the Portal_Toggle, THE Login_Section SHALL visually update the active toggle state and update the form's destination without reloading the page.
5. WHEN the user selects "Academic Portal" on the Portal_Toggle, THE Login_Section SHALL visually update the active toggle state and update the form's destination without reloading the page.
6. WHEN the Portal_Toggle state changes, THE Login_Section SHALL animate the transition between states using framer-motion (e.g., a sliding indicator or a crossfade).
7. THE Login_Section SHALL display a password visibility toggle button that shows or hides the password field content.
8. WHEN the user submits the login form with the "Academic Portal" toggle active, THE Landing_App SHALL redirect the browser to `/OP-CS_CONNECT/academics/login` appended with the submitted email and password as URL query parameters OR store them in `sessionStorage` so the Academic_Portal can auto-fill and submit the login form.
9. WHEN the user submits the login form with the "Management Portal" toggle active, THE Landing_App SHALL redirect the browser to `/OP-CS_CONNECT/management/login` using the same credential-passing mechanism.
10. IF the email field is empty when the user submits the form, THEN THE Login_Section SHALL display an inline validation error message without redirecting.
11. IF the password field is empty when the user submits the form, THEN THE Login_Section SHALL display an inline validation error message without redirecting.

---

### Requirement 5: Demo Credentials Display

**User Story:** As a demo user or evaluator, I want to see the available test credentials directly on the login page, so that I can try the platform without needing to ask for credentials.

#### Acceptance Criteria

1. THE Login_Section SHALL display a Demo_Credentials panel below the login form.
2. THE Demo_Credentials panel SHALL show at least one credential set per user role: student, teacher, parent, and admin.
3. WHEN the Portal_Toggle is set to "Academic Portal", THE Demo_Credentials panel SHALL show credentials for student, teacher, and parent roles.
4. WHEN the Portal_Toggle is set to "Management Portal", THE Demo_Credentials panel SHALL show credentials for the admin role.
5. WHEN the Portal_Toggle state changes, THE Demo_Credentials panel SHALL animate the transition between credential sets using framer-motion.
6. WHEN a user clicks a Demo_Credentials entry, THE Login_Section SHALL auto-fill the email and password fields with that credential's values.

---

### Requirement 6: Smooth Scroll Navigation

**User Story:** As a visitor on the landing page, I want smooth scrolling between sections, so that the page feels polished and easy to navigate.

#### Acceptance Criteria

1. WHEN the user clicks the Hero_Section CTA button, THE Landing_App SHALL smoothly scroll the viewport to the Login_Section.
2. THE Landing_App SHALL include a minimal sticky navigation bar with the SchoolSync logo and a "Sign In" link that scrolls to the Login_Section.
3. WHEN the user scrolls past the Hero_Section, THE Landing_App SHALL animate the navigation bar to a solid background state using framer-motion or a CSS transition.

---

### Requirement 7: Credential Passing to Portal Login Pages

**User Story:** As a developer, I want the credential-passing mechanism between the landing page and the portal login pages to be consistent and secure for a demo environment, so that the auto-fill experience works reliably.

#### Acceptance Criteria

1. THE Landing_App SHALL pass credentials to the target portal by writing `{ email, password, portal }` to `sessionStorage` under the key `schoolsync_autofill` immediately before redirecting.
2. WHEN the Academic_Portal's Login page mounts and `sessionStorage` key `schoolsync_autofill` is present with `portal: 'academics'`, THE Academic_Portal SHALL read the values, auto-fill the form fields, clear the `sessionStorage` key, and automatically submit the login form.
3. WHEN the Management_Portal's Login page mounts and `sessionStorage` key `schoolsync_autofill` is present with `portal: 'management'`, THE Management_Portal SHALL read the values, auto-fill the form fields, clear the `sessionStorage` key, and automatically submit the login form.
4. IF the `sessionStorage` key `schoolsync_autofill` is absent or malformed when a portal Login page mounts, THEN THE portal Login page SHALL render normally without auto-fill.

---

### Requirement 8: Accessibility and Performance

**User Story:** As a user with accessibility needs, I want the landing page to be navigable and readable, so that I can use SchoolSync regardless of my abilities.

#### Acceptance Criteria

1. THE Landing_App SHALL use semantic HTML elements (`<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`) for all major page regions.
2. THE Login_Section form fields SHALL each have an associated `<label>` element linked via `htmlFor` / `id`.
3. THE Portal_Toggle SHALL be implemented using accessible button or radio-group semantics so that keyboard users can switch between options using Tab and Enter/Space keys.
4. THE Landing_App SHALL achieve a Lighthouse Performance score of 80 or above on a standard desktop audit of the production build.
5. WHEN the Landing_App is built for production, THE Landing_App build output SHALL be under 500 KB (gzipped) excluding font assets.
