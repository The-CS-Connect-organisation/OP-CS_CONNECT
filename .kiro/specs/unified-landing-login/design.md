# Design Document: Unified Landing + Login

## Overview

This document describes the technical design for the `unified-landing-login` feature — a new standalone React application (`landing/`) that replaces the static root `index.html` with a visually rich, animated entry point for all SchoolSync users.

The landing app serves three purposes:
1. **Brand showcase** — animated hero and features sections that communicate the platform's value
2. **Unified login** — a single form with a 2-way portal toggle, eliminating the need for users to know which URL to visit
3. **Credential bridge** — sessionStorage-based credential passing so portal login pages can auto-fill and submit on mount

The existing `academics/` and `management/` portals receive minimal, targeted changes: their `Login.jsx` components gain a `useEffect` that reads from `sessionStorage` on mount and auto-submits if credentials are present.

---

## Architecture

```
GitHub Pages: the-cs-connect-organisation.github.io/OP-CS_CONNECT/
│
├── /                          ← landing/ build output (new)
│   └── index.html + assets
│
├── /academics/                ← academics/ build output (unchanged)
│   └── index.html + assets
│
└── /management/               ← management/ build output (unchanged)
    └── index.html + assets
```

### Data Flow: Credential Passing

```
Landing App (login form submit)
  │
  ├─ writes sessionStorage['schoolsync_autofill'] = { email, password, portal }
  │
  └─ window.location.href = '/OP-CS_CONNECT/{portal}/login'
       │
       └─ Portal Login.jsx (useEffect on mount)
            ├─ reads sessionStorage['schoolsync_autofill']
            ├─ validates portal field matches
            ├─ sets email + password state
            ├─ clears sessionStorage key
            └─ calls onLogin(email, password)
```

### Component Tree (Landing App)

```
App
├── Navbar                    (sticky, scroll-aware background)
├── HeroSection               (full-viewport, animated orbs + staggered text)
├── FeaturesSection           (scroll-triggered cards grid)
├── LoginSection              (portal toggle + form + demo credentials)
└── Footer                   (minimal)
```

---

## Components and Interfaces

### Landing App Components

#### `Navbar`
- Sticky positioned, `z-50`
- Tracks scroll position via `useEffect` + `window.addEventListener('scroll', ...)`
- Transitions from `bg-transparent` to `bg-[#0a0a0a]/90 backdrop-blur-md` when `scrollY > 60`
- Contains: SchoolSync logo text + "Sign In" anchor that calls `loginRef.current.scrollIntoView({ behavior: 'smooth' })`

#### `HeroSection`
Props: `{ loginRef: RefObject }`

- Full-viewport (`min-h-screen`) dark background (`#0a0a0a`)
- Two animated background orbs: `motion.div` with `animate={{ x, y }}` on infinite loops using `transition={{ repeat: Infinity, repeatType: 'mirror', duration: N, ease: 'easeInOut' }}`
- Staggered entrance: `motion.div` container with `variants` using `staggerChildren: 0.15`; children animate `opacity: 0 → 1`, `y: 30 → 0`
- Respects `prefers-reduced-motion`: reads `window.matchMedia('(prefers-reduced-motion: reduce)')` and sets orb animation to `{ x: 0, y: 0 }` (static) if true
- CTA button scrolls to `loginRef`

#### `FeaturesSection`
- 8 feature cards (4 academic, 4 management/shared)
- Each card: `motion.div` with `whileInView={{ opacity: 1, y: 0 }}` + `initial={{ opacity: 0, y: 40 }}` + `viewport={{ once: true, margin: '-80px' }}`
- Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Feature data array (static, defined in component file):

```ts
type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  portal: 'academic' | 'management' | 'shared';
}
```

#### `LoginSection`
Props: `{ sectionRef: RefObject }`

State:
```ts
const [portal, setPortal] = useState<'academics' | 'management'>('academics')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [showPassword, setShowPassword] = useState(false)
const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
```

