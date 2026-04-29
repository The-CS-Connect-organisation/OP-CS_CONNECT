# Bugfix Requirements Document

## Introduction

The admin login flow from the unified landing page to the Management Portal is experiencing multiple failures. When users attempt to log in as an admin from the landing page, the credentials are not being auto-filled in the Management Portal login form, the demo password `admin123` is not working, and the backend is returning an authentication error "AUTH_ACCESS_DENIED: ROUTE NOT FOUND: POST /AUTH/LOGIN". This prevents administrators from accessing the Management Portal through the intended unified login experience, forcing them to manually enter credentials and potentially encountering authentication failures.

The academic portal login works correctly with auto-fill functionality, demonstrating that the credential-passing mechanism via sessionStorage is functional. The issue is specific to the Management Portal integration.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user submits the landing page login form with the Management Portal toggle active and valid credentials THEN the system redirects to `/OP-CS_CONNECT/management/#/login` but does not auto-fill the email and password fields

1.2 WHEN a user attempts to log in with the demo admin credentials (admin@schoolsync.edu / admin123) THEN the system returns an authentication error indicating invalid credentials

1.3 WHEN the Management Portal makes a POST request to the authentication endpoint THEN the backend returns "AUTH_ACCESS_DENIED: ROUTE NOT FOUND: POST /AUTH/LOGIN" error

1.4 WHEN the landing page writes credentials to sessionStorage with `portal: 'management'` THEN the Management Portal Login component's useEffect does not successfully read and apply those credentials

### Expected Behavior (Correct)

2.1 WHEN a user submits the landing page login form with the Management Portal toggle active and valid credentials THEN the system SHALL redirect to `/OP-CS_CONNECT/management/#/login` and automatically populate the email and password fields with the submitted credentials

2.2 WHEN a user attempts to log in with the demo admin credentials (admin@schoolsync.edu / admin123) THEN the system SHALL successfully authenticate and grant access to the Management Portal

2.3 WHEN the Management Portal makes a POST request to the authentication endpoint THEN the backend SHALL successfully process the request at `/api/auth/login` and return a valid authentication response

2.4 WHEN the landing page writes credentials to sessionStorage with `portal: 'management'` THEN the Management Portal Login component's useEffect SHALL successfully read those credentials, populate the form fields, clear the sessionStorage key, and automatically submit the login form

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user submits the landing page login form with the Academic Portal toggle active THEN the system SHALL CONTINUE TO redirect to the Academic Portal and auto-fill credentials successfully

3.2 WHEN a user manually navigates to the Management Portal login page without coming from the landing page THEN the system SHALL CONTINUE TO display an empty login form without attempting auto-fill

3.3 WHEN the backend receives a POST request to `/api/auth/login` with valid credentials for any user role THEN the system SHALL CONTINUE TO authenticate successfully and return the appropriate user data

3.4 WHEN sessionStorage contains malformed or absent autofill data THEN the Management Portal SHALL CONTINUE TO render the login form normally without errors
