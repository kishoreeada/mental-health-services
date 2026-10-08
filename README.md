# Stackly — Mental Health Services

A static, responsive multi-page front-end built with HTML, CSS, vanilla JavaScript, bundled fonts, and local assets. Public pages use AOS and GSAP/ScrollTrigger. Dedicated account and dashboard styles keep those interfaces isolated from public-page styling. Dashboard entrance motion respects reduced-motion preferences.

## Run
Open `index.html` directly, or serve the folder with any static server.

## Project organization

See [Project structure](docs/PROJECT-STRUCTURE.md) for the directory map and maintenance guidance. Shared code lives in `assets/css/base/` and `assets/js/core/`; page-specific code lives in their `pages/` directories. Libraries, fonts and licenses are grouped under `assets/vendor/`. HTML pages stay at the root to preserve all existing URLs.

## Pages
- Home (`index.html`)
- About
- Services
- Blog / Wellbeing Journal
- Contact
- Login
- Signup
- Admin Dashboard
- Client Dashboard
- Custom 404

## Dedicated dashboard pages

Every sidebar item has its own HTML page, not an anchor in one long dashboard.

| Area | Client | Admin |
| --- | --- | --- |
| Overview | `client-dashboard.html` | `admin-dashboard.html` |
| Appointments | `client-appointments.html` | `admin-appointments.html` |
| Journey / members | `client-journey.html` | `admin-users.html` |
| Messages | `client-messages.html` | `admin-messages.html` |
| Reading / editorial | `client-resources.html` | `admin-content.html` |
| Settings | `client-settings.html` | `admin-settings.html` |

Dashboard layout is defined in `assets/css/pages/dashboard.css`; mobile drawer and filter behavior live in `assets/js/pages/dashboard.js`. Search and category filters run in memory only. The drawer supports focus containment, Escape, backdrop closing, and responsive resizing. Without JavaScript, the navigation and complete static content remain available.

## Demo authentication

Login accepts a syntactically valid email and a password of 6–128 characters containing at least one letter and one number; symbols are also accepted. Client and Admin choices navigate to their matching public dashboards. Valid signup returns to Login and does not create an account. Only the login email is kept in tab-scoped `sessionStorage` under `stackly.displayEmail` for the header and initial avatar across dashboard pages. Logout removes that key; no password is stored, transmitted, or put in a URL. There is no permanent account storage. Storage-disabled browsers show Guest instead. Serve all pages from the same origin for reliable tab-scoped identity; `file://` storage behavior varies by browser. This is not identity verification or access control. The visible demonstration notices on the account forms have been removed as requested; a secure backend is still required for real authentication.

Dashboard schedules, names, statuses, and counts are fixed fictional examples, not live service data. Settings explain capabilities but do not save changes. Messages are static examples. Dashboard action CTAs open the custom 404 page, preserving the requested demonstration convention; sidebar navigation, Log out, filters, and disclosures remain functional. Existing public journal reading-list behavior is separate from authentication/dashboard storage behavior.

## Important asset note
The shared `assets/icons/stackly-logo.svg` uses the supplied Stackly logo structure, with theme-color presentation. The S favicon is in `assets/icons/favicon.svg`. Photographic-style visuals are local WebP project artwork, not verified portraits of real staff or clients. Confirm asset rights and approved imagery before a real-world launch. No remote image URLs are used.

## Production integration note
This is a front-end demonstration, not a production care service. Contact/newsletter forms need an appropriate secure service before collecting real data. A live client/admin system needs server-side authentication and authorization, appropriate privacy and data handling, and verified calendar/messaging integrations. Never use client-side role selection to protect real administrative functions. Current forms and CTAs intentionally follow the requested demo routing.

## Image assets

The site uses local optimized WebP photographic-style visuals throughout the public pages. Practitioner/client imagery is representative project artwork for this demo and should not be interpreted as photographs of actual Stackly staff or clients.