- Portal toggle: two `<button>` elements with `role="group"` wrapper; active state uses `layoutId="toggle-pill"` framer-motion shared layout animation for sliding indicator
- Color theming: academic = `#ff6b9d`, management = `#111111` (applied to active toggle pill + submit button)
- Form submit handler:
  1. Validate email and password (non-empty); set `errors` state if invalid, return early
  2. Write to `sessionStorage`: `sessionStorage.setItem('schoolsync_autofill', JSON.stringify({ email: email.trim().toLowerCase(), password: password.trim(), portal }))`
  3. `window.location.href = \`/OP-CS_CONNECT/${portal}/login\``
- Demo credentials panel: `AnimatePresence` + `motion.div` keyed on `portal` for crossfade transition

#### `DemoCredentialsPanel`
Props: `{ portal: 'academics' | 'management'; onSelect: (email: string, password: string) => void }`

- Renders filtered credential list based on `portal` prop
- Each entry: clickable row that calls `onSelect(cred.email, cred.password)`
- Credential data (hardcoded, demo-only):

```ts
const DEMO_CREDENTIALS = [
  { role: 'student',  email: 'student@schoolsync.edu',  password: 'student123',  portal: 'academics'  },
  { role: 'teacher',  email: 'teacher@schoolsync.edu',  password: 'teacher123',  portal: 'academics'  },
  { role: 'parent',   email: 'parent@schoolsync.edu',   password: 'parent123',   portal: 'academics'  },
  { role: 'admin',    email: 'admin@schoolsync.edu',    password: 'admin123',    portal: 'management' },
]
```

### Portal Modifications

#### `academics/src/pages/Common/Login.jsx` — autofill `useEffect`

```jsx
useEffect(() => {
  const raw = sessionStorage.getItem('schoolsync_autofill');
  if (!raw) return;
  try {
    const { email: e, password: p, portal } = JSON.parse(raw);
    if (portal !== 'academics') return;
    sessionStorage.removeItem('schoolsync_autofill');
    setEmail(e);
    setPassword(p);
    // Trigger submit after state settles
    setTimeout(() => {
      onLogin(e, p).then(result => {
        if (!result.success) setError(result.error);
      });
    }, 0);
  } catch {
    sessionStorage.removeItem('schoolsync_autofill');
  }
}, []);
```

#### `management/src/pages/Common/Login.jsx` — autofill `useEffect`

Identical pattern, with `portal !== 'management'` guard.

---

## Data Models

### `sessionStorage` Autofill Payload

```ts
interface AutofillPayload {
  email: string;      // trimmed, lowercased
  password: string;   // trimmed
  portal: 'academics' | 'management';
}

// Key: 'schoolsync_autofill'
```

### Feature Card Data

```ts
interface FeatureCard {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  portal: 'academic' | 'management' | 'shared';
  accentColor: string;  // hex
}
```

### Demo Credential Entry

```ts
interface DemoCredential {
  role: 'student' | 'teacher' | 'parent' | 'admin';
  email: string;
  password: string;
  portal: 'academics' | 'management';
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Credential storage correctness

*For any* valid email string and password string, when the landing login form is submitted with a given portal selection, the value written to `sessionStorage['schoolsync_autofill']` SHALL be a JSON object containing exactly `{ email, password, portal }` with no extra or missing fields, where `email` is trimmed and lowercased.

**Validates: Requirements 4.8, 4.9, 7.1**

---

### Property 2: Portal-filtered credential display

*For any* portal toggle state (`'academics'` or `'management'`), the demo credentials panel SHALL display only credential entries whose `portal` field matches the current toggle state — never mixing academic and management credentials in the same view.

**Validates: Requirements 5.3, 5.4**

---

### Property 3: Click-to-autofill correctness

*For any* credential entry displayed in the demo credentials panel, clicking that entry SHALL set the email field to exactly that credential's email value and the password field to exactly that credential's password value.

**Validates: Requirements 5.6**

---

### Property 4: Portal autofill round-trip (academics)

*For any* valid `{ email, password, portal: 'academics' }` object stored in `sessionStorage['schoolsync_autofill']`, when the Academic Portal's Login component mounts, it SHALL read those values, populate the form fields with them, clear the `sessionStorage` key, and call `onLogin` with those exact values.

**Validates: Requirements 7.2**

---

### Property 5: Portal autofill round-trip (management)

*For any* valid `{ email, password, portal: 'management' }` object stored in `sessionStorage['schoolsync_autofill']`, when the Management Portal's Login component mounts, it SHALL read those values, populate the form fields with them, clear the `sessionStorage` key, and call `onLogin` with those exact values.

**Validates: Requirements 7.3**

---

### Property 6: Absent or malformed autofill payload is ignored

*For any* absent, null, or structurally invalid value at `sessionStorage['schoolsync_autofill']` (including wrong `portal` field), when a portal Login component mounts, it SHALL render with empty form fields and SHALL NOT call `onLogin` automatically.

**Validates: Requirements 7.4**

---

### Property 7: Validation prevents submission with empty fields

*For any* combination of empty email or empty password (including whitespace-only strings), submitting the landing login form SHALL NOT write to `sessionStorage` and SHALL NOT navigate away — it SHALL instead set a non-empty error message for the offending field.

**Validates: Requirements 4.10, 4.11**

---

## Error Handling

| Scenario | Handling |
|---|---|
| Empty email on submit | Set `errors.email`, return early, no sessionStorage write |
| Empty password on submit | Set `errors.password`, return early, no sessionStorage write |
| `sessionStorage` unavailable (private browsing) | Wrap in try/catch; fall back to URL query params as secondary mechanism |
| Malformed JSON in `schoolsync_autofill` | Catch parse error, call `sessionStorage.removeItem`, render login normally |
| Wrong `portal` field in autofill payload | Guard check (`portal !== 'academics'`), ignore and render normally |
| Portal URL unreachable | Browser handles naturally; no special handling needed in landing app |

---

## Testing Strategy

### Unit / Example Tests

These cover specific behaviors and structural requirements:

- **HeroSection renders**: brand name, tagline, and CTA button are present in the DOM
- **HeroSection background elements**: at least 2 decorative motion elements are rendered
- **FeaturesSection card count**: at least 4 cards rendered, each with icon, title, description
- **FeaturesSection portal coverage**: cards include features from both academic and management domains
- **LoginSection structure**: portal toggle, email input, password input, and submit button are present
- **Portal toggle defaults**: "Academic Portal" is active on initial render
- **Portal toggle switching**: clicking "Management Portal" updates active state; clicking back updates again
- **Password visibility toggle**: clicking the eye button changes input type between `password` and `text`
- **Demo credentials panel presence**: panel is rendered below the form
- **Demo credentials role coverage**: all four roles (student, teacher, parent, admin) are present in the data
- **Semantic HTML**: `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>` are present in the rendered output
- **Label associations**: each form input has a `<label>` with matching `htmlFor`/`id`
- **Reduced motion**: when `prefers-reduced-motion: reduce` is mocked, orb animation values are static

### Property-Based Tests

Using [fast-check](https://github.com/dubzzz/fast-check) (JavaScript PBT library). Each test runs a minimum of **100 iterations**.

Tag format: `// Feature: unified-landing-login, Property {N}: {property_text}`

- **Property 1** — Generate arbitrary email + password strings and both portal values; verify sessionStorage write produces exactly `{ email: email.trim().toLowerCase(), password: password.trim(), portal }` with no extra keys.
- **Property 2** — For each portal value, render `DemoCredentialsPanel` and verify every displayed credential's `portal` field matches the prop.
- **Property 3** — For each credential in the demo data, simulate a click and verify form state equals that credential's email and password exactly.
- **Property 4** — Generate arbitrary email + password strings; write `{ email, password, portal: 'academics' }` to sessionStorage; mount academics `Login`; verify `onLogin` called with those values and sessionStorage key is cleared.
- **Property 5** — Same as Property 4 but for `portal: 'management'` and management `Login`.
- **Property 6** — Generate arbitrary absent/null/malformed/wrong-portal sessionStorage values; mount each portal's `Login`; verify `onLogin` is never called and fields are empty.
- **Property 7** — Generate combinations of empty/whitespace email and/or password; simulate form submit; verify no sessionStorage write and at least one error message is set.

### Integration / Smoke Tests

- **Build output size**: run `npm run build` and verify gzipped output is under 500 KB
- **Vite base path**: verify `vite.config.js` has `base: '/OP-CS_CONNECT/'`
- **Deploy workflow**: verify `deploy.yml` contains landing build + copy steps alongside existing portal steps
- **Lighthouse**: manual audit of production build targeting ≥ 80 performance score
